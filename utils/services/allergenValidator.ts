import { Allergen, ALLERGEN_LABELS } from '../userPreferences';

/**
 * Проверяет конфликты между вводом пользователя и выбранными аллергенами
 * @param userInput - ввод пользователя
 * @param allergens - список аллергенов
 * @returns сообщение об ошибке или null
 */
export function checkAllergenConflicts(
  userInput: string,
  allergens: Allergen[]
): string | null {
  if (!userInput || allergens.length === 0) return null;

  const lowerInput = userInput.toLowerCase().trim();

  for (const allergen of allergens) {
    const allergenLabel = ALLERGEN_LABELS[allergen].toLowerCase();

    // Проверяем точное совпадение или вхождение аллергена в запрос
    if (lowerInput === allergenLabel || lowerInput.includes(allergenLabel)) {
      return `⚠️ Внимание! Вы указали "${ALLERGEN_LABELS[allergen]}" в аллергиях, но пытаетесь найти рецепты с этим продуктом. Это противоречит вашим настройкам. Пожалуйста, введите другие ингредиенты или измените настройки аллергий в профиле.`;
    }

    // Дополнительная проверка для распространённых вариантов написания
    const variants: Record<string, string[]> = {
      eggs: ['яйцо', 'яйца', 'яиц', 'яйцом', 'яйцами', 'egg'],
      milk: ['молоко', 'молоком', 'молока', 'milk'],
      fish: ['рыба', 'рыбу', 'рыбой', 'рыбы', 'fish'],
      shellfish: ['морепродукты', 'креветки', 'крабы', 'shellfish', 'shrimp'],
      'tree-nuts': ['орехи', 'орех', 'nut', 'nuts', 'миндаль', 'кешью', 'грецкий'],
      peanuts: ['арахис', 'peanut'],
      wheat: ['пшеница', 'пшеничн', 'wheat'],
      soy: ['соя', 'соевый', 'soy'],
      gluten: ['глютен', 'gluten'],
      lactose: ['лактоза', 'lactose'],
    };

    const allergenVariants = variants[allergen] || [];
    for (const variant of allergenVariants) {
      if (lowerInput.includes(variant)) {
        return `⚠️ Внимание! Вы указали "${ALLERGEN_LABELS[allergen]}" в аллергиях, но пытаетесь найти рецепты с этим продуктом. Это противоречит вашим настройкам. Пожалуйста, введите другие ингредиенты или измените настройки аллергий в профиле.`;
      }
    }
  }

  return null;
}
