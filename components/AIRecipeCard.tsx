import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import type { AIRecipe } from '@/types';
import { COLORS, getThemeColors } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale, BORDER_RADIUS } from '@/utils/responsive';
import { extractTime, extractCalories } from '@/utils/recipeHelpers';

type BounceIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  size: number;
  color: string;
  delay: number;
};

const BounceIcon = React.memo(({ name, size, color, delay }: BounceIconProps) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 300,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [bounceAnim, delay]);

  const scaleValue = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
});

type AIRecipeCardProps = {
  recipe: AIRecipe;
  isDark: boolean;
  onPress: () => void;
};

export const AIRecipeCard = React.memo(({ recipe, isDark, onPress }: AIRecipeCardProps) => {
  const themeColors = getThemeColors(isDark);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[
        styles.card,
        {
          borderWidth: 1,
          borderColor: isDark
            ? 'rgba(167, 139, 250, 0.4)'
            : 'rgba(138, 43, 226, 0.3)',
          transform: [{ scale: scaleAnim }],
        }
      ]}>
        <BlurView
          intensity={isDark ? 70 : 50}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blur}
        />
        <LinearGradient
          colors={isDark ? COLORS.gradient.purple.dark : COLORS.gradient.purple.light}
          style={styles.gradient}
        />

        <View style={styles.content}>
          <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={2} ellipsizeMode="tail">
            {recipe.title}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <BounceIcon name="time-outline" size={moderateScale(14)} color={themeColors.textSecondary} delay={100} />
              <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                {extractTime(recipe.time)}
              </Text>
            </View>

            <Text style={[styles.separator, { color: themeColors.textSecondary }]}>•</Text>

            <View style={styles.metaItem}>
              <BounceIcon name="flame-outline" size={moderateScale(14)} color={themeColors.textSecondary} delay={200} />
              <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                {extractCalories(recipe.calories)}
              </Text>
            </View>

            <Text style={[styles.separator, { color: themeColors.textSecondary }]}>•</Text>

            <View style={styles.metaItem}>
              <BounceIcon name="list-outline" size={moderateScale(14)} color={themeColors.textSecondary} delay={300} />
              <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                {recipe.steps.length}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: scale(12),
  },
  name: {
    fontSize: fontScale(14),
    fontWeight: '500',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(10),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: 'rgba(138, 43, 226, 0.25)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  metaText: {
    fontSize: fontScale(12),
    fontWeight: '600',
  },
  separator: {
    fontSize: fontScale(10),
    marginHorizontal: scale(10),
    opacity: 0.5,
  },
});
