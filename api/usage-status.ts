/**
 * Vercel Edge Function для получения текущего статуса использования
 * Используется UI компонентом UsageCounter
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

interface PurchaseData {
  id: string;
  package: string;
  purchaseToken: string;
  amount: number;
  date: string;
  verified: boolean;
}

interface ResponseData {
  success: boolean;
  usage: {
    used: number;
    total: number;
    remaining: number;
  };
  purchases: PurchaseData[];
}

export default async function handler(req: Request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Только GET запросы
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Получаем deviceId из query параметров
    const url = new URL(req.url);
    const deviceId = url.searchParams.get('deviceId');

    // Валидация
    if (!deviceId) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: deviceId required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const usageKey = `usage:${deviceId}`;
    const purchasesKey = `purchases:${deviceId}`;

    // Получаем данные из KV
    const [usage, purchases] = await Promise.all([
      kv.get<UsageData>(usageKey),
      kv.get<PurchaseData[]>(purchasesKey),
    ]);

    // Если пользователь новый - инициализируем
    if (!usage) {
      const newUsage: UsageData = {
        used: 0,
        total: 10,
        lastReset: new Date().toISOString(),
      };
      await kv.set(usageKey, newUsage);

      return new Response(
        JSON.stringify({
          success: true,
          usage: {
            used: 0,
            total: 10,
            remaining: 10,
          },
          purchases: [],
        } as ResponseData),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Возвращаем статус
    return new Response(
      JSON.stringify({
        success: true,
        usage: {
          used: usage.used,
          total: usage.total,
          remaining: usage.total - usage.used,
        },
        purchases: purchases || [],
      } as ResponseData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in usage-status:', error);

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
