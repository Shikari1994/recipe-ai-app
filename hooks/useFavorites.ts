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

  // Добавление в избранное с оптимистичным обновлением
  const addToFavorites = useCallback(async (id: string, aiRecipe?: AIRecipe) => {
    // Оптимистично обновляем UI сразу
    setFavorites(prev => [...prev, id]);
    setIsFavoriteItem(true);
    setIsLoading(true);

    try {
      await addToFavoritesStorage(id);

      // Если это AI рецепт, сохраняем его данные
      if (aiRecipe) {
        await saveAIRecipe(aiRecipe);
      }

      return true;
    } catch (error) {
      // Откатываем при ошибке
      setFavorites(prev => prev.filter(fav => fav !== id));
      setIsFavoriteItem(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Удаление из избранного с оптимистичным обновлением
  const removeFromFavorites = useCallback(async (id: string) => {
    // Сохраняем предыдущее состояние для отката
    const previousFavorites = favorites;

    // Оптимистично обновляем UI сразу
    setFavorites(prev => prev.filter(fav => fav !== id));
    setIsFavoriteItem(false);
    setIsLoading(true);

    try {
      await removeFromFavoritesStorage(id);
      return true;
    } catch (error) {
      // Откатываем при ошибке
      setFavorites(previousFavorites);
      setIsFavoriteItem(previousFavorites.includes(id));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [favorites]);

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
