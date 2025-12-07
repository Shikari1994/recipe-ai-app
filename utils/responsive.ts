import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Базовые размеры для масштабирования (iPhone X)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Минимальная ширина, ниже которой шрифты будут уменьшаться
const MIN_WIDTH = 320;
// Коэффициент уменьшения для маленьких экранов
const SMALL_SCREEN_FACTOR = 0.85;

/**
 * Функция для горизонтального масштабирования
 * Используется для ширины, горизонтальных отступов, размеров элементов
 * На экранах меньше базового применяется ограничение для предотвращения чрезмерного увеличения
 */
export const scale = (size: number): number => {
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;

  // Для маленьких экранов ограничиваем масштабирование
  if (SCREEN_WIDTH < BASE_WIDTH) {
    const limitedFactor = Math.max(scaleFactor, SMALL_SCREEN_FACTOR);
    return limitedFactor * size;
  }

  return scaleFactor * size;
};

/**
 * Функция для вертикального масштабирования
 * Используется для высоты, вертикальных отступов
 * На экранах меньше базового применяется ограничение
 */
export const verticalScale = (size: number): number => {
  const scaleFactor = SCREEN_HEIGHT / BASE_HEIGHT;

  // Для маленьких экранов ограничиваем масштабирование
  if (SCREEN_WIDTH < BASE_WIDTH) {
    const limitedFactor = Math.max(scaleFactor, SMALL_SCREEN_FACTOR);
    return limitedFactor * size;
  }

  return scaleFactor * size;
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
 * На маленьких экранах шрифты дополнительно уменьшаются
 */
export const fontScale = (size: number): number => {
  // Для маленьких экранов используем более агрессивное уменьшение
  const factor = SCREEN_WIDTH < BASE_WIDTH ? 0.3 : 0.4;
  let newSize = moderateScale(size, factor);

  // Дополнительное уменьшение для очень маленьких экранов
  if (SCREEN_WIDTH < MIN_WIDTH) {
    newSize = newSize * 0.9;
  } else if (SCREEN_WIDTH < BASE_WIDTH) {
    // Плавное уменьшение для экранов меньше базового
    const reduction = 1 - ((BASE_WIDTH - SCREEN_WIDTH) / (BASE_WIDTH - MIN_WIDTH)) * 0.1;
    newSize = newSize * reduction;
  }

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
  isVerySmallDevice: SCREEN_WIDTH < MIN_WIDTH, // < 320px
  isSmallDevice: SCREEN_WIDTH >= MIN_WIDTH && SCREEN_WIDTH < BASE_WIDTH, // 320-374px
  isMediumDevice: SCREEN_WIDTH >= BASE_WIDTH && SCREEN_WIDTH < 414, // 375-413px
  isLargeDevice: SCREEN_WIDTH >= 414, // >= 414px
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
