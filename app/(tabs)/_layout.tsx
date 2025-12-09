import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/utils/LanguageContext';
import React from 'react';
import { moderateScale } from '@/utils/responsive';

export default function TabsLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Полностью скрываем tab bar
        tabBarStyle: {
          display: 'none',
        },
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