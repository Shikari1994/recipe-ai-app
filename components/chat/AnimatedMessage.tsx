import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

type AnimatedMessageProps = {
  children: React.ReactNode;
  index: number;
  duration?: number;
  delay?: number;
};

const ANIMATION_DURATION = 300;
const STAGGER_DELAY = 50;
const SLIDE_DISTANCE = 20;

/**
 * Компонент анимированного сообщения с fade и slide эффектами
 * Используется для плавного появления сообщений в чате
 */
export const AnimatedMessage = React.memo<AnimatedMessageProps>(({
  children,
  index,
  duration = ANIMATION_DURATION,
  delay = index * STAGGER_DELAY,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SLIDE_DISTANCE)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, duration, delay]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
});

AnimatedMessage.displayName = 'AnimatedMessage';
