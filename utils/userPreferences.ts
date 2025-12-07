import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserPreferences, Allergen, DietaryRestriction } from '@/types';

const USER_PREFERENCES_KEY = '@user_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  allergens: [],
  dietaryRestrictions: [],
  servings: 2,
  // wallpaperId не установлен - будет использоваться getDefaultWallpaperId(isDark)
};

/**
 * Получить настройки пользователя
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const data = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Сохранить настройки пользователя
 */
export async function saveUserPreferences(preferences: UserPreferences): Promise<boolean> {
  try {
    await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return false;
  }
}

/**
 * Установить обои
 */
export async function setWallpaper(wallpaperId: string): Promise<boolean> {
  try {
    const prefs = await getUserPreferences();
    prefs.wallpaperId = wallpaperId;
    return await saveUserPreferences(prefs);
  } catch (error) {
    console.error('Error setting wallpaper:', error);
    return false;
  }
}

/**
 * Получить текстовое описание аллергенов для промпта
 */
export function getAllergensText(allergens: Allergen[], language: string = 'ru'): string {
  if (allergens.length === 0) return '';

  const allergenNamesRu: Record<Allergen, string> = {
    'milk': 'молоко',
    'eggs': 'яйца',
    'tree-nuts': 'орехи',
    'peanuts': 'арахис',
    'gluten': 'глютен',
    'fish': 'рыба',
  };

  const allergenNamesEn: Record<Allergen, string> = {
    'milk': 'dairy',
    'eggs': 'eggs',
    'tree-nuts': 'tree nuts',
    'peanuts': 'peanuts',
    'gluten': 'gluten',
    'fish': 'fish',
  };

  const allergenNames = language === 'en' ? allergenNamesEn : allergenNamesRu;
  const names = allergens.map(a => allergenNames[a]);

  return language === 'en'
    ? `Exclude the following products from recipes (allergy): ${names.join(', ')}.`
    : `Исключи из рецептов следующие продукты (аллергия): ${names.join(', ')}.`;
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
      ? `Number of servings: ${preferences.servings}.`
      : `Количество порций: ${preferences.servings}.`;
    parts.push(servingsText);
  }

  return parts.join(' ');
}
