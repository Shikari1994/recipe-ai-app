import { Platform, StatusBar } from 'react-native';
import { scale, verticalScale, moderateScale, fontScale, SPACING as RESPONSIVE_SPACING, BORDER_RADIUS, ICON_SIZES } from '@/utils/responsive';

/**
 * UI константы для размеров, отступов, радиусов и других магических чисел
 * Теперь с адаптивными размерами!
 */

// Размеры
export const SIZES = {
  // Иконки
  iconSmall: ICON_SIZES.sm,
  iconMedium: ICON_SIZES.base,
  iconLarge: ICON_SIZES.xl,
  iconExtraLarge: scale(64),

  // Кнопки и элементы управления
  buttonHeight: verticalScale(50),
  inputHeight: verticalScale(44),
  tabBarHeight: verticalScale(60),

  // Карточки
  cardBorderRadius: BORDER_RADIUS.xl,
  smallBorderRadius: BORDER_RADIUS.lg,
  buttonBorderRadius: BORDER_RADIUS.md,

  // Аватары и круглые элементы
  avatarSmall: scale(32),
  avatarMedium: scale(64),
  avatarLarge: scale(120),
} as const;

// Отступы (используем адаптивные из responsive.ts)
export const SPACING = RESPONSIVE_SPACING;

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
    ios: verticalScale(90),
    android: 0,
    default: 0,
  }),

  // Tab bar отступ снизу
  tabBarMarginBottom: Platform.select({
    ios: verticalScale(30),
    android: verticalScale(20),
    default: verticalScale(20),
  }),

  // Status bar высота
  statusBarHeight: Platform.select({
    ios: verticalScale(44),
    android: 0,
    default: 0,
  }),

  // Safe area отступы
  safeArea: {
    top: Platform.select({
      ios: verticalScale(44),
      android: StatusBar.currentHeight || 0,
      default: 0
    }),
    bottom: Platform.select({ ios: verticalScale(34), default: 0 }),
  },

  // Content padding top
  contentPaddingTop: Platform.select({
    ios: verticalScale(60),
    android: verticalScale(40),
    default: verticalScale(40),
  }),
} as const;

// Layout
export const LAYOUT = {
  // Максимальная ширина для карточек
  maxCardWidth: scale(350),

  // Отступы для контейнеров
  containerPadding: scale(20),
  scrollContentPadding: scale(20),

  // Chat специфичные отступы
  chatBottomPadding: verticalScale(180),
  // УМЕНЬШИЛИ отступ для строки ввода - была проблема №1
  chatInputContainerBottom: Platform.select({
    ios: verticalScale(20),
    android: verticalScale(12),
    default: verticalScale(12),
  }),
} as const;

// Typography (адаптивные размеры шрифтов)
export const TYPOGRAPHY = {
  fontSize: {
    xs: fontScale(11),    // было 12, уменьшили
    sm: fontScale(13),    // было 14, уменьшили
    md: fontScale(15),    // было 16, уменьшили
    lg: fontScale(17),    // было 18, уменьшили
    xl: fontScale(19),    // было 20, уменьшили
    xxl: fontScale(22),   // было 24, уменьшили
    xxxl: fontScale(28),  // было 32, уменьшили
  },
  lineHeight: {
    tight: moderateScale(18),
    normal: moderateScale(22),
    relaxed: moderateScale(26),
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
