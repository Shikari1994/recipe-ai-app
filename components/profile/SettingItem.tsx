import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontScale, scale, verticalScale, moderateScale } from '@/utils/responsive';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
  borderColor: string;
  textColor: string;
  textSecondaryColor: string;
}

export function SettingItem({
  icon,
  title,
  value,
  onPress,
  showArrow = true,
  rightComponent,
  borderColor,
  textColor,
  textSecondaryColor,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: borderColor }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={moderateScale(24)} color="rgba(138, 43, 226, 0.8)" />
        <Text style={[styles.settingTitle, { color: textColor }]}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={[styles.settingValue, { color: textSecondaryColor }]}>{value}</Text>}
        {rightComponent}
        {showArrow && onPress && (
          <Ionicons name="chevron-forward" size={moderateScale(20)} color={textSecondaryColor} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: fontScale(16),
    marginLeft: scale(12),
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  settingValue: {
    fontSize: fontScale(14),
  },
});
