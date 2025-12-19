import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PlatformBlur } from '@/components/ui/PlatformBlur';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale, BORDER_RADIUS } from '@/utils/responsive';
import { extractTime, extractCalories } from '@/utils/recipeHelpers';
import { getRecipeEmoji } from '@/utils/recipeEmoji';
import type { AIRecipe } from '@/types';

type RecipePreviewCardProps = {
  recipe: AIRecipe;
  isDark: boolean;
  onPress: () => void;
};

const RecipePreviewCardComponent = ({ recipe, isDark, onPress }: RecipePreviewCardProps) => {
  const themeColors = getThemeColors(isDark);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const emoji = getRecipeEmoji(recipe.title);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  // Цвета карточки в зависимости от темы
  const cardBgColor = isDark ? 'rgba(45, 45, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const emojiCircleBgColor = isDark ? 'rgba(139, 92, 246, 0.2)' : '#F3F0FF';

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[
        styles.recipeCard,
        {
          backgroundColor: cardBgColor,
          transform: [{ scale: scaleAnim }],
          borderWidth: isDark ? 1 : 0,
          borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
        }
      ]}>
        {/* Иконка эмодзи */}
        <View style={styles.emojiContainer}>
          <View style={[styles.emojiCircle, { backgroundColor: emojiCircleBgColor }]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        </View>

        {/* Контент карточки */}
        <View style={styles.cardContent}>
          <Text style={[styles.recipeName, { color: themeColors.text }]} numberOfLines={2}>
            {recipe.title}
          </Text>

          {/* Мета информация */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={moderateScale(14)} color={isDark ? '#A78BFA' : themeColors.textSecondary} />
              <Text style={[styles.metaText, { color: isDark ? '#A78BFA' : themeColors.textSecondary }]}>
                {extractTime(recipe.time)} мин
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="flame" size={moderateScale(14)} color="#FF9500" />
              <Text style={[styles.metaText, { color: isDark ? '#FFB347' : themeColors.textSecondary }]}>
                {extractCalories(recipe.calories)}
              </Text>
            </View>

            <View style={[styles.stepsButton, { backgroundColor: '#FF9500' }]}>
              <Ionicons name="list" size={moderateScale(12)} color="#fff" />
              <Text style={styles.stepsText}>{recipe.steps.length}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

RecipePreviewCardComponent.displayName = 'RecipePreviewCard';

const RecipePreviewCard = React.memo(RecipePreviewCardComponent);

type AIMessageBubbleProps = {
  text: string;
  recipes?: AIRecipe[];
  isDark: boolean;
  onRecipePress: (recipe: AIRecipe) => void;
};

const AIMessageBubbleComponent = ({ text, recipes, isDark, onRecipePress }: AIMessageBubbleProps) => {
  const themeColors = getThemeColors(isDark);
  const hasRecipes = recipes && recipes.length > 0;

  return (
    <View style={styles.container}>
      {/* AI Аватар */}
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={['#A78BFA', '#8B5CF6']}
          style={styles.avatar}
        >
          <Text style={styles.avatarEmoji}>🤖</Text>
        </LinearGradient>
      </View>

      {/* Облако сообщения */}
      <View style={styles.bubbleContainer}>
        <PlatformBlur
          intensity={isDark ? 40 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blur}
        />
        <View style={[
          styles.bubbleOverlay,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)' }
        ]} />

        <View style={styles.bubbleContent}>
          {/* Текст сообщения */}
          <Text style={[styles.messageText, { color: themeColors.text }]}>
            {text}
          </Text>

          {/* Карточки рецептов */}
          {hasRecipes && (
            <View style={styles.recipesContainer}>
              {recipes.map((recipe) => (
                <RecipePreviewCard
                  key={recipe.id}
                  recipe={recipe}
                  isDark={isDark}
                  onPress={() => onRecipePress(recipe)}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

AIMessageBubbleComponent.displayName = 'AIMessageBubble';

export const AIMessageBubble = React.memo(AIMessageBubbleComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
    maxWidth: '95%',
  },
  avatarContainer: {
    marginRight: scale(8),
    marginTop: verticalScale(4),
  },
  avatar: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: fontScale(18),
  },
  bubbleContainer: {
    flex: 1,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  bubbleOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bubbleContent: {
    padding: scale(16),
  },
  messageText: {
    fontSize: fontScale(15),
    lineHeight: moderateScale(22),
    fontWeight: '500',
  },
  recipesContainer: {
    marginTop: verticalScale(16),
    gap: verticalScale(12),
  },
  // Recipe Card Styles
  recipeCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emojiContainer: {
    marginRight: scale(12),
  },
  emojiCircle: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: fontScale(24),
  },
  cardContent: {
    flex: 1,
  },
  recipeName: {
    fontSize: fontScale(15),
    fontWeight: '600',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(8),
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  metaText: {
    fontSize: fontScale(12),
    fontWeight: '500',
  },
  stepsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
    borderRadius: scale(12),
  },
  stepsText: {
    color: '#fff',
    fontSize: fontScale(12),
    fontWeight: '700',
  },
});
