import Constants from 'expo-constants';

// API конфигурация
export const API_CONFIG = {
  // URL Cloudflare Worker (замените на ваш после деплоя)
  // Пример: 'https://recipe-ai-proxy.your-subdomain.workers.dev'
  WORKER_URL: Constants.expoConfig?.extra?.workerUrl || 'https://your-worker-url.workers.dev',

  MODEL: 'google/gemini-2.5-flash-lite', // Gemini 2.5 Flash Lite для текстовых запросов
  // Для vision используем ту же модель 2.5 Flash Lite - она поддерживает изображения!
  VISION_MODEL: 'google/gemini-2.5-flash-lite',
  // Альтернативные модели vision:
  // 'google/gemini-flash-1.5-8b' - Gemini 1.5 Flash 8B
  // 'google/gemini-pro-vision' - более мощная, но платная
  // 'openai/gpt-4o-mini' - альтернатива от OpenAI
  MAX_TOKENS: 1000, // Ограничиваем для экономии
  TEMPERATURE: 0.7,
};

// Системный промпт для AI (текстовый поиск)
export const SYSTEM_PROMPT = (ingredients: string, preferencesText?: string, userLanguage?: string) => {
  // Определяем язык для ответа на основе языка интерфейса
  const languageInstruction = userLanguage === 'en'
    ? 'IMPORTANT: Respond in English.'
    : 'ВАЖНО: Отвечай на русском языке.';

  let prompt = userLanguage === 'en'
    ? `You are a cooking assistant. The user has: ${ingredients}`
    : `Ты кулинарный помощник. У пользователя есть: ${ingredients}`;

  if (preferencesText) {
    const criticalHeader = userLanguage === 'en'
      ? '🚨 CRITICALLY IMPORTANT - MANDATORY REQUIREMENTS:'
      : '🚨 КРИТИЧЕСКИ ВАЖНО - ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ:';
    const requirementNote = userLanguage === 'en'
      ? 'These requirements MUST be taken into account in ALL recipes without exceptions!'
      : 'Эти требования ДОЛЖНЫ быть учтены во ВСЕХ рецептах без исключений!';

    prompt += `\n\n${criticalHeader}\n${preferencesText}\n${requirementNote}`;
  }

  const formatInstruction = userLanguage === 'en'
    ? `IMPORTANT: The response must be strictly in the following format (without greeting):

### Recipe Name
**Cooking time:** X minutes
**Calories:** approximately Y kcal per serving

**Steps:**
1. First step
2. Second step
3. Third step
...

---

Suggest 2-4 simple and quick recipes. If some ingredients are missing, indicate them in the steps as optional. Be sure to indicate the approximate number of calories per serving.`
    : `ВАЖНО: Ответ должен быть строго в следующем формате (без приветствия):

### Название рецепта
**Время приготовления:** X минут
**Калории:** примерно Y ккал на порцию

**Шаги:**
1. Первый шаг
2. Второй шаг
3. Третий шаг
...

---

Предложи 2-4 простых и быстрых рецепта. Если каких-то ингредиентов не хватает, укажи их в шагах как необязательные. Обязательно укажи примерное количество калорий на порцию.`;

  return `${prompt}\n\n${languageInstruction}\n\n${formatInstruction}`;
};

// Системный промпт для AI (поиск по изображению)
export const IMAGE_SYSTEM_PROMPT = (additionalText?: string, preferencesText?: string, userLanguage?: string) => {
  const languageInstruction = userLanguage === 'en'
    ? 'IMPORTANT: Respond in English.'
    : 'ВАЖНО: Отвечай на русском языке.';

  let prompt = userLanguage === 'en'
    ? `You are a cooking assistant. Analyze the image and identify what products or dishes are in it.`
    : `Ты кулинарный помощник. Проанализируй изображение и определи, какие продукты или блюда на нем находятся.`;

  if (additionalText) {
    const additionalInfo = userLanguage === 'en'
      ? ` Additional information from the user: ${additionalText}`
      : ` Дополнительная информация от пользователя: ${additionalText}`;
    prompt += additionalInfo;
  }

  if (preferencesText) {
    const criticalHeader = userLanguage === 'en'
      ? '🚨 CRITICALLY IMPORTANT - MANDATORY REQUIREMENTS:'
      : '🚨 КРИТИЧЕСКИ ВАЖНО - ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ:';
    const requirementNote = userLanguage === 'en'
      ? 'These requirements MUST be taken into account in ALL recipes without exceptions!'
      : 'Эти требования ДОЛЖНЫ быть учтены во ВСЕХ рецептах без исключений!';

    prompt += `\n\n${criticalHeader}\n${preferencesText}\n${requirementNote}`;
  }

  const formatInstruction = userLanguage === 'en'
    ? `IMPORTANT: The response must be strictly in the following format (without greeting):

### Recipe Name
**Cooking time:** X minutes
**Calories:** approximately Y kcal per serving

**Steps:**
1. First step
2. Second step
3. Third step
...

---

Suggest 2-4 simple and quick recipes based on the products you see in the image. If some ingredients are missing, indicate them in the steps as optional. Be sure to indicate the approximate number of calories per serving.`
    : `ВАЖНО: Ответ должен быть строго в следующем формате (без приветствия):

### Название рецепта
**Время приготовления:** X минут
**Калории:** примерно Y ккал на порцию

**Шаги:**
1. Первый шаг
2. Второй шаг
3. Третий шаг
...

---

Предложи 2-4 простых и быстрых рецепта на основе продуктов, которые ты видишь на изображении. Если каких-то ингредиентов не хватает, укажи их в шагах как необязательные. Обязательно укажи примерное количество калорий на порцию.`;

  return `${prompt}\n\n${languageInstruction}\n\n${formatInstruction}`;
};
