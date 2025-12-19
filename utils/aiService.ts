import axios, { AxiosError } from 'axios';
import { API_CONFIG, SYSTEM_PROMPT, IMAGE_SYSTEM_PROMPT } from '@/constants/apiConfig';
import { convertImageToBase64, getImageMimeType } from './imageUtils';
import { getUserPreferences, getPreferencesPromptText } from './userPreferences';
import { checkAllConflicts, parseAIResponse } from './aiHelpers';
import type { AIResponse } from '@/types';

/**
 * Константы timeout для запросов
 */
const TIMEOUT_TEXT_REQUEST = 70000; // 70 секунд для текстовых запросов
const TIMEOUT_VISION_REQUEST = 180000; // 3 минуты для vision запросов

/**
 * Типы для контента сообщения (text или multimodal с изображением)
 */
type TextContent = {
  type: 'text';
  text: string;
};

type ImageContent = {
  type: 'image_url';
  image_url: {
    url: string;
  };
};

type MessageContent = string | (TextContent | ImageContent)[];

/**
 * Обрабатывает ошибки запросов к AI
 */
function handleAIError(error: unknown): AIResponse {
  console.error('❌ Error in getRecipesFromAI:', error);

  // Обработка timeout ошибок
  if (error instanceof Error && (error.message === 'Request timeout' || error.name === 'AbortError')) {
    return {
      success: false,
      error: 'Запрос занял слишком много времени. Попробуйте упростить запрос или повторите позже.',
    };
  }

  // Обработка сетевых ошибок
  if (error instanceof Error && error.message === 'Network error') {
    return {
      success: false,
      error: 'Нет связи с сервером. Проверьте интернет-соединение.',
    };
  }

  // Обработка ошибок Axios
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      const status = axiosError.response.status;
      console.error('API Response Error:', status, axiosError.response.data);

      // Маппинг HTTP статусов на понятные сообщения
      const errorMessages: Record<number, string> = {
        504: 'Запрос занял слишком много времени. Попробуйте упростить запрос или повторите позже.',
        429: 'Превышен лимит запросов к AI. Подождите немного и попробуйте снова через 1-2 минуты.',
        402: 'Сервис временно недоступен. Попробуйте позже.',
      };

      return {
        success: false,
        error: errorMessages[status] || `Ошибка сервиса: ${status}`,
      };
    }

    if (axiosError.request) {
      console.error('No response from server:', axiosError.request);

      // Проверка на timeout
      if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
        return {
          success: false,
          error: 'Запрос занял слишком много времени. Попробуйте упростить запрос или повторите позже.',
        };
      }

      return {
        success: false,
        error: 'Нет связи с сервером. Проверьте интернет-соединение.',
      };
    }
  }

  // Неизвестная ошибка
  console.error('Unknown error:', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Неизвестная ошибка',
  };
}

/**
 * Отправляет запрос к AI через Vercel Edge Function
 * @param ingredients - строка с перечислением продуктов (может быть пустой, если есть изображение)
 * @param imageUri - опциональный URI изображения для анализа
 * @param userLanguage - язык пользователя для ответа AI (ru или en)
 * @param signal - опциональный AbortSignal для отмены запроса
 * @returns объект с рецептами или ошибкой
 */
export async function getRecipesFromAI(
  ingredients: string,
  imageUri?: string,
  userLanguage: string = 'ru',
  signal?: AbortSignal
): Promise<AIResponse> {
  try {
    // Проверка: должен быть либо текст, либо изображение
    if ((!ingredients || ingredients.trim().length === 0) && !imageUri) {
      return {
        success: false,
        error: 'Пожалуйста, укажите продукты или загрузите изображение',
      };
    }

    // Загружаем настройки пользователя
    const userPreferences = await getUserPreferences();

    // Проверяем конфликты между вводом пользователя и настройками (аллергены + диета)
    const conflictWarning = checkAllConflicts(ingredients, userPreferences);
    if (conflictWarning) {
      return {
        success: false,
        error: conflictWarning,
      };
    }

    const preferencesText = getPreferencesPromptText(userPreferences, userLanguage);

    // Подготавливаем контент сообщения
    let messageContent: MessageContent;

    if (imageUri) {
      // Если есть изображение, используем multimodal формат
      try {
        const base64Image = await convertImageToBase64(imageUri);
        const mimeType = getImageMimeType(imageUri);
        const prompt = IMAGE_SYSTEM_PROMPT(ingredients.trim() || undefined, preferencesText, userLanguage);

        messageContent = [
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ];
      } catch (error) {
        console.error('Error processing image:', error);
        return {
          success: false,
          error: `Не удалось обработать изображение: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        };
      }
    } else {
      // Если только текст, используем обычный формат
      messageContent = SYSTEM_PROMPT(ingredients, preferencesText, userLanguage);
    }

    // Выбираем модель в зависимости от типа запроса
    const modelToUse = imageUri ? API_CONFIG.VISION_MODEL : API_CONFIG.MODEL;

    // Увеличиваем лимит токенов для vision запросов
    const maxTokens = imageUri ? 1500 : API_CONFIG.MAX_TOKENS;

    // Vision запросы обрабатываются дольше
    const requestTimeout = imageUri ? TIMEOUT_VISION_REQUEST : TIMEOUT_TEXT_REQUEST;

    // Подготавливаем тело запроса
    const requestBody = {
      model: modelToUse,
      messages: [
        {
          role: 'user',
          content: messageContent,
        },
      ],
      max_tokens: maxTokens,
      temperature: API_CONFIG.TEMPERATURE,
    };

    // Отправляем запрос к Vercel Edge Function
    const response = await axios.post(
      API_CONFIG.EDGE_FUNCTION_URL,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: requestTimeout,
        signal, // Поддержка отмены запроса
      }
    );

    // Проверяем ответ от API
    if (!response.data?.choices?.[0]?.message?.content) {
      return {
        success: false,
        error: 'Не удалось получить ответ от AI',
      };
    }

    const aiText = response.data.choices[0].message.content;

    // Парсим ответ AI для извлечения приветствия и рецептов
    const { greeting, recipes } = parseAIResponse(aiText);

    if (recipes.length === 0) {
      return {
        success: true,
        greeting: greeting || aiText, // Возвращаем приветствие или весь текст
      };
    }

    return {
      success: true,
      recipes,
      greeting,
    };

  } catch (error) {
    return handleAIError(error);
  }
}
