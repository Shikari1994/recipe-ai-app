import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/ui';
import { fontScale, moderateScale } from '@/utils/responsive';

type ServingsSelectorProps = {
  servings: number;
  onServingsChange: (servings: number) => void;
  isDark: boolean;
};

const SERVINGS_OPTIONS = [1, 2, 3, 4];

export function ServingsSelector({ servings, onServingsChange, isDark }: ServingsSelectorProps) {
  return (
    <View style={styles.container}>
      {SERVINGS_OPTIONS.map((option) => {
        const isSelected = servings === option;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              {
                backgroundColor: isSelected
                  ? COLORS.primary
                  : 'rgba(138, 43, 226, 0.1)',
                borderColor: isSelected
                  ? COLORS.primary
                  : 'rgba(138, 43, 226, 0.3)',
              },
            ]}
            onPress={() => onServingsChange(option)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="people"
              size={moderateScale(20)}
              color={isSelected ? '#fff' : COLORS.primary}
            />
            <Text
              style={[
                styles.optionText,
                {
                  color: isSelected ? '#fff' : isDark ? '#ccc' : '#333',
                },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 60,
    justifyContent: 'center',
  },
  optionText: {
    fontSize: fontScale(16),
    fontWeight: '600',
  },
});
