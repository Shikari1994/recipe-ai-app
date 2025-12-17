import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAIRecipeById } from '@/utils/storage';
import type { AIRecipe } from '@/types';
import { useTheme } from '@/utils/ThemeContext';
import { useRecipeActions } from '@/hooks';
import { RecipeDetailView } from '@/components/recipe/RecipeDetailView';
import { COLORS } from '@/constants/colors';
import { useLanguage } from '@/utils/LanguageContext';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useRecipeActions(id as string);
  const [recipe, setRecipe] = useState<AIRecipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setLoading(true);
        const aiRecipe = await getAIRecipeById(id as string);
        if (!aiRecipe) {
          Alert.alert(t.recipe.error, t.recipe.notFound);
          router.back();
        } else {
          setRecipe(aiRecipe);
        }
      } catch {
        Alert.alert(t.recipe.error, t.recipe.loadError);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id, router, t.recipe.error, t.recipe.notFound, t.recipe.loadError]);

  const handleToggleFavorite = useCallback(async () => {
    if (!recipe) return;
    await toggleFavorite(recipe);
  }, [recipe, toggleFavorite]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <RecipeDetailView
        recipe={recipe}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        showBackButton={true}
        onBack={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
