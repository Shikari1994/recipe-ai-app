/**
 * Вспомогательные функции для работы с AI
 * Объединяет парсинг ответов AI и валидацию аллергенов/диет
 */

import { AIRecipe, Allergen, ALLERGEN_LABELS, DietaryRestriction, UserPreferences } from '@/types';

// ============================================
// Константы для валидации аллергенов и диет
// ============================================

/**
 * Варианты написания аллергенов для проверки конфликтов
 */
const ALLERGEN_VARIANTS: Record<Allergen, string[]> = {
  eggs: ['яйцо', 'яйца', 'яиц', 'яйцом', 'яйцами', 'egg'],
  milk: ['молоко', 'молоком', 'молока', 'молочн', 'сливк', 'сметан', 'творог', 'сыр', 'кефир', 'йогурт', 'milk', 'cream', 'cheese'],
  fish: [
    'рыба', 'рыбу', 'рыбой', 'рыбы', 'рыбн', 'fish',
    // Морская рыба
    'лосось', 'лососей', 'salmon', 'тунец', 'тунца', 'tuna', 'треска', 'трески', 'cod',
    'форель', 'форели', 'trout', 'семга', 'семги', 'сельдь', 'сельди', 'herring',
    'скумбрия', 'скумбрии', 'mackerel', 'камбала', 'камбалы', 'flounder',
    'палтус', 'палтуса', 'halibut', 'минтай', 'минтая', 'pollock', 'хек', 'хека', 'hake',
    'мерлуза', 'дорадо', 'сибас', 'морской окунь', 'ставрида',
    // Речная рыба
    'карп', 'карпа', 'carp', 'щука', 'щуки', 'pike', 'окунь', 'окуня', 'perch',
    'судак', 'судака', 'сом', 'сома', 'catfish', 'лещ', 'леща', 'плотва',
    // Морепродукты
    'креветк', 'shrimp', 'краб', 'крабов', 'crab', 'мидии', 'мидий', 'mussel',
    'кальмар', 'кальмаров', 'squid', 'осьминог', 'octopus', 'устриц', 'oyster',
    'гребешк', 'scallop', 'икра', 'икры', 'caviar', 'морепродукт'
  ],
  'tree-nuts': ['орехи', 'орех', 'nut', 'nuts', 'миндаль', 'кешью', 'грецкий', 'фундук', 'фисташ', 'пекан', 'almond', 'cashew', 'walnut', 'pecan'],
  peanuts: ['арахис', 'арахисов', 'peanut'],
  gluten: ['глютен', 'глютенов', 'gluten', 'пшеница', 'пшеничн', 'wheat', 'хлеб', 'макарон', 'pasta', 'bread', 'рожь', 'ячмен', 'выпечк'],
};

/**
 * Ключевые слова для мясных продуктов (вегетарианство/веганство)
 */
const MEAT_KEYWORDS = [
  'мясо', 'мяса', 'мясом', 'говядин', 'свинин', 'курица', 'куриц', 'индейка', 'индюшат',
  'баранин', 'телятин', 'утка', 'гусь', 'кролик', 'колбас', 'сосиск', 'ветчин',
  'meat', 'beef', 'pork', 'chicken', 'turkey', 'lamb', 'sausage',
  'рыба', 'рыбу', 'рыбой', 'рыбн', 'fish', 'лосось', 'тунец', 'треска', 'salmon'
];

/**
 * Ключевые слова для продуктов животного происхождения (веганство)
 */
const ANIMAL_PRODUCT_KEYWORDS = [
  'молоко', 'молочн', 'сливк', 'сметан', 'творог', 'сыр', 'кефир', 'йогурт',
  'яйцо', 'яйца', 'яиц', 'яйцом', 'яйцами',
  'мёд', 'меда', 'медом',
  'milk', 'cream', 'cheese', 'egg', 'honey'
];

// ============================================
// AI Response Parser
// ============================================

/**
 * Парсит ответ от AI и извлекает структурированные рецепты
 * @param text - текст ответа от AI
 * @returns объект с массивом рецептов (без приветствия)
 */
