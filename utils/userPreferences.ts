import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_PREFERENCES_KEY = '@user_preferences';

export type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'low-calorie';

export type Allergen =
  | 'milk'
  | 'eggs'
  | 'tree-nuts'
  | 'peanuts'
  | 'gluten'
  | 'fish';

export type UserPreferences = {
  allergens: Allergen[];
  dietaryRestrictions: DietaryRestriction[];
  servings: number;
  wallpaperId?: string;
};

const DEFAULT_PREFERENCES: UserPreferences = {
  allergens: [],
  dietaryRestrictions: [],
  servings: 2,
  wallpaperId: 'dark-image',
};

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  'milk': 'Молоко',
  'eggs': 'Яйца',
  'tree-nuts': 'Орехи',
  'peanuts': 'Арахис',
  'gluten': 'Глютен',
  'fish': 'Рыба',
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
 * Добавить аллерген
 */
export async function addAllergen(allergen: Allergen): Promise<boolean> {
  try {
    const prefs = await getUserPreferences();
    if (!prefs.allergens.includes(allergen)) {
      prefs.allergens.push(allergen);
      return await saveUserPreferences(prefs);
    }
    return true;
  } catch (error) {
    console.error('Error adding allergen:', error);
    return false;
  }
}

/**
 * Удалить аллерген
 */
export async function removeAllergen(allergen: Allergen): Promise<boolean> {
  try {
    const prefs = await getUserPreferences();
    prefs.allergens = prefs.allergens.filter(a => a !== allergen);
    return await saveUserPreferences(prefs);
  } catch (error) {
    console.error('Error removing allergen:', error);
    return false;
  }
}

/**
 * Добавить диетическое ограничение
 */
export async function addDietaryRestriction(restriction: DietaryRestriction): Promise<boolean> {
  try {
    const prefs = await getUserPreferences();
    if (!prefs.dietaryRestrictions.includes(restriction)) {
      prefs.dietaryRestrictions.push(restriction);
      return await saveUserPreferences(prefs);
    }
    return true;
  } catch (error) {
    console.error('Error adding dietary restriction:', error);
    return false;
  }
}

/**
 * Удалить диетическое ограничение
 */
export async function removeDietaryRestriction(restriction: DietaryRestriction): Promise<boolean> {
  try {
    const prefs = await getUserPreferences();
    prefs.dietaryRestrictions = prefs.dietaryRestrictions.filter(r => r !== restriction);
    return await saveUserPreferences(prefs);
  } catch (error) {
    console.error('Error removing dietary restriction:', error);
    return false;
  }
}

/**
 * Установить количество порций
 */
export async function setServings(servings: number): Promise<boolean> {
  try {
    const prefs = await getUserPreferences();
    prefs.servings = servings;
    return await saveUserPreferences(prefs);
  } catch (error) {
    console.error('Error setting servings:', error);
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
export function getAllergensText(allergens: Allergen[]): string {
  if (allergens.length === 0) return '';

  const allergenNames: Record<Allergen, string> = {
    'milk': 'молоко',
    'eggs': 'яйца',
    'tree-nuts': 'орехи',
    'peanuts': 'арахис',
    'gluten': 'глютен',
    'fish': 'рыба',
  };

  const names = allergens.map(a => allergenNames[a]);
  return `Исключи из рецептов следующие продукты (аллергия): ${names.join(', ')}.`;
}

/**
 * Получить текстовое описание диетических ограничений для промпта
 */
export function getDietaryRestrictionsText(restrictions: DietaryRestriction[]): string {
  if (restrictions.length === 0) return '';

  const restrictionNames: Record<DietaryRestriction, string> = {
    'vegetarian': 'вегетарианские рецепты (без мяса и рыбы)',
    'vegan': 'веганские рецепты (без продуктов животного происхождения)',
    'low-calorie': 'низкокалорийные рецепты (менее 400 ккал на порцию)',
  };

  const descriptions = restrictions.map(r => restrictionNames[r]);
  return `Диетические требования: ${descriptions.join('; ')}.`;
}

/**
 * Получить полный текст настроек для промпта
 */
export function getPreferencesPromptText(preferences: UserPreferences): string {
  const parts: string[] = [];

  // Аллергены
  const allergensText = getAllergensText(preferences.allergens);
  if (allergensText) {
    parts.push(allergensText);
  }

  // Диетические ограничения
  const restrictionsText = getDietaryRestrictionsText(preferences.dietaryRestrictions);
  if (restrictionsText) {
    parts.push(restrictionsText);
  }

  // Количество порций
  if (preferences.servings > 0) {
    parts.push(`Количество порций: ${preferences.servings}.`);
  }

  return parts.join(' ');
}
