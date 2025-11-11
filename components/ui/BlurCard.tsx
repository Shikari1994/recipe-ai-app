import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
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
  borderWidth = 1,
  withShadow = true,
  shadowColor = 'rgba(138, 43, 226, 0.3)',
}) => {
  const blurTint = tint || (isDark ? 'dark' : 'light');

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius,
          borderWidth,
          borderColor: borderColor || 'rgba(138, 43, 226, 0.2)',
        },
        withShadow && {
          shadowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 8,
        },
        style,
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
  );
});

BlurCard.displayName = 'BlurCard';

const styles = StyleSheet.create({
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
