import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fontScale, scale, verticalScale } from '@/utils/responsive';

interface ProfileHeaderProps {
  userName: string;
  textColor: string;
}

export function ProfileHeader({ userName, textColor }: ProfileHeaderProps) {
  return (
    <View style={styles.profileSection}>
      <View style={styles.avatarContainer}>
        <LinearGradient
          colors={['rgba(138, 43, 226, 0.8)', 'rgba(75, 0, 130, 0.8)']}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{userName[0]}</Text>
        </LinearGradient>
      </View>
      <Text style={[styles.userName, { color: textColor }]}>{userName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    alignItems: 'center',
    paddingVertical: verticalScale(32),
    marginBottom: verticalScale(24),
  },
  avatarContainer: {
    marginBottom: verticalScale(16),
  },
  avatar: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontScale(32),
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: fontScale(24),
    fontWeight: '600',
  },
});
