import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/utils/ThemeContext';
import { useLanguage } from '@/utils/LanguageContext';
import { Platform, Dimensions, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '@/constants/colors';
import React, { useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { verticalScale, scale, moderateScale } from '@/utils/responsive';

interface AnimatedTabBarButtonProps {
  children: React.ReactNode;
  onPress?: (event: any) => void;
  accessibilityState?: {
    selected?: boolean;
  };
}

function AnimatedTabBarButton({ children, onPress, accessibilityState }: AnimatedTabBarButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isSelected = accessibilityState?.selected;

  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
      ]).start();
    }
  }, [isSelected]);

  const handlePress = (event: any) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();
    onPress?.(event);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.tabButton}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  // Уменьшаем ширину: панель занимает 50% ширины экрана
  const tabBarWidth = screenWidth * 0.5;
  const marginHorizontal = (screenWidth - tabBarWidth) / 2;

  // Добавляем безопасный отступ снизу для Android
  const tabBarBottomMargin = insets.bottom > 0 ? insets.bottom + verticalScale(8) : verticalScale(20);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isDark ? COLORS.background.dark : COLORS.background.light,
          borderTopWidth: 0,
          height: verticalScale(56),
          paddingBottom: verticalScale(8),
          paddingTop: verticalScale(8),
          paddingHorizontal: scale(20),
          marginHorizontal: marginHorizontal,
          marginBottom: tabBarBottomMargin,
          borderRadius: scale(30),
          shadowColor: COLORS.shadow.black,
          shadowOffset: { width: 0, height: verticalScale(10) },
          shadowOpacity: 0.15,
          shadowRadius: scale(20),
          elevation: 10,
          borderWidth: 1,
          borderColor: isDark ? COLORS.purple.medium : COLORS.purple.light,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={60}
            tint={isDark ? 'dark' : 'light'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 30,
              overflow: 'hidden',
            }}
          />
        ),
        tabBarButton: (props) => <AnimatedTabBarButton {...props} />,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: t.tabs.chat,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={moderateScale(26)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t.tabs.favorites,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={moderateScale(26)} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.tabs.profile,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={moderateScale(26)} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});