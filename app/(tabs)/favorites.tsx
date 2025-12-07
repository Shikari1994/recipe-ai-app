import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/utils/ThemeContext';
import { useLanguage } from '@/utils/LanguageContext';
import { getFavoriteRecipes, removeFromFavorites, getAIRecipesByIds } from '@/utils/storage';
import type { AIRecipe } from '@/types';
import { AIRecipeModal } from '@/components/AIRecipeModal';
import { getThemeColors, COLORS } from '@/constants/colors';
import { getPlural } from '@/utils/plurals';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { fontScale, moderateScale } from '@/utils/responsive';

export default function FavoritesScreen() {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const [favorites, setFavorites] = useState<AIRecipe[]>([]);
  const [selectedAIRecipe, setSelectedAIRecipe] = useState<AIRecipe | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const themeColors = useMemo(() => getThemeColors(isDark), [isDark]);

  // Фильтрация по поиску (только по названию)
  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favorites;

    const query = searchQuery.toLowerCase();
    return favorites.filter((recipe) =>
      recipe.title.toLowerCase().includes(query)
    );
  }, [favorites, searchQuery]);

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
                  {t.favorites.aiRecipe}
                </Text>
              </View>
            </View>

            <Text style={[styles.ingredientsPreview, { color: themeColors.textMuted }]} numberOfLines={1}>
              {item.steps.length} {getPlural(item.steps.length, language, t.favorites)} {t.favorites.cooking}
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
  }, [colors, isDark, themeColors, openRecipe, handleRemoveFromFavorites, t, language]);

  const EmptyState = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {t.favorites.empty}
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {t.favorites.emptyDescription}
      </Text>
    </View>
  ), [colors, t]);

  const keyExtractor = useCallback((item: AIRecipe) => item.id, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Поиск */}
      {favorites.length > 0 && (
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: isDark ? '#2a2a2a' : '#e5e5e5' },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={isDark ? '#999' : '#666'}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t.favorites.searchPlaceholder}
              placeholderTextColor={themeColors.inputPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={isDark ? '#999' : '#666'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <FlatList
        data={filteredFavorites}
        renderItem={renderRecipeCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={filteredFavorites.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={searchQuery ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t.favorites.noResults}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t.favorites.noResultsDescription}
            </Text>
          </View>
        ) : EmptyState}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: fontScale(14),
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
    fontSize: fontScale(18),
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
    fontSize: fontScale(14),
  },
  ingredientsPreview: {
    fontSize: fontScale(12),
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
    fontSize: fontScale(20),
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: fontScale(16),
    textAlign: 'center',
    lineHeight: moderateScale(22),
  },
});