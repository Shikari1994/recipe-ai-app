import { Allergen, ALLERGEN_LABELS, DietaryRestriction, UserPreferences } from '../userPreferences';

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
      milk: ['молоко', 'молоком', 'молока', 'молочн', 'сливк', 'сметан', 'творог', 'сыр', 'кефир', 'йогурт', 'milk', 'cream', 'cheese'],
      fish: ['рыба', 'рыбу', 'рыбой', 'рыбы', 'рыбн', 'fish', 'лосось', 'тунец', 'треска', 'salmon'],
      'tree-nuts': ['орехи', 'орех', 'nut', 'nuts', 'миндаль', 'кешью', 'грецкий', 'фундук', 'фисташ', 'almond', 'cashew', 'walnut'],
      peanuts: ['арахис', 'арахисов', 'peanut'],
      gluten: ['глютен', 'глютенов', 'gluten', 'пшеница', 'пшеничн', 'wheat', 'хлеб', 'макарон', 'pasta', 'bread'],
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

/**
 * Проверяет конфликты между вводом пользователя и диетическими ограничениями
 * @param userInput - ввод пользователя
 * @param restrictions - список диетических ограничений
 * @returns сообщение об ошибке или null
 */
export function checkDietaryConflicts(
  userInput: string,
  restrictions: DietaryRestriction[]
): string | null {
  if (!userInput || restrictions.length === 0) return null;

  const lowerInput = userInput.toLowerCase().trim();

  // Проверка для вегетарианства
  if (restrictions.includes('vegetarian') || restrictions.includes('vegan')) {
    const meatKeywords = [
      'мясо', 'мяса', 'мясом', 'говядин', 'свинин', 'курица', 'куриц', 'индейка', 'индюшат',
      'баранин', 'телятин', 'утка', 'гусь', 'кролик', 'колбас', 'сосиск', 'ветчин',
      'meat', 'beef', 'pork', 'chicken', 'turkey', 'lamb', 'sausage',
      'рыба', 'рыбу', 'рыбой', 'рыбн', 'fish', 'лосось', 'тунец', 'треска', 'salmon'
    ];

    for (const keyword of meatKeywords) {
      if (lowerInput.includes(keyword)) {
        const dietType = restrictions.includes('vegan') ? 'веганские' : 'вегетарианские';
        return `⚠️ Внимание! У вас выбраны ${dietType} рецепты, но вы пытаетесь найти рецепты с мясом или рыбой. Это противоречит вашим настройкам. Пожалуйста, введите другие ингредиенты или измените диетические ограничения в профиле.`;
      }
    }
  }

  // Проверка для веганства (дополнительно к вегетарианству)
  if (restrictions.includes('vegan')) {
    const animalProductKeywords = [
      'молоко', 'молочн', 'сливк', 'сметан', 'творог', 'сыр', 'кефир', 'йогурт',
      'яйцо', 'яйца', 'яиц', 'яйцом', 'яйцами',
      'мёд', 'меда', 'медом',
      'milk', 'cream', 'cheese', 'egg', 'honey'
    ];

    for (const keyword of animalProductKeywords) {
      if (lowerInput.includes(keyword)) {
        return `⚠️ Внимание! У вас выбраны веганские рецепты, но вы пытаетесь найти рецепты с продуктами животного происхождения. Это противоречит вашим настройкам. Пожалуйста, введите другие ингредиенты или измените диетические ограничения в профиле.`;
      }
    }
  }

  return null;
}

/**
 * Проверяет все конфликты (аллергены + диетические ограничения)
 * @param userInput - ввод пользователя
 * @param preferences - настройки пользователя
 * @returns сообщение об ошибке или null
 */
export function checkAllConflicts(
  userInput: string,
  preferences: UserPreferences
): string | null {
  // Сначала проверяем аллергены
  const allergenConflict = checkAllergenConflicts(userInput, preferences.allergens);
  if (allergenConflict) return allergenConflict;

  // Затем проверяем диетические ограничения
  const dietaryConflict = checkDietaryConflicts(userInput, preferences.dietaryRestrictions);
  if (dietaryConflict) return dietaryConflict;

  return null;
}
