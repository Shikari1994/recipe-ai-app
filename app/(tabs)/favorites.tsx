import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/utils/ThemeContext';
import { getFavoriteRecipes, removeFromFavorites, getAIRecipesByIds } from '@/utils/storage';
import { AIRecipe } from '@/utils/aiService';
import { AIRecipeModal } from '@/components/AIRecipeModal';
import { getThemeColors, COLORS } from '@/constants/colors';
import { getRussianPlural } from '@/utils/textUtils';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function FavoritesScreen() {
  const { colors, isDark } = useTheme();
  const [favorites, setFavorites] = useState<AIRecipe[]>([]);
  const [selectedAIRecipe, setSelectedAIRecipe] = useState<AIRecipe | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const themeColors = useMemo(() => getThemeColors(isDark), [isDark]);

  const loadFavorites = useCallback(async () => {
    const favoriteIds = await getFavoriteRecipes();

    // Оптимизированная загрузка: один запрос вместо N запросов
    const aiRecipeIds = favoriteIds.filter(id => id.startsWith('ai-'));
    const aiRecipes = await getAIRecipesByIds(aiRecipeIds);

    setFavorites(aiRecipes);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const handleRemoveFromFavorites = useCallback(async (id: string) => {
    await removeFromFavorites(id);
    await loadFavorites();
  }, [loadFavorites]);

  const openRecipe = useCallback((recipe: AIRecipe) => {
    setSelectedAIRecipe(recipe);
    setModalVisible(true);
  }, []);

  const renderRecipeCard = useCallback(({ item }: { item: AIRecipe }) => {

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            borderColor: isDark ? COLORS.purple.medium : COLORS.purple.light,
          },
        ]}
        onPress={() => openRecipe(item)}
        activeOpacity={0.8}
      >
        <BlurView
          intensity={60}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blur}
        />
        <LinearGradient
          colors={isDark ? COLORS.gradient.purple.dark : COLORS.gradient.purple.light}
          style={styles.gradient}
        />
        <View style={styles.cardContent}>
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="sparkles"
              size={40}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.cardInfo}>
            <Text style={[styles.recipeName, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>

            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {item.time}
                </Text>
              </View>
              {item.calories && (
                <View style={styles.metaItem}>
                  <Ionicons name="flame-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {item.calories}
                  </Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                <Text style={[styles.metaText, { color: COLORS.primary }]}>
                  AI рецепт
                </Text>
              </View>
            </View>

            <Text style={[styles.ingredientsPreview, { color: themeColors.textMuted }]} numberOfLines={1}>
              {item.steps.length} {getRussianPlural(item.steps.length, 'шаг', 'шага', 'шагов')} приготовления
            </Text>
          </View>

          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => handleRemoveFromFavorites(item.id)}
          >
            <Ionicons name="heart" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [colors, isDark, themeColors, openRecipe, handleRemoveFromFavorites]);

  const EmptyState = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Нет избранных рецептов
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Добавляйте понравившиеся рецепты, нажимая на ❤️
      </Text>
    </View>
  ), [colors]);

  const keyExtractor = useCallback((item: AIRecipe) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={favorites}
        renderItem={renderRecipeCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={favorites.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={EmptyState}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={10}
      />

      {/* Модальное окно для AI рецептов */}
      <AIRecipeModal
        visible={modalVisible}
        recipe={selectedAIRecipe}
        onClose={() => {
          setModalVisible(false);
          setSelectedAIRecipe(null);
          loadFavorites(); // Обновляем список, если что-то изменилось
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  card: {
    position: 'relative',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: COLORS.purple.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    position: 'relative',
    zIndex: 1,
    flexDirection: 'row',
    padding: 12,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
  },
  ingredientsPreview: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  heartButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});