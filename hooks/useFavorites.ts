import { useState, useEffect, useCallback } from 'react';
import {
  getFavoriteRecipes,
  addToFavorites as addToFavoritesStorage,
  removeFromFavorites as removeFromFavoritesStorage,
  isFavorite as checkIsFavorite,
  isFavoriteSync,
  saveAIRecipe,
} from '@/utils/storage';
import type { AIRecipe } from '@/types';

/**
 * Custom hook для управления избранными рецептами
 * Объединяет логику добавления/удаления/проверки избранного
 */
export function useFavorites(recipeId?: string) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isFavoriteItem, setIsFavoriteItem] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка списка избранных
  const loadFavorites = useCallback(async () => {
    try {
      const favoriteIds = await getFavoriteRecipes();
      setFavorites(favoriteIds);

      if (recipeId) {
        setIsFavoriteItem(favoriteIds.includes(recipeId));
      }
    } catch {
      // Ошибка уже залогирована в storage.ts
    }
  }, [recipeId]);

  // Загрузка при монтировании
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Добавление в избранное
  const addToFavorites = useCallback(async (id: string, aiRecipe?: AIRecipe) => {
    setIsLoading(true);
    try {
      await addToFavoritesStorage(id);

      // Если это AI рецепт, сохраняем его данные
      if (aiRecipe) {
        await saveAIRecipe(aiRecipe);
      }

      await loadFavorites();
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadFavorites]);

  // Удаление из избранного
  const removeFromFavorites = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await removeFromFavoritesStorage(id);
      await loadFavorites();
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadFavorites]);

  // Переключение избранного
  const toggleFavorite = useCallback(async (id: string, aiRecipe?: AIRecipe) => {
    // Используем синхронную проверку по уже загруженному массиву
    const isCurrentlyFavorite = isFavoriteSync(favorites, id);

    if (isCurrentlyFavorite) {
      return await removeFromFavorites(id);
    } else {
      return await addToFavorites(id, aiRecipe);
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  // Проверка, является ли рецепт избранным
  const checkFavorite = useCallback(async (id: string) => {
    const result = await checkIsFavorite(id);
    setIsFavoriteItem(result);
    return result;
  }, []);

  return {
    favorites,
    isFavorite: isFavoriteItem,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    checkFavorite,
    reload: loadFavorites,
  };
}
