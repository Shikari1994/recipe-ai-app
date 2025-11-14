import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Базовые размеры для масштабирования (iPhone X)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Функция для горизонтального масштабирования
 * Используется для ширины, горизонтальных отступов, размеров элементов
 */
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Функция для вертикального масштабирования
 * Используется для высоты, вертикальных отступов
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Функция для умеренного масштабирования (золотая середина)
 * Используется для шрифтов и элементов, которые не должны слишком сильно масштабироваться
 * factor - коэффициент масштабирования (по умолчанию 0.5)
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Функция для масштабирования шрифтов с учетом pixel ratio
 * Обеспечивает более точное отображение текста на разных устройствах
 */
export const fontScale = (size: number): number => {
  const newSize = moderateScale(size, 0.4);
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
  }
};

/**
 * Получить размеры экрана
 */
export const getScreenDimensions = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414,
});

/**
 * Адаптивные размеры шрифтов
 */
export const FONT_SIZES = {
  xs: fontScale(10),
  sm: fontScale(12),
  base: fontScale(14),
  md: fontScale(16),
  lg: fontScale(18),
  xl: fontScale(20),
  xxl: fontScale(24),
  xxxl: fontScale(28),
};

/**
 * Адаптивные отступы
 */
export const SPACING = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  base: scale(16),
  lg: scale(20),
  xl: scale(24),
  xxl: scale(32),
  xxxl: scale(40),
};

/**
 * Адаптивные радиусы скругления
 */
export const BORDER_RADIUS = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  round: scale(999),
};

/**
 * Адаптивные размеры иконок
 */
export const ICON_SIZES = {
  xs: scale(12),
  sm: scale(16),
  md: scale(20),
  base: scale(24),
  lg: scale(28),
  xl: scale(32),
  xxl: scale(40),
};
