import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurCard } from '@/components/ui';
import { AIRecipe } from '@/utils/aiService';
import { COLORS, getThemeColors } from '@/constants/colors';
import { getRussianPlural } from '@/utils/textUtils';

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
        intensity={90}
        gradientColors={isDark ? COLORS.gradient.purple.dark : COLORS.gradient.purple.light}
        style={styles.card}
        contentStyle={styles.content}
        borderRadius={12}
        borderColor={isDark ? COLORS.purple.medium : COLORS.purple.light}
        shadowColor={COLORS.purple.shadow}
      >
        <View style={styles.overlay} pointerEvents="none" />
        <View style={styles.header}>
          <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={2}>
            {recipe.title}
          </Text>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={14} color={themeColors.textSecondary} />
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
    height: 170,
    alignSelf: 'flex-start',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    padding: 14,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(138, 43, 226, 0.15)',
    paddingTop: 8,
  },
  ingredients: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
