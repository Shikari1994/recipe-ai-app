/**
 * Централизованные типы приложения
 */

// ============================================
// AI Recipe Types
// ============================================

export type AIRecipe = {
  id: string; // Уникальный ID для навигации и избранного
  title: string;
  time: string;
  calories?: string; // Калории (необязательное поле)
  steps: string[];
};

export type AIResponse = {
  success: boolean;
  recipes?: AIRecipe[];
  greeting?: string; // Приветствие от AI
  error?: string;
};

// ============================================
// Message Types (Chat)
// ============================================

export type Message = {
  id: string;
  text: string;
  isUser: boolean;
  image?: string;
  timestamp: Date;
  aiRecipes?: AIRecipe[];
  isLoading?: boolean;
};

// ============================================
// Chat Types (Multiple Conversations)
// ============================================

export type Chat = {
  id: string;
  title: string; // Название чата (авто из первого сообщения или пользовательское)
  preview: string; // Превью последнего сообщения
  timestamp: Date; // Дата последнего обновления
  createdAt: Date; // Дата создания
  messages: Message[];
  recipeCount: number; // Количество рецептов в этом чате
};

export type ChatGroup = {
  title: string; // "Сегодня", "Вчера", "Прошлая неделя" и т.д.
  chats: Chat[];
};

// ============================================
// User Preferences Types
// ============================================

export type Allergen =
  | 'milk'
  | 'eggs'
  | 'tree-nuts'
  | 'peanuts'
  | 'gluten'
  | 'fish';

export type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'low-calorie';

export type UserPreferences = {
  allergens: Allergen[];
  dietaryRestrictions: DietaryRestriction[];
  servings: number;
};

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  milk: 'Молоко',
  eggs: 'Яйца',
  'tree-nuts': 'Орехи',
  peanuts: 'Арахис',
  gluten: 'Глютен',
  fish: 'Рыба',
};
