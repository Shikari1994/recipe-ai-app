import React from 'react';
import { BlurView } from 'expo-blur';

type PlatformBlurProps = {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: any;
  children?: React.ReactNode;
};

/**
 * Универсальный компонент размытия для всех платформ
 * Использует expo-blur (BlurView) для iOS, Android и Web
 */
export const PlatformBlur: React.FC<PlatformBlurProps> = ({
  intensity = 50,
  tint = 'default',
  style,
  children,
}) => {
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={style}
    >
      {children}
    </BlurView>
  );
};
