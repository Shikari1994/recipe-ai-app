import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AIRecipe } from '@/types';
import { getThemeColors } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale, BORDER_RADIUS } from '@/utils/responsive';
import { extractTime, extractCalories } from '@/utils/recipeHelpers';
import { getRecipeEmoji } from '@/utils/recipeEmoji';

type AIRecipeCardProps = {
  recipe: AIRecipe;
  isDark: boolean;
  onPress: () => void;
};

const AIRecipeCardComponent = ({ recipe, isDark, onPress }: AIRecipeCardProps) => {
  const themeColors = getThemeColors(isDark);
  const scaleAnim = useRef(new Animated.Value(1)).current;
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

  // Цвета карточки в зависимости от темы (как в чате)
  const cardBgColor = isDark ? 'rgba(45, 45, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const emojiCircleBgColor = isDark ? 'rgba(139, 92, 246, 0.2)' : '#F3F0FF';

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[
        styles.card,
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
          <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={2}>
            {recipe.title}
          </Text>

          {/* Мета информация */}
          <View style={styles.metaRow}>
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

AIRecipeCardComponent.displayName = 'AIRecipeCard';

export const AIRecipeCard = React.memo(AIRecipeCardComponent);

const styles = StyleSheet.create({
  card: {
    width: '100%',
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
  name: {
    fontSize: fontScale(15),
    fontWeight: '600',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(8),
  },
  metaRow: {
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
