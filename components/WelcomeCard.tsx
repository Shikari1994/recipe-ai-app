import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurCard } from '@/components/ui';
import { COLORS, getThemeColors } from '@/constants/colors';
import { BLUR, SIZES, SHADOWS } from '@/constants/ui';

type WelcomeCardProps = {
  isDark: boolean;
};

export const WelcomeCard = React.memo(({ isDark }: WelcomeCardProps) => {
  const themeColors = getThemeColors(isDark);

  return (
    <View style={styles.wrapper}>
      <BlurCard
        isDark={isDark}
        intensity={BLUR.intensity.medium}
        gradientColors={isDark ? COLORS.gradient.purple.dark : COLORS.gradient.purple.light}
        style={styles.card}
        contentStyle={styles.content}
        borderColor={COLORS.purple.light}
        shadowColor={COLORS.purple.shadow}
      >
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={COLORS.gradient.icon}
            style={styles.iconGradient}
          >
            <Ionicons name="restaurant" size={SIZES.iconLarge} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Привет! 👋
        </Text>
        <Text style={[styles.text, { color: themeColors.welcomeText }]}>
          Я помогу тебе найти рецепты. Напиши, какие продукты у тебя есть, или сфотографируй их!
        </Text>
      </BlurCard>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: SIZES.cardBorderRadius * 14.5, // ~350px
  },
  content: {
    padding: SIZES.cardBorderRadius + 8, // 32px
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: SIZES.iconExtraLarge,
    height: SIZES.iconExtraLarge,
    borderRadius: SIZES.iconExtraLarge / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.purple,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
