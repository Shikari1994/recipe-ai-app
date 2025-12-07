import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView, BlurTint } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

type BlurCardProps = {
  children: React.ReactNode;
  isDark?: boolean;
  intensity?: number;
  tint?: BlurTint;
  gradientColors?: readonly string[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  withShadow?: boolean;
  shadowColor?: string;
};

/**
 * Переиспользуемый компонент карточки с эффектом размытия и градиентом
 * Объединяет BlurView + LinearGradient паттерн
 */
export const BlurCard = React.memo<BlurCardProps>(({
  children,
  isDark = false,
  intensity = 60,
  tint,
  gradientColors,
  style,
  contentStyle,
  borderRadius = 24,
  borderColor,
  borderWidth = 0,
  withShadow = true,
  shadowColor = 'rgba(138, 43, 226, 0.3)',
}) => {
  const blurTint = tint || (isDark ? 'dark' : 'light');

  return (
    <View style={[styles.wrapper, style]}>
      {/* Мягкое свечение вокруг карточки */}
      {withShadow && (
        <View
          style={[
            styles.glowContainer,
            {
              borderRadius: borderRadius + 2,
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(167, 139, 250, 0.4)',
              'rgba(167, 139, 250, 0.2)',
              'rgba(167, 139, 250, 0)',
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.glow, { borderRadius: borderRadius + 2 }]}
          />
        </View>
      )}

      {/* Основная карточка с тонкой границей */}
      <View
        style={[
          styles.card,
          {
            borderRadius,
            borderWidth: borderWidth > 0 ? borderWidth : 1,
            borderColor: borderWidth > 0
              ? (borderColor || 'rgba(138, 43, 226, 0.2)')
              : 'rgba(200, 180, 255, 0.4)',
          },
          withShadow && {
            shadowColor: '#A78BFA',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 6,
          },
        ]}
      >
        <BlurView
          intensity={intensity}
          tint={blurTint}
          style={styles.blur}
        />
        {gradientColors && (
          <LinearGradient
            colors={gradientColors as any}
            style={styles.gradient}
          />
        )}
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      </View>
    </View>
  );
});

BlurCard.displayName = 'BlurCard';

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    pointerEvents: 'none',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    overflow: 'hidden',
    position: 'relative',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    zIndex: 1,
  },
});
