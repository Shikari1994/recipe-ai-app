import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { fontScale } from '@/utils/responsive';

interface AnimatedDotsProps {
  color?: string;
}

export function AnimatedDots({ color = '#fff' }: AnimatedDotsProps) {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createAnimation = (dotOpacity: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotOpacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation = Animated.parallel([
      createAnimation(dot1Opacity, 0),
      createAnimation(dot2Opacity, 200),
      createAnimation(dot3Opacity, 400),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.dot, { color, opacity: dot1Opacity }]}>
        .
      </Animated.Text>
      <Animated.Text style={[styles.dot, { color, opacity: dot2Opacity }]}>
        .
      </Animated.Text>
      <Animated.Text style={[styles.dot, { color, opacity: dot3Opacity }]}>
        .
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  dot: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    marginHorizontal: 1,
  },
});
