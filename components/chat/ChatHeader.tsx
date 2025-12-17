import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlatformBlur } from '@/components/ui/PlatformBlur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { scale, verticalScale, fontScale, moderateScale } from '@/utils/responsive';

type ChatHeaderProps = {
  title: string;
  isDark: boolean;
  topInset: number;
  onMenuPress: () => void;
  onFavoritesPress: () => void;
};

const ChatHeaderComponent = ({ title, isDark, topInset, onMenuPress, onFavoritesPress }: ChatHeaderProps) => {
  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: topInset + verticalScale(8),
        },
      ]}
      pointerEvents="box-none"
    >
      <PlatformBlur
        intensity={60}
        tint={isDark ? 'dark' : 'light'}
        style={styles.headerBlur}
      />
      <LinearGradient
        colors={isDark ? COLORS.gradient.purple.dark : COLORS.gradient.purple.light}
        style={styles.headerGradient}
      />
      <View style={[
        styles.headerOverlay,
        {
          backgroundColor: isDark
            ? (Platform.OS === 'android' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.3)')
            : (Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.3)')
        }
      ]} />

      <View style={styles.headerContent} pointerEvents="auto">
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
        >
          <Ionicons
            name="menu"
            size={moderateScale(28)}
            color={isDark ? '#fff' : '#333'}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? '#fff' : '#333' },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <TouchableOpacity
          style={styles.favoritesButton}
          onPress={onFavoritesPress}
        >
          <Ionicons
            name="heart"
            size={moderateScale(26)}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

ChatHeaderComponent.displayName = 'ChatHeader';

export const ChatHeader = React.memo(ChatHeaderComponent);

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingBottom: verticalScale(12),
    overflow: 'hidden',
  },
  headerBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
  },
  menuButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoritesButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: scale(8),
  },
});
