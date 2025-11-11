import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAIRecipeById } from '@/utils/storage';
import { AIRecipe } from '@/utils/aiService';
import { useTheme } from '@/utils/ThemeContext';
import { useRecipeActions } from '@/hooks';
import { RecipeMetadata, RecipeSteps } from '@/components/recipe';
import { getThemeColors, COLORS } from '@/constants/colors';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isFavorite, toggleFavorite } = useRecipeActions(id as string);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [recipe, setRecipe] = useState<AIRecipe | null>(null);
  const [loading, setLoading] = useState(true);

  const themeColors = useMemo(() => getThemeColors(isDark), [isDark]);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setLoading(true);
        const aiRecipe = await getAIRecipeById(id as string);
        if (!aiRecipe) {
          Alert.alert('Ошибка', 'Рецепт не найден');
          router.back();
        } else {
          setRecipe(aiRecipe);
        }
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить рецепт');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id, router]);

  const handleToggleFavorite = useCallback(async () => {
    if (!recipe) return;
    await toggleFavorite(recipe);
  }, [recipe, toggleFavorite]);

  const toggleStep = useCallback((index: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{recipe.title}</Text>
          <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Метаданные */}
        <View style={[styles.metaContainer, { backgroundColor: themeColors.metaBg }]}>
          <RecipeMetadata
            time={recipe.time}
            calories={recipe.calories}
            textColor={colors.textSecondary}
          />
        </View>

        {/* Шаги приготовления */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Приготовление</Text>
          <RecipeSteps
            steps={recipe.steps}
            checkedSteps={checkedSteps}
            onStepToggle={toggleStep}
            textColor={colors.text}
            allowChecking={true}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 12,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    marginRight: 12,
  },
  favoriteButton: {
    padding: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  bottomPadding: {
    height: 20,
  },
});
