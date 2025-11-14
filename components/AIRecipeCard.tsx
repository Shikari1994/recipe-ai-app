import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurCard } from '@/components/ui';
import { AIRecipe } from '@/utils/aiService';
import { COLORS, getThemeColors } from '@/constants/colors';
import { getRussianPlural } from '@/utils/textUtils';
import { scale, verticalScale, fontScale, moderateScale, BORDER_RADIUS } from '@/utils/responsive';

type AIRecipeCardProps = {
  recipe: AIRecipe;
  isDark: boolean;
  onPress: () => void;
};

export const AIRecipeCard = React.memo(({ recipe, isDark, onPress }: AIRecipeCardProps) => {
  const themeColors = getThemeColors(isDark);

  // Создаем краткое описание из первого шага
  const shortDescription = recipe.steps[0] || 'Нажмите, чтобы посмотреть рецепт';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <BlurCard
        isDark={isDark}
        intensity={60}
        gradientColors={isDark ? COLORS.gradient.purple.dark : COLORS.gradient.purple.light}
        style={styles.card}
        contentStyle={styles.content}
        borderRadius={12}
        borderColor={isDark ? COLORS.purple.medium : COLORS.purple.light}
        shadowColor={COLORS.purple.shadow}
      >
        <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)' }]} pointerEvents="none" />
        <View style={styles.header}>
          <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={2}>
            {recipe.title}
          </Text>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={moderateScale(13)} color={themeColors.textSecondary} />
            <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
              {recipe.time}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, { color: themeColors.textTertiary }]} numberOfLines={2}>
          {shortDescription}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.ingredients, { color: themeColors.textQuaternary }]} numberOfLines={1}>
            {recipe.steps.length} {getRussianPlural(recipe.steps.length, 'шаг', 'шага', 'шагов')}
          </Text>
        </View>
      </BlurCard>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: verticalScale(160),
    alignSelf: 'flex-start',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: scale(12),
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: verticalScale(6),
  },
  name: {
    fontSize: fontScale(14),
    fontWeight: '600',
    marginBottom: verticalScale(4),
    lineHeight: moderateScale(17),
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  metaText: {
    fontSize: fontScale(11),
  },
  description: {
    fontSize: fontScale(11),
    lineHeight: moderateScale(15),
    marginBottom: verticalScale(6),
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(138, 43, 226, 0.15)',
    paddingTop: verticalScale(6),
  },
  ingredients: {
    fontSize: fontScale(10),
    fontStyle: 'italic',
  },
});
