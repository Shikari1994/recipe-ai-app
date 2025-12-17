/**
 * Vercel Edge Function для проверки и инкремента лимита запросов
 * Вызывается перед каждым AI запросом
 */

import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

interface UsageData {
  used: number;
  total: number;
  lastReset: string;
}

interface RequestBody {
  deviceId: string;
}

interface ResponseData {
  allowed: boolean;
  remaining: number;
  total: number;
  used: number;
  message?: string;
}

export default async function handler(req: Request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  // Обработка preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Только POST запросы
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Парсим тело запроса
    const body: RequestBody = await req.json();

    // Валидация
    if (!body.deviceId || typeof body.deviceId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: deviceId required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { deviceId } = body;
    const usageKey = `usage:${deviceId}`;

    // Получаем текущее использование из KV
    let usage = await kv.get<UsageData>(usageKey);

    // Если пользователь новый - инициализируем
    if (!usage) {
      usage = {
        used: 0,
        total: 10, // 10 бесплатных запросов
        lastReset: new Date().toISOString(),
      };
      await kv.set(usageKey, usage);
      console.log(`✨ New user initialized: ${deviceId} with ${usage.total} free requests`);
    }

    // Проверяем лимит
    if (usage.used >= usage.total) {
      console.log(`⛔ Limit reached for ${deviceId}: ${usage.used}/${usage.total}`);

      return new Response(
        JSON.stringify({
          allowed: false,
          remaining: 0,
          total: usage.total,
          used: usage.used,
          message: 'Лимит исчерпан. Купите пакет запросов.',
        } as ResponseData),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Инкрементируем счетчик
    usage.used += 1;
    await kv.set(usageKey, usage);

    const remaining = usage.total - usage.used;
    console.log(`✅ Request allowed for ${deviceId}: ${remaining} remaining (${usage.used}/${usage.total})`);

    return new Response(
      JSON.stringify({
        allowed: true,
        remaining,
        total: usage.total,
        used: usage.used,
      } as ResponseData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in usage-check:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
