/**
 * Vercel Edge Function для инициализации нового пользователя
 * Вызывается один раз при первом запуске приложения
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
  platform?: string;
}

export default async function handler(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: RequestBody = await req.json();

    if (!body.deviceId) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: deviceId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { deviceId, platform = 'unknown' } = body;
    const usageKey = `usage:${deviceId}`;

    // Проверяем существует ли уже
    const existing = await kv.get<UsageData>(usageKey);

    if (existing) {
      // Уже инициализирован
      return new Response(
        JSON.stringify({
          success: true,
          usage: {
            used: existing.used,
            total: existing.total,
            remaining: existing.total - existing.used,
          },
          message: 'Already initialized',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Создаем нового пользователя с 10 бесплатными запросами
    const newUsage: UsageData = {
      used: 0,
      total: 10,
      lastReset: new Date().toISOString(),
    };

    await kv.set(usageKey, newUsage);

    console.log(`✨ Initialized new user: ${deviceId} (${platform}) with 10 free requests`);

    return new Response(
      JSON.stringify({
        success: true,
        usage: {
          used: 0,
          total: 10,
          remaining: 10,
        },
        message: 'Initialized successfully',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in usage-initialize:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
