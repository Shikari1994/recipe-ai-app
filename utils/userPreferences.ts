import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserPreferences, Allergen, DietaryRestriction } from '@/types';

const USER_PREFERENCES_KEY = '@user_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  allergens: [],
  dietaryRestrictions: [],
  servings: 2,
};

/**
 * Получить настройки пользователя
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const data = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      console.log('📖 Retrieved preferences from AsyncStorage:', parsed);
      return parsed;
    }
    console.log('📖 No saved preferences found, using defaults');
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('❌ Error getting user preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Сохранить настройки пользователя
 */
export async function saveUserPreferences(preferences: UserPreferences): Promise<boolean> {
  try {
    console.log('💾 Saving preferences to AsyncStorage:', preferences);
    await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
    console.log('✅ Preferences saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving user preferences:', error);
    return false;
  }
}

/**
 * Получить текстовое описание аллергенов для промпта
 */
export function getAllergensText(allergens: Allergen[], language: string = 'ru'): string {
  if (allergens.length === 0) return '';

  const allergenDetailsRu: Record<Allergen, string> = {
    'milk': 'молоко и все молочные продукты (сливки, сметана, творог, сыр, кефир, йогурт, масло)',
    'eggs': 'яйца и все продукты содержащие яйца',
    'tree-nuts': 'орехи (миндаль, кешью, грецкий орех, фундук, фисташки, пекан и любые другие орехи)',
    'peanuts': 'арахис и арахисовые продукты',
    'gluten': 'глютен и все продукты содержащие глютен (пшеница, рожь, ячмень, хлеб, макароны, выпечка)',
    'fish': 'рыба и морепродукты любых видов (лосось, тунец, треска, форель, семга, сельдь, карп, щука, окунь, судак, скумбрия, камбала, палтус, минтай, хек, креветки, крабы, мидии, кальмары и любые другие)',
  };

  const allergenDetailsEn: Record<Allergen, string> = {
    'milk': 'dairy and all dairy products (milk, cream, sour cream, cottage cheese, cheese, kefir, yogurt, butter)',
    'eggs': 'eggs and all products containing eggs',
    'tree-nuts': 'tree nuts (almonds, cashews, walnuts, hazelnuts, pistachios, pecans, and any other nuts)',
    'peanuts': 'peanuts and peanut products',
    'gluten': 'gluten and all gluten-containing products (wheat, rye, barley, bread, pasta, baked goods)',
    'fish': 'fish and seafood of all types (salmon, tuna, cod, trout, herring, carp, pike, perch, mackerel, flounder, halibut, pollock, hake, shrimp, crab, mussels, squid, and any others)',
  };

  const allergenDetails = language === 'en' ? allergenDetailsEn : allergenDetailsRu;
  const details = allergens.map(a => allergenDetails[a]);

  return language === 'en'
    ? `⛔ ABSOLUTE PROHIBITION - NEVER use these products (SEVERE ALLERGY - can be life-threatening):\n${details.join('\n')}\n\n❗ ALL recipes MUST be completely free from these allergens and their derivatives!`
    : `⛔ АБСОЛЮТНЫЙ ЗАПРЕТ - НИКОГДА не использовать эти продукты (СЕРЬЕЗНАЯ АЛЛЕРГИЯ - может быть опасно для жизни):\n${details.join('\n')}\n\n❗ ВСЕ рецепты ДОЛЖНЫ быть полностью свободны от этих аллергенов и их производных!`;
}

/**
 * Получить текстовое описание диетических ограничений для промпта
 */
export function getDietaryRestrictionsText(restrictions: DietaryRestriction[], language: string = 'ru'): string {
  if (restrictions.length === 0) return '';

  const restrictionNamesRu: Record<DietaryRestriction, string> = {
    'vegetarian': 'вегетарианские рецепты (без мяса и рыбы)',
    'vegan': 'веганские рецепты (без продуктов животного происхождения)',
    'low-calorie': 'низкокалорийные рецепты (менее 400 ккал на порцию)',
  };

  const restrictionNamesEn: Record<DietaryRestriction, string> = {
    'vegetarian': 'vegetarian recipes (no meat or fish)',
    'vegan': 'vegan recipes (no animal products)',
    'low-calorie': 'low-calorie recipes (less than 400 kcal per serving)',
  };

  const restrictionNames = language === 'en' ? restrictionNamesEn : restrictionNamesRu;
  const descriptions = restrictions.map(r => restrictionNames[r]);

  return language === 'en'
    ? `Dietary requirements: ${descriptions.join('; ')}.`
    : `Диетические требования: ${descriptions.join('; ')}.`;
}

/**
 * Получить полный текст настроек для промпта
 */
export function getPreferencesPromptText(preferences: UserPreferences, language: string = 'ru'): string {
  const parts: string[] = [];

  // Аллергены
  const allergensText = getAllergensText(preferences.allergens, language);
  if (allergensText) {
    parts.push(allergensText);
  }

  // Диетические ограничения
  const restrictionsText = getDietaryRestrictionsText(preferences.dietaryRestrictions, language);
  if (restrictionsText) {
    parts.push(restrictionsText);
  }

  // Количество порций
  if (preferences.servings > 0) {
    const servingsText = language === 'en'
      ? `⚠️ CALCULATE ALL INGREDIENTS FOR ${preferences.servings} SERVINGS!`
      : `⚠️ РАССЧИТАЙ ВСЕ ИНГРЕДИЕНТЫ НА ${preferences.servings} ПОРЦИИ!`;
    parts.push(servingsText);
  }

  return parts.join(' ');
}
