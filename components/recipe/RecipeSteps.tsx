import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

type RecipeStepsProps = {
  steps: string[];
  checkedSteps?: Record<number, boolean>;
  onStepToggle?: (index: number) => void;
  textColor: string;
  allowChecking?: boolean;
};

/**
 * Компонент для отображения шагов приготовления рецепта
 * Поддерживает отметку выполненных шагов
 */
export const RecipeSteps = React.memo<RecipeStepsProps>(({
  steps,
  checkedSteps = {},
  onStepToggle,
  textColor,
  allowChecking = true,
}) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isChecked = checkedSteps[index] || false;

        return (
          <TouchableOpacity
            key={index}
            style={styles.stepItem}
            onPress={() => allowChecking && onStepToggle?.(index)}
            activeOpacity={allowChecking ? 0.7 : 1}
            disabled={!allowChecking || !onStepToggle}
          >
            <View
              style={[
                styles.stepNumber,
                isChecked && styles.stepNumberChecked,
              ]}
            >
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text
              style={[
                styles.stepText,
                { color: textColor },
                isChecked && styles.stepTextChecked,
              ]}
            >
              {step}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

RecipeSteps.displayName = 'RecipeSteps';

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberChecked: {
    backgroundColor: '#4CAF50',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  stepTextChecked: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
});
