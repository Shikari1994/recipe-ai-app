import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

/**
 * Кастомная темная тема на основе Material Design 3
 * с фиолетовыми цветами (138, 43, 226) - BlueViolet
 */
export const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Основные фиолетовые цвета приложения
    primary: 'rgb(138, 43, 226)', // BlueViolet
    onPrimary: 'rgb(255, 255, 255)',
    primaryContainer: 'rgb(95, 30, 155)', // Темнее для контейнеров
    onPrimaryContainer: 'rgb(230, 200, 255)',

    // Второстепенные цвета (более мягкий фиолетовый)
    secondary: 'rgb(180, 120, 220)',
    onSecondary: 'rgb(255, 255, 255)',
    secondaryContainer: 'rgb(75, 0, 130)', // Indigo
    onSecondaryContainer: 'rgb(230, 200, 255)',

    // Третичные цвета (розовый акцент для FF6B6B)
    tertiary: 'rgb(255, 107, 107)', // FF6B6B
    onTertiary: 'rgb(255, 255, 255)',
    tertiaryContainer: 'rgb(200, 50, 50)',
    onTertiaryContainer: 'rgb(255, 220, 220)',

    // Ошибки
    error: 'rgb(255, 107, 107)',
    onError: 'rgb(255, 255, 255)',
    errorContainer: 'rgb(147, 0, 10)',
    onErrorContainer: 'rgb(255, 180, 171)',

    // Фоны - темная тема
    background: 'rgb(18, 18, 20)', // Очень темный
    onBackground: 'rgb(230, 230, 235)',

    // Поверхности (карточки, модалы и т.д.) - слегка светлее фона
    surface: 'rgb(28, 28, 32)',
    onSurface: 'rgb(230, 230, 235)',
    surfaceVariant: 'rgb(40, 40, 45)',
    onSurfaceVariant: 'rgb(200, 200, 210)',

    // Разделители и границы - тонкие линии
    outline: 'rgba(138, 43, 226, 0.3)',
    outlineVariant: 'rgba(255, 255, 255, 0.1)',

    // Тени и оверлеи
    shadow: 'rgba(138, 43, 226, 0.5)',
    scrim: 'rgba(0, 0, 0, 0.5)',

    // Инвертированные поверхности
    inverseSurface: 'rgb(230, 230, 235)',
    inverseOnSurface: 'rgb(28, 28, 32)',
    inversePrimary: 'rgb(138, 43, 226)',

    // Дополнительные уровни elevation для карточек
    elevation: {
      level0: 'transparent',
      level1: 'rgb(30, 30, 35)', // Чуть светлее surface
      level2: 'rgb(35, 35, 40)',
      level3: 'rgb(40, 40, 45)',
      level4: 'rgb(42, 42, 47)',
      level5: 'rgb(45, 45, 50)',
    },

    // Кастомные цвета
    surfaceDisabled: 'rgba(230, 230, 235, 0.12)',
    onSurfaceDisabled: 'rgba(230, 230, 235, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.6)',
  },

  // Округления углов
  roundness: 12,
};

/**
 * Кастомная светлая тема на основе Material Design 3
 * с фиолетовыми цветами (138, 43, 226) - BlueViolet
 */
export const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Основные фиолетовые цвета приложения
    primary: 'rgb(138, 43, 226)', // BlueViolet
    onPrimary: 'rgb(255, 255, 255)',
    primaryContainer: 'rgb(240, 220, 255)', // Светлый фиолетовый для контейнеров
    onPrimaryContainer: 'rgb(60, 0, 100)',

    // Второстепенные цвета
    secondary: 'rgb(120, 70, 180)',
    onSecondary: 'rgb(255, 255, 255)',
    secondaryContainer: 'rgb(235, 220, 250)',
    onSecondaryContainer: 'rgb(40, 0, 80)',

    // Третичные цвета (розовый акцент)
    tertiary: 'rgb(255, 107, 107)', // FF6B6B
    onTertiary: 'rgb(255, 255, 255)',
    tertiaryContainer: 'rgb(255, 220, 220)',
    onTertiaryContainer: 'rgb(100, 0, 0)',

    // Ошибки
    error: 'rgb(186, 26, 26)',
    onError: 'rgb(255, 255, 255)',
    errorContainer: 'rgb(255, 218, 214)',
    onErrorContainer: 'rgb(65, 0, 2)',

    // Фоны - очень светлые
    background: 'rgb(252, 250, 255)',
    onBackground: 'rgb(28, 28, 32)',

    // Поверхности (карточки)
    surface: 'rgb(255, 255, 255)',
    onSurface: 'rgb(28, 28, 32)',
    surfaceVariant: 'rgb(245, 240, 250)',
    onSurfaceVariant: 'rgb(70, 70, 80)',

    // Разделители и границы
    outline: 'rgba(138, 43, 226, 0.3)',
    outlineVariant: 'rgba(0, 0, 0, 0.1)',

    // Тени
    shadow: 'rgba(138, 43, 226, 0.3)',
    scrim: 'rgba(0, 0, 0, 0.3)',

    // Инвертированные поверхности
    inverseSurface: 'rgb(28, 28, 32)',
    inverseOnSurface: 'rgb(245, 245, 250)',
    inversePrimary: 'rgb(138, 43, 226)',

    // Уровни elevation
    elevation: {
      level0: 'transparent',
      level1: 'rgb(250, 248, 255)',
      level2: 'rgb(248, 245, 253)',
      level3: 'rgb(245, 242, 251)',
      level4: 'rgb(244, 241, 250)',
      level5: 'rgb(242, 238, 248)',
    },

    // Кастомные цвета
    surfaceDisabled: 'rgba(28, 28, 32, 0.12)',
    onSurfaceDisabled: 'rgba(28, 28, 32, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },

  roundness: 12,
};
