/**
 * Vercel Edge Function для проверки и обработки покупки
 * Вызывается после успешной покупки через RuStore/NashStore
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
  purchaseToken: string;
  packageType: string;
  orderId: string;
}

// Пакеты и их значения
const PACKAGE_AMOUNTS: Record<string, number> = {
  'package_50': 50,
  'package_100': 100,
  'package_200': 200,
};

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

    // Валидация
    if (!body.deviceId || !body.purchaseToken || !body.packageType || !body.orderId) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { deviceId, purchaseToken, packageType, orderId } = body;

    // Проверяем валидность пакета
    const amount = PACKAGE_AMOUNTS[packageType];
    if (!amount) {
      return new Response(
        JSON.stringify({ error: 'Invalid package type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TODO: В будущем здесь добавить реальную проверку через RuStore API
    // const isValid = await verifyRuStorePurchase(purchaseToken);
    // Сейчас для mock - всегда true
    const isValid = true;

    if (!isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Purchase verification failed',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const usageKey = `usage:${deviceId}`;
    const purchasesKey = `purchases:${deviceId}`;

    // Получаем текущие данные
    const [usage, purchases] = await Promise.all([
      kv.get<UsageData>(usageKey),
      kv.get<PurchaseData[]>(purchasesKey),
    ]);

    // Проверяем дубликаты покупок
    const existingPurchases = purchases || [];
    const isDuplicate = existingPurchases.some(p => p.purchaseToken === purchaseToken);

    if (isDuplicate) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Purchase already processed',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Создаем новую покупку
    const newPurchase: PurchaseData = {
      id: orderId,
      package: packageType,
      purchaseToken,
      amount,
      date: new Date().toISOString(),
      verified: true,
    };

    // Обновляем список покупок
    const updatedPurchases = [...existingPurchases, newPurchase];
    await kv.set(purchasesKey, updatedPurchases);

    // Обновляем total в usage
    const currentUsage = usage || { used: 0, total: 10, lastReset: new Date().toISOString() };
    const newTotal = currentUsage.total + amount;

    await kv.set(usageKey, {
      ...currentUsage,
      total: newTotal,
    });

    console.log(`💰 Purchase verified: ${deviceId} bought ${packageType} (+${amount}). New total: ${newTotal}`);

    return new Response(
      JSON.stringify({
        success: true,
        newTotal,
        addedAmount: amount,
        purchase: newPurchase,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in purchase-verify:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
