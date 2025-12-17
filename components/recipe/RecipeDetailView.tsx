import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AIRecipe } from '@/types';
import { useTheme } from '@/utils/ThemeContext';
import { useLanguage } from '@/utils/LanguageContext';
import { getThemeColors, COLORS } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale, BORDER_RADIUS } from '@/utils/responsive';
import { getPlural } from '@/utils/plurals';

/**
 * Извлекает только число из строки
 */
const extractNumber = (value?: string): string => {
  if (!value) return '~';
  const match = value.match(/(\d+)/);
  return match ? match[1] : '~';
};

type RecipeDetailViewProps = {
  recipe: AIRecipe;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  backButtonIcon?: 'chevron-back' | 'close';
};

const RecipeDetailViewComponent = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  showBackButton = false,
  onBack,
  backButtonIcon = 'chevron-back',
}: RecipeDetailViewProps) => {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const themeColors = getThemeColors(isDark);

  const toggleStep = useCallback((index: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Минималистичный хедер */}
      <View style={styles.header}>
        {showBackButton && onBack ? (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name={backButtonIcon} size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}

        <TouchableOpacity
          style={styles.headerButton}
          onPress={onToggleFavorite}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Заголовок рецепта */}
      <Text style={[styles.title, { color: colors.text }]}>
        {recipe.title}
      </Text>

      {/* Мета-информация в строку */}
      <View style={[
        styles.metaRow,
        { borderColor: isDark ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.15)' }
      ]}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={18} color={themeColors.textSecondary} />
          <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
            {extractNumber(recipe.time)} {t.recipe.min}
          </Text>
        </View>

        <Text style={[styles.metaSeparator, { color: themeColors.textSecondary }]}>•</Text>

        <View style={styles.metaItem}>
          <Ionicons name="flame-outline" size={18} color={themeColors.textSecondary} />
          <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
            {extractNumber(recipe.calories)} {t.recipe.kcal}
          </Text>
        </View>

        <Text style={[styles.metaSeparator, { color: themeColors.textSecondary }]}>•</Text>

        <View style={styles.metaItem}>
          <Ionicons name="list-outline" size={18} color={themeColors.textSecondary} />
          <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
            {recipe.steps.length} {getPlural(recipe.steps.length, language, t.recipe)}
          </Text>
        </View>
      </View>

      {/* Шаги приготовления */}
      <View style={styles.stepsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t.recipe.preparation}
        </Text>

        {recipe.steps.map((step, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.stepCard,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                borderColor: checkedSteps[index]
                  ? COLORS.primary
                  : isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
            onPress={() => toggleStep(index)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.stepNumber,
                {
                  backgroundColor: checkedSteps[index]
                    ? COLORS.primary
                    : isDark
                    ? 'rgba(138, 43, 226, 0.15)'
                    : 'rgba(138, 43, 226, 0.1)',
                },
              ]}
            >
              {checkedSteps[index] ? (
                <Ionicons name="checkmark" size={16} color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.stepNumberText,
                    { color: COLORS.primary },
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>

            <Text
              style={[
                styles.stepText,
                {
                  color: colors.text,
                  opacity: checkedSteps[index] ? 0.5 : 1,
                  textDecorationLine: checkedSteps[index] ? 'line-through' : 'none',
                },
              ]}
            >
              {step}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

RecipeDetailViewComponent.displayName = 'RecipeDetailView';

export const RecipeDetailView = React.memo(RecipeDetailViewComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: verticalScale(40),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(8),
  },
  headerButton: {
    width: scale(44),
    height: scale(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontScale(24),
    fontWeight: '600',
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(16),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: verticalScale(24),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  metaText: {
    fontSize: fontScale(13),
    fontWeight: '500',
  },
  metaSeparator: {
    fontSize: fontScale(12),
    marginHorizontal: scale(12),
    opacity: 0.5,
  },
  stepsSection: {
    paddingHorizontal: scale(20),
  },
  sectionTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    marginBottom: verticalScale(16),
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(10),
    padding: scale(14),
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  stepNumber: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: fontScale(13),
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: fontScale(14),
    lineHeight: moderateScale(22),
  },
  bottomPadding: {
    height: verticalScale(20),
  },
});
