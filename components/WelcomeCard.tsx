import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLanguage } from '@/utils/LanguageContext';
import { COLORS, getThemeColors } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale } from '@/utils/responsive';

type WelcomeCardProps = {
  isDark: boolean;
};

export const WelcomeCard = React.memo(({ isDark }: WelcomeCardProps) => {
  const themeColors = getThemeColors(isDark);
  const { t } = useLanguage();

  return (
    <View style={styles.wrapper}>
      {/* Основная карточка */}
      <View style={[
        styles.card,
        {
          borderColor: 'rgba(200, 180, 255, 0.4)',
        }
      ]}>
        <BlurView
          intensity={isDark ? 80 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={styles.blur}
        />

        <View style={styles.content}>
          {/* Лого */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={COLORS.gradient.icon}
              style={styles.logo}
            >
              <Ionicons name="restaurant" size={moderateScale(24)} color="#fff" />
            </LinearGradient>
          </View>

          {/* Текст */}
          <Text style={[styles.greeting, { color: themeColors.text }]}>
            {t.welcome.title}
          </Text>
          <Text style={[styles.description, { color: themeColors.textSecondary }]}>
            {t.welcome.subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingHorizontal: scale(20),
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: scale(350),
    borderRadius: scale(16),
    borderWidth: 1,
    overflow: 'hidden',
  },
  blur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: scale(24),
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: verticalScale(12),
  },
  logo: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: fontScale(18),
    fontWeight: '700',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  description: {
    fontSize: fontScale(14),
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
});
