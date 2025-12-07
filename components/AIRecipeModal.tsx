import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import type { AIRecipe } from '@/types';
import { useTheme } from '@/utils/ThemeContext';
import { useRecipeActions } from '@/hooks';
import { RecipeDetailView } from '@/components/recipe/RecipeDetailView';
import { ANIMATION } from '@/constants/ui';

type AIRecipeModalProps = {
  visible: boolean;
  recipe: AIRecipe | null;
  onClose: () => void;
};

export const AIRecipeModal = React.memo(({ visible, recipe, onClose }: AIRecipeModalProps) => {
  const { isDark } = useTheme();
  const { isFavorite, toggleFavorite } = useRecipeActions(recipe?.id);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Анимация открытия
  useEffect(() => {
    if (visible && recipe) {
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
  }, [visible, recipe, slideAnim]);

  const handleToggleFavorite = useCallback(async () => {
    if (!recipe) return;
    await toggleFavorite(recipe);
  }, [recipe, toggleFavorite]);

  const handleClose = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: ANIMATION.normal,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [slideAnim, onClose]);

  if (!recipe) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1000, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      >
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      </TouchableOpacity>

      <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? '#1a1a2e' : '#ffffff' }]}>
          <RecipeDetailView
            recipe={recipe}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            showBackButton={true}
            onBack={handleClose}
            backButtonIcon="close"
          />
        </View>
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalCard: {
    width: '100%',
    height: '90%',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
});
