import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurCard } from './BlurCard';
import { COLORS } from '@/constants/colors';
import { ANIMATION, SPACING } from '@/constants/ui';

type MultiSelectOption<T> = {
  value: T;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

type MultiSelectModalProps<T> = {
  visible: boolean;
  title: string;
  options: MultiSelectOption<T>[];
  selectedValues: T[];
  onClose: () => void;
  onSave: (selected: T[]) => void;
  isDark: boolean;
};

export function MultiSelectModal<T extends string>({
  visible,
  title,
  options,
  selectedValues,
  onClose,
  onSave,
  isDark,
}: MultiSelectModalProps<T>) {
  const [selected, setSelected] = useState<T[]>(selectedValues);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSelected(selectedValues);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: ANIMATION.spring.tension,
        friction: ANIMATION.spring.friction,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION.normal,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, selectedValues]);

  const toggleOption = (value: T) => {
    setSelected(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <BlurCard
            isDark={isDark}
            intensity={80}
            gradientColors={isDark ? COLORS.gradient.purple.dark : COLORS.gradient.purple.light}
            style={styles.modal}
            contentStyle={styles.content}
            borderRadius={20}
            borderColor={isDark ? COLORS.purple.medium : COLORS.purple.light}
            withShadow={true}
          >
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
                  {title}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                {options.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.option,
                        {
                          backgroundColor: isSelected
                            ? 'rgba(138, 43, 226, 0.2)'
                            : 'rgba(138, 43, 226, 0.05)',
                          borderColor: isSelected
                            ? COLORS.primary
                            : 'rgba(138, 43, 226, 0.2)',
                        },
                      ]}
                      onPress={() => toggleOption(option.value)}
                      activeOpacity={0.7}
                    >
                      {option.icon && (
                        <Ionicons
                          name={option.icon}
                          size={20}
                          color={isSelected ? COLORS.primary : isDark ? '#999' : '#666'}
                        />
                      )}
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color: isSelected
                              ? COLORS.primary
                              : isDark
                              ? '#ccc'
                              : '#333',
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                      <View style={styles.checkbox}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveButtonText}>
                    Сохранить ({selected.length})
                  </Text>
                </TouchableOpacity>
              </View>
          </BlurCard>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '80%',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: SPACING.sm,
  },
  optionsList: {
    maxHeight: 400,
    marginBottom: SPACING.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
