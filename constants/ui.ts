import { Platform } from 'react-native';

/**
 * UI константы для размеров, отступов, радиусов и других магических чисел
 */

// Размеры
export const SIZES = {
  // Иконки
  iconSmall: 20,
  iconMedium: 24,
  iconLarge: 32,
  iconExtraLarge: 64,

  // Кнопки и элементы управления
  buttonHeight: 60,
  inputHeight: 50,
  tabBarHeight: 60,

  // Карточки
  cardBorderRadius: 24,
  smallBorderRadius: 16,
  buttonBorderRadius: 12,

  // Аватары и круглые элементы
  avatarSmall: 32,
  avatarMedium: 64,
  avatarLarge: 120,
} as const;

// Отступы
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Анимации
export const ANIMATION = {
  // Durations (мс)
  fast: 200,
  normal: 300,
  slow: 500,

  // Spring анимации
  spring: {
    tension: 65,
    friction: 10,
  },

  // Stagger для списков
  staggerDelay: 50,

  // Slide distances
  slideDistance: 20,
} as const;

// Blur эффекты
export const BLUR = {
  intensity: {
    light: 40,
    medium: 60,
    strong: 80,
  },
} as const;

// Тени
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  purple: {
    shadowColor: 'rgba(138, 43, 226, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

// Платформо-специфичные значения
export const PLATFORM = {
  // Keyboard offset для iOS/Android
  keyboardVerticalOffset: Platform.select({
    ios: 90,
    android: 0,
    default: 0,
  }),

  // Tab bar отступ снизу
  tabBarMarginBottom: Platform.select({
    ios: 30,
    android: 20,
    default: 20,
  }),

  // Status bar высота
  statusBarHeight: Platform.select({
    ios: 44,
    android: 0,
    default: 0,
  }),

  // Safe area отступы
  safeArea: {
    top: Platform.select({ ios: 44, default: 0 }),
    bottom: Platform.select({ ios: 34, default: 0 }),
  },

  // Content padding top
  contentPaddingTop: Platform.select({
    ios: 60,
    android: 40,
    default: 40,
  }),
} as const;

// Layout
export const LAYOUT = {
  // Максимальная ширина для карточек
  maxCardWidth: 350,

  // Отступы для контейнеров
  containerPadding: 20,
  scrollContentPadding: 20,

  // Chat специфичные отступы
  chatBottomPadding: 180,
  chatInputContainerBottom: Platform.select({
    ios: 140,
    android: 110,
    default: 110,
  }),
} as const;

// Typography
export const TYPOGRAPHY = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    tight: 20,
    normal: 24,
    relaxed: 28,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// Экспорт типов для TypeScript
export type Sizes = typeof SIZES;
export type Spacing = typeof SPACING;
export type Animation = typeof ANIMATION;
export type Shadows = typeof SHADOWS;
export type PlatformConstants = typeof PLATFORM;
export type Layout = typeof LAYOUT;
export type Typography = typeof TYPOGRAPHY;
