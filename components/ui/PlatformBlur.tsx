import React from 'react';
import { Platform } from 'react-native';
import { BlurView as ExpoBlurView } from 'expo-blur';

// Условный импорт только для Android
let CommunityBlurView: any;
if (Platform.OS === 'android') {
  CommunityBlurView = require('@react-native-community/blur').BlurView;
}

type PlatformBlurProps = {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: any;
  children?: React.ReactNode;
};

/**
 * Кроссплатформенный компонент размытия
 * iOS/Web: использует expo-blur (BlurView)
 * Android: использует @react-native-community/blur (BlurView) для лучшей поддержки
 */
export const PlatformBlur: React.FC<PlatformBlurProps> = ({
  intensity = 50,
  tint = 'default',
  style,
  children,
}) => {
  // На Android используем @react-native-community/blur для лучшей поддержки
  if (Platform.OS === 'android' && CommunityBlurView) {
    // Конвертируем параметры expo-blur в параметры community-blur
    const blurType = tint === 'dark' ? 'dark' : tint === 'light' ? 'light' : 'xlight';
    const blurAmount = Math.min(100, intensity);

    return (
      <CommunityBlurView
        style={style}
        blurType={blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={
          tint === 'dark' ? 'rgba(20, 20, 25, 0.95)' : 'rgba(255, 255, 255, 0.95)'
        }
      >
        {children}
      </CommunityBlurView>
    );
  }

  // На iOS и web используем expo-blur
  return (
    <ExpoBlurView
      intensity={intensity}
      tint={tint}
      style={style}
    >
      {children}
    </ExpoBlurView>
  );
};
