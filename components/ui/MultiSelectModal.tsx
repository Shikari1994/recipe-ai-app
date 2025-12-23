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
import { getThemeColors } from '@/constants/colors';
import { ANIMATION, SPACING } from '@/constants/ui';
import { fontScale } from '@/utils/responsive';
import { useLanguage } from '@/utils/LanguageContext';

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
  const [hasChanges, setHasChanges] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { t } = useLanguage();
  const themeColors = getThemeColors(isDark);

  useEffect(() => {
    if (visible) {
      setSelected(selectedValues);
      setHasChanges(false);
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
  }, [visible, selectedValues, slideAnim]);

  const toggleOption = (value: T) => {
    setSelected(prev => {
      const newSelected = prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value];
      console.log('🔄 MultiSelectModal: Selection changed:', newSelected);
      setHasChanges(true);
      return newSelected;
    });
  };

  const handleSave = () => {
    console.log('💾 MultiSelectModal: Saving selections:', selected);
    onSave(selected);
    setHasChanges(false);
    onClose();
  };

  const handleClose = () => {
    // Auto-save if there are changes
    if (hasChanges) {
      console.log('💾 MultiSelectModal: Auto-saving on close:', selected);
      onSave(selected);
    } else {
      console.log('❌ MultiSelectModal: Closing without changes');
    }
    onClose();
  };

  const handleCancel = () => {
    console.log('❌ MultiSelectModal: Cancelled, discarding changes');
    setSelected(selectedValues);
    setHasChanges(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={handleClose}
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
          <View
            style={[
              styles.modal,
              {
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              },
            ]}
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
                  {title}
                </Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={themeColors.primary} />
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
                            ? themeColors.primaryLight
                            : isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                          borderColor: isSelected
                            ? themeColors.primary
                            : themeColors.primaryLight,
                        },
                      ]}
                      onPress={() => toggleOption(option.value)}
                      activeOpacity={0.7}
                    >
                      {option.icon && (
                        <Ionicons
                          name={option.icon}
                          size={20}
                          color={isSelected ? themeColors.primary : isDark ? '#999' : '#666'}
                        />
                      )}
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color: isSelected
                              ? themeColors.primary
                              : isDark
                              ? '#ccc'
                              : '#333',
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                      <View style={[styles.checkbox, { borderColor: themeColors.primary }]}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color={themeColors.primary} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { backgroundColor: themeColors.primaryLight, borderColor: themeColors.primary }
                  ]}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: themeColors.primary }]}>
                    {t.common.cancel}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    { backgroundColor: themeColors.primary }
                  ]}
                  onPress={handleSave}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveButtonText}>
                    {t.common.save} ({selected.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '80%',
    width: '100%',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
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
    fontSize: fontScale(20),
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
    fontSize: fontScale(16),
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
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
    borderWidth: 1,
  },
  saveButton: {
  },
  cancelButtonText: {
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
});
