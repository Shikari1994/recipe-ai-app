/**
 * Cloudflare Worker для проксирования запросов к OpenRouter API
 * Этот worker скрывает API ключ от клиентов
 */

// CORS headers для разрешения запросов из приложения
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Основная функция обработки запросов
export default {
  async fetch(request, env) {
    // Обработка preflight запросов (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Разрешаем только POST запросы
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      // Парсим тело запроса
      const body = await request.json();

      // Валидация входных данных
      if (!body.messages || !Array.isArray(body.messages)) {
        return new Response(JSON.stringify({
          error: 'Invalid request: messages array is required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Ограничение размера запроса (защита от злоупотреблений)
      const requestSize = JSON.stringify(body).length;
      if (requestSize > 500000) { // 500KB лимит
        return new Response(JSON.stringify({
          error: 'Request too large'
        }), {
          status: 413,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Подготовка запроса к OpenRouter
      const openRouterRequest = {
        model: body.model || 'google/gemini-2.5-flash-lite',
        messages: body.messages,
        max_tokens: body.max_tokens || 1000,
        temperature: body.temperature || 0.7,
      };

      // Отправка запроса к OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://recipe-ai-app.com',
          'X-Title': 'AI Recipe Assistant',
        },
        body: JSON.stringify(openRouterRequest),
      });

      // Получаем ответ от OpenRouter
      const data = await response.json();

      // Логирование для отладки (опционально, можно убрать в продакшене)
      console.log('OpenRouter response status:', response.status);

      // Возвращаем ответ клиенту
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });

    } catch (error) {
      // Обработка ошибок
      console.error('Worker error:', error);

      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
