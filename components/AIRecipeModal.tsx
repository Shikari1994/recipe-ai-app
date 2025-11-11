import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AIRecipe } from '@/utils/aiService';
import { useTheme } from '@/utils/ThemeContext';
import { useRecipeActions } from '@/hooks';
import { RecipeMetadata, RecipeSteps } from '@/components/recipe';
import { getThemeColors, COLORS } from '@/constants/colors';
import { ANIMATION, SIZES } from '@/constants/ui';

type AIRecipeModalProps = {
  visible: boolean;
  recipe: AIRecipe | null;
  onClose: () => void;
};

export const AIRecipeModal = React.memo(({ visible, recipe, onClose }: AIRecipeModalProps) => {
  const { colors, isDark } = useTheme();
  const { isFavorite, toggleFavorite } = useRecipeActions(recipe?.id);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [internalVisible, setInternalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const themeColors = getThemeColors(isDark);

  // Анимация открытия
  useEffect(() => {
    if (visible && recipe) {
      setInternalVisible(true);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: ANIMATION.spring.tension,
        friction: ANIMATION.spring.friction,
      }).start();
    }
  }, [visible, recipe, slideAnim]);

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

  const handleClose = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: ANIMATION.normal,
      useNativeDriver: true,
    }).start(() => {
      setInternalVisible(false);
      setCheckedSteps({});
      onClose();
    });
  }, [slideAnim, onClose]);

  if (!recipe) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1000, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      visible={internalVisible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      >
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      </TouchableOpacity>

      <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
        <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
          {/* Заголовок */}
          <View style={[styles.modalHeader, { backgroundColor: colors.background, borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
              <Ionicons name="close" size={32} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
              Рецепт
            </Text>
            <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite} activeOpacity={0.7}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={32}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Контент с прокруткой */}
          <ScrollView
            style={styles.scrollWrapper}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            <View style={styles.content}>
              {/* Название рецепта */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>{recipe.title}</Text>
              </View>

              {/* Метаданные рецепта */}
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
            </View>
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalCard: {
    width: '100%',
    height: '85%',
    borderRadius: SIZES.cardBorderRadius,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    width: 40,
  },
  favoriteButton: {
    padding: 4,
    width: 40,
    alignItems: 'flex-end',
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 0,
  },
  header: {
    padding: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
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
    height: 40,
  },
});
