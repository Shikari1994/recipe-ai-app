/**
 * Vercel Edge Function для восстановления покупок
 * Вызывается при переустановке приложения или нажатии "Восстановить покупки"
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

interface RequestBody {
  deviceId: string;
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

    const { deviceId } = body;
    const usageKey = `usage:${deviceId}`;
    const purchasesKey = `purchases:${deviceId}`;

    // Получаем покупки
    const purchases = await kv.get<PurchaseData[]>(purchasesKey);

    if (!purchases || purchases.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          restored: false,
          purchases: [],
          totalRequests: 10,
          message: 'No purchases found',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Пересчитываем total = 10 (бесплатных) + сумма покупок
    const purchasedAmount = purchases.reduce((sum, p) => sum + p.amount, 0);
    const newTotal = 10 + purchasedAmount;

    // Получаем текущий usage
    const usage = await kv.get<UsageData>(usageKey);

    // Обновляем total, но сохраняем used
    const updatedUsage: UsageData = {
      used: usage?.used || 0,
      total: newTotal,
      lastReset: usage?.lastReset || new Date().toISOString(),
    };

    await kv.set(usageKey, updatedUsage);

    console.log(`🔄 Purchases restored for ${deviceId}: ${purchases.length} purchases, total: ${newTotal}`);

    return new Response(
      JSON.stringify({
        success: true,
        restored: true,
        purchases,
        totalRequests: newTotal,
        message: `Restored ${purchases.length} purchase(s)`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in purchase-restore:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
