import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PlatformBlur } from '@/components/ui/PlatformBlur';
import { getThemeColors } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale, BORDER_RADIUS } from '@/utils/responsive';
import { AIRecipeCard } from '@/components/AIRecipeCard';
import type { AIRecipe } from '@/types';

type AIMessageBubbleProps = {
  text: string;
  recipes?: AIRecipe[];
  isDark: boolean;
  onRecipePress: (recipe: AIRecipe) => void;
};

const AIMessageBubbleComponent = ({ text, recipes, isDark, onRecipePress }: AIMessageBubbleProps) => {
  const themeColors = useMemo(() => getThemeColors(isDark), [isDark]);
  const hasRecipes = recipes && recipes.length > 0;

  return (
    <View style={styles.container}>
      {/* AI Аватар */}
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={themeColors.gradientIcon}
          style={styles.avatar}
        >
          <Text style={styles.avatarEmoji}>🤖</Text>
        </LinearGradient>
      </View>

      {/* Облако сообщения */}
      <View style={[styles.bubbleContainer, { borderColor: themeColors.primaryLight }]}>
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
                <AIRecipeCard
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
});
