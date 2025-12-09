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
import { AIRecipeCard } from '@/components/AIRecipeCard';
import { getThemeColors, COLORS } from '@/constants/colors';
import { fontScale, moderateScale, scale, verticalScale } from '@/utils/responsive';
import { useRouter } from 'expo-router';

export default function FavoritesScreen() {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const router = useRouter();
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
      <View style={styles.cardWrapper}>
        <AIRecipeCard
          recipe={item}
          isDark={isDark}
          onPress={() => openRecipe(item)}
        />
        <TouchableOpacity
          style={[
            styles.heartButton,
            {
              backgroundColor: isDark
                ? 'rgba(20, 20, 25, 0.9)'
                : 'rgba(255, 255, 255, 0.9)',
              borderWidth: 1,
              borderColor: isDark
                ? 'rgba(138, 43, 226, 0.3)'
                : 'rgba(138, 43, 226, 0.2)',
            }
          ]}
          onPress={() => handleRemoveFromFavorites(item.id)}
        >
          <Ionicons name="heart" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
  }, [isDark, openRecipe, handleRemoveFromFavorites]);

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
      {/* Header с кнопкой Назад */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/chat')}
        >
          <Ionicons
            name="arrow-back"
            size={moderateScale(28)}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t.tabs.favorites}
        </Text>
        <View style={{ width: scale(40) }} />
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontScale(20),
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
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
    gap: 12,
  },
  emptyList: {
    flex: 1,
  },
  cardWrapper: {
    position: 'relative',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
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