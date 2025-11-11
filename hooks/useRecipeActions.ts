import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from './useFavorites';
import { saveAIRecipe } from '@/utils/storage';
import type { AIRecipe } from '@/utils/aiService';

/**
 * Централизованный хук для обработки действий с рецептами
 * Устраняет дублирование логики toggleFavorite и handleRecipePress
 */
export function useRecipeActions(recipeId?: string) {
  const router = useRouter();
  const { isFavorite, toggleFavorite: toggleFavoriteHook } = useFavorites(recipeId);

  /**
   * Переключает статус избранного для рецепта
   * @param recipe - рецепт для добавления/удаления из избранного
   */
  const toggleFavorite = useCallback(
    async (recipe: AIRecipe) => {
      const success = await toggleFavoriteHook(recipe.id, recipe);

      if (success) {
        Alert.alert(
          isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное',
          ''
        );
      } else {
        Alert.alert('Ошибка', 'Не удалось обновить избранное');
      }
    },
    [toggleFavoriteHook, isFavorite]
  );

  /**
   * Открывает страницу детализации рецепта
   * @param recipe - рецепт для отображения
   */
  const openRecipe = useCallback(
    async (recipe: AIRecipe) => {
      try {
        await saveAIRecipe(recipe);
        router.push(`/recipe/${recipe.id}`);
      } catch (error) {
        console.error('Error opening recipe:', error);
        Alert.alert('Ошибка', 'Не удалось открыть рецепт');
      }
    },
    [router]
  );

  return {
    isFavorite,
    toggleFavorite,
    openRecipe,
  };
}
