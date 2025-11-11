import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIRecipe } from './aiService';

const FAVORITES_KEY = '@favorites';
const AI_RECIPES_KEY = '@ai_recipes';

export const getFavoriteRecipes = async (): Promise<string[]> => {
  try {
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
};

export const addToFavorites = async (recipeId: string): Promise<void> => {
  try {
    const favorites = await getFavoriteRecipes();
    if (!favorites.includes(recipeId)) {
      const updated = [...favorites, recipeId];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
  }
};

export const removeFromFavorites = async (recipeId: string): Promise<void> => {
  try {
    const favorites = await getFavoriteRecipes();
    const updated = favorites.filter(id => id !== recipeId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing from favorites:', error);
  }
};

export const isFavorite = async (recipeId: string): Promise<boolean> => {
  try {
    const favorites = await getFavoriteRecipes();
    return favorites.includes(recipeId);
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

// AI Recipes Storage
export const saveAIRecipe = async (recipe: AIRecipe): Promise<void> => {
  try {
    const recipes = await getAllAIRecipes();
    const existingIndex = recipes.findIndex(r => r.id === recipe.id);

    if (existingIndex >= 0) {
      recipes[existingIndex] = recipe;
    } else {
      recipes.push(recipe);
    }

    await AsyncStorage.setItem(AI_RECIPES_KEY, JSON.stringify(recipes));
  } catch (error) {
    console.error('Error saving AI recipe:', error);
  }
};

export const getAllAIRecipes = async (): Promise<AIRecipe[]> => {
  try {
    const recipes = await AsyncStorage.getItem(AI_RECIPES_KEY);
    return recipes ? JSON.parse(recipes) : [];
  } catch (error) {
    console.error('Error loading AI recipes:', error);
    return [];
  }
};

export const getAIRecipeById = async (id: string): Promise<AIRecipe | undefined> => {
  try {
    const recipes = await getAllAIRecipes();
    return recipes.find(r => r.id === id);
  } catch (error) {
    console.error('Error getting AI recipe:', error);
    return undefined;
  }
};

/**
 * Оптимизированная функция для получения нескольких рецептов по ID
 * Загружает все рецепты один раз вместо N запросов
 * @param ids - массив ID рецептов
 * @returns массив найденных рецептов
 */
export const getAIRecipesByIds = async (ids: string[]): Promise<AIRecipe[]> => {
  try {
    if (ids.length === 0) return [];

    const allRecipes = await getAllAIRecipes();
    const idSet = new Set(ids); // Используем Set для O(1) поиска

    return allRecipes.filter(recipe => idSet.has(recipe.id));
  } catch (error) {
    console.error('Error getting AI recipes by IDs:', error);
    return [];
  }
};
