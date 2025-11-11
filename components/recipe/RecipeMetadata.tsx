import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRussianPlural } from '@/utils/textUtils';

type RecipeMetadataProps = {
  time?: string;
  calories?: string;
  servings?: number;
  difficulty?: string;
  textColor: string;
};

/**
 * Компонент для отображения метаданных рецепта (время, калории, порции, сложность)
 */
export const RecipeMetadata = React.memo<RecipeMetadataProps>(({
  time,
  calories,
  servings,
  difficulty,
  textColor,
}) => {
  const metadataItems = [
    { icon: 'time-outline', value: time, label: 'Время' },
    { icon: 'flame-outline', value: calories, label: 'Калории' },
    { icon: 'people-outline', value: servings ? `${servings} ${getRussianPlural(servings, 'порция', 'порции', 'порций')}` : undefined, label: 'Порции' },
    { icon: 'fitness-outline', value: difficulty, label: 'Сложность' },
  ].filter(item => item.value);

  if (metadataItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {metadataItems.map((item, index) => (
        <View key={index} style={styles.item}>
          <Ionicons
            name={item.icon as any}
            size={20}
            color="rgba(138, 43, 226, 0.8)"
          />
          <Text style={[styles.text, { color: textColor }]}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
});

RecipeMetadata.displayName = 'RecipeMetadata';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
  },
});