export function parseAIResponse(text: string): {
  greeting: string;
  recipes: AIRecipe[];
} {
  const recipes: AIRecipe[] = [];

  const lines = text.split('\n');
  let currentRecipe: Partial<AIRecipe> | null = null;
  let collectingSteps = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Пропускаем разделители
    if (line === '---' || line === '') {
      if (currentRecipe && currentRecipe.title && collectingSteps) {
        recipes.push({
          id: `ai-${Date.now()}-${recipes.length}`,
          title: currentRecipe.title,
          time: currentRecipe.time || '',
          calories: currentRecipe.calories || '',
          steps: currentRecipe.steps || [],
        });
        currentRecipe = null;
        collectingSteps = false;
      }
      continue;
    }

    // Ищем название рецепта
    if (
      line.match(/^###\s+/) ||
      (line.match(/^\*\*.*\*\*$/) && !line.match(/время|шаги|калории|time|steps|calories|cooking/i))
    ) {
      if (currentRecipe && currentRecipe.title) {
        recipes.push({
          id: `ai-${Date.now()}-${recipes.length}`,
          title: currentRecipe.title,
          time: currentRecipe.time || '',
          calories: currentRecipe.calories || '',
          steps: currentRecipe.steps || [],
        });
      }

      currentRecipe = {
        title: line.replace(/^###\s+/, '').replace(/[\*]/g, '').trim(),
        steps: [],
      };
      collectingSteps = false;
    }
    // Ищем время приготовления (русский и английский)
    else if (line.match(/\*\*Время приготовления|\*\*Cooking time/i) && currentRecipe) {
      const timeMatch = line.match(/:\*\*\s*(.+)/);
      if (timeMatch) {
        currentRecipe.time = timeMatch[1].trim();
      } else {
        const simpleMatch = line.match(/:\s*(.+)/);
        if (simpleMatch) {
          currentRecipe.time = simpleMatch[1].replace(/\*/g, '').trim();
        }
      }
    }
    // Ищем калории (русский и английский)
    else if (line.match(/\*\*Калории|\*\*Calories/i) && currentRecipe) {
      const caloriesMatch = line.match(/:\*\*\s*(.+)/);
      if (caloriesMatch) {
        currentRecipe.calories = caloriesMatch[1].trim();
      } else {
        const simpleMatch = line.match(/:\s*(.+)/);
        if (simpleMatch) {
          currentRecipe.calories = simpleMatch[1].replace(/\*/g, '').trim();
        }
      }
    }
    // Ищем начало шагов (русский и английский)
    else if (line.match(/\*\*Шаги|\*\*Steps/i) && currentRecipe) {
      collectingSteps = true;
      currentRecipe.steps = [];
    }
    // Собираем шаги
    else if (collectingSteps && currentRecipe && line.match(/^\d+[\.\)]/)) {
      const step = line.replace(/^\d+[\.\)]\s*/, '').trim();
      if (step.length > 0 && !step.match(/^[\-\*]+$/)) {
        currentRecipe.steps!.push(step);
      }
    }
  }

  // Сохраняем последний рецепт
  if (currentRecipe && currentRecipe.title) {
    recipes.push({
      id: `ai-${Date.now()}-${recipes.length}`,
      title: currentRecipe.title,
      time: currentRecipe.time || '',
      calories: currentRecipe.calories || '',
      steps: currentRecipe.steps || [],
    });
  }

  const recipesWithIds = recipes.map((recipe, index) => ({
    ...recipe,
    id: recipe.id || `ai-${Date.now()}-${index}`,
  }));

  return { greeting: '', recipes: recipesWithIds };
}

// ============================================
// Allergen & Diet Validator
// ============================================

/**
 * Создает сообщение об ошибке для конфликта аллергена
 */
function createAllergenConflictMessage(allergenName: string): string {
  return `⚠️ Внимание! Вы указали "${allergenName}" в аллергиях, но пытаетесь найти рецепты с этим продуктом. Это противоречит вашим настройкам. Пожалуйста, введите другие ингредиенты или измените настройки аллергий в профиле.`;
}

/**
 * Проверяет конфликты между вводом пользователя и выбранными аллергенами
 */
export function checkAllergenConflicts(
  userInput: string,
  allergens: Allergen[]
): string | null {
  if (!userInput || allergens.length === 0) return null;

  const lowerInput = userInput.toLowerCase().trim();

  for (const allergen of allergens) {
    const allergenLabel = ALLERGEN_LABELS[allergen].toLowerCase();

    // Проверка точного совпадения с названием аллергена
    if (lowerInput === allergenLabel || lowerInput.includes(allergenLabel)) {
      return createAllergenConflictMessage(ALLERGEN_LABELS[allergen]);
    }

    // Проверка вариантов написания
    const allergenVariants = ALLERGEN_VARIANTS[allergen] || [];
    for (const variant of allergenVariants) {
      if (lowerInput.includes(variant)) {
        return createAllergenConflictMessage(ALLERGEN_LABELS[allergen]);
      }
    }
  }

  return null;
}

/**
 * Проверяет наличие ключевых слов в тексте
 */
function containsKeyword(text: string, keywords: readonly string[]): boolean {
  return keywords.some(keyword => text.includes(keyword));
}

/**
 * Проверяет конфликты между вводом пользователя и диетическими ограничениями
 */
export function checkDietaryConflicts(
  userInput: string,
  restrictions: DietaryRestriction[]
): string | null {
  if (!userInput || restrictions.length === 0) return null;

  const lowerInput = userInput.toLowerCase().trim();

  // Проверка для вегетарианства и веганства (мясо и рыба)
  if (restrictions.includes('vegetarian') || restrictions.includes('vegan')) {
    if (containsKeyword(lowerInput, MEAT_KEYWORDS)) {
      const dietType = restrictions.includes('vegan') ? 'веганские' : 'вегетарианские';
      return `⚠️ Внимание! У вас выбраны ${dietType} рецепты, но вы пытаетесь найти рецепты с мясом или рыбой. Это противоречит вашим настройкам. Пожалуйста, введите другие ингредиенты или измените диетические ограничения в профиле.`;
    }
  }

  // Проверка для веганства (продукты животного происхождения)
  if (restrictions.includes('vegan')) {
    if (containsKeyword(lowerInput, ANIMAL_PRODUCT_KEYWORDS)) {
      return `⚠️ Внимание! У вас выбраны веганские рецепты, но вы пытаетесь найти рецепты с продуктами животного происхождения. Это противоречит вашим настройкам. Пожалуйста, введите другие ингредиенты или измените диетические ограничения в профиле.`;
    }
  }

  return null;
}

/**
 * Проверяет все конфликты (аллергены + диетические ограничения)
 */
export function checkAllConflicts(
  userInput: string,
  preferences: UserPreferences
): string | null {
  const allergenConflict = checkAllergenConflicts(userInput, preferences.allergens);
  if (allergenConflict) return allergenConflict;

  const dietaryConflict = checkDietaryConflicts(userInput, preferences.dietaryRestrictions);
  if (dietaryConflict) return dietaryConflict;

  return null;
}
