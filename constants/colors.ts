/**
 * Константы цветов для темной и светлой темы
 * Темная тема: фиолетовые цвета (138, 43, 226)
 * Светлая тема: оранжевые цвета (255, 149, 0)
 */
export const COLORS = {
  // Цвета темной темы (фиолетовые)
  dark: {
    primary: 'rgb(138, 43, 226)', // BlueViolet
    primaryLight: 'rgba(138, 43, 226, 0.2)',
    primaryMedium: 'rgba(138, 43, 226, 0.3)',
    primaryShadow: 'rgba(138, 43, 226, 0.5)',
    gradientLight: ['rgba(138, 43, 226, 0.08)', 'rgba(95, 30, 155, 0.04)'] as const,
    gradientDark: ['rgba(138, 43, 226, 0.15)', 'rgba(95, 30, 155, 0.08)'] as const,
    gradientCard: ['rgba(138, 43, 226, 0.12)', 'rgba(95, 30, 155, 0.06)'] as const,
    gradientIcon: ['rgba(138, 43, 226, 0.8)', 'rgba(95, 30, 155, 0.8)'] as const,
  },
  // Цвета светлой темы (оранжевые)
  light: {
    primary: 'rgb(255, 149, 0)', // #FF9500
    primaryLight: 'rgba(255, 149, 0, 0.2)',
    primaryMedium: 'rgba(255, 149, 0, 0.3)',
    primaryShadow: 'rgba(255, 149, 0, 0.5)',
    gradientLight: ['rgba(255, 149, 0, 0.08)', 'rgba(255, 127, 0, 0.04)'] as const,
    gradientDark: ['rgba(255, 149, 0, 0.15)', 'rgba(255, 127, 0, 0.08)'] as const,
    gradientCard: ['rgba(255, 149, 0, 0.06)', 'rgba(255, 127, 0, 0.03)'] as const,
    gradientIcon: ['rgba(255, 149, 0, 0.8)', 'rgba(255, 127, 0, 0.8)'] as const,
  },
  // Обратная совместимость - используем фиолетовые цвета по умолчанию
  primary: 'rgb(138, 43, 226)',
  white: '#fff',
  black: '#000',
  gray: {
    light: '#ccc',
    medium: '#999',
    dark: '#666',
    darker: '#333',
  },
  background: {
    dark: 'rgb(18, 18, 20)',
    light: 'rgb(252, 250, 255)',
    darkSolid: 'rgb(28, 28, 32)',
    lightSolid: 'rgb(255, 255, 255)',
  },
  overlay: {
    light: 'rgba(255, 255, 255, 0.3)',
    white: 'rgba(255, 255, 255, 0.85)',
  },
  shadow: {
    black: '#000',
  },
} as const;

/**
 * Получить цвета в зависимости от темы
 * Темная тема - фиолетовая, светлая тема - оранжевая
 */
export const getThemeColors = (isDark: boolean) => {
  const themeColors = isDark ? COLORS.dark : COLORS.light;

  return {
    // Основной цвет (primary)
    primary: themeColors.primary,
    primaryLight: themeColors.primaryLight,
    primaryMedium: themeColors.primaryMedium,
    primaryShadow: themeColors.primaryShadow,

    // Градиенты
    gradientLight: themeColors.gradientLight,
    gradientDark: themeColors.gradientDark,
    gradientCard: themeColors.gradientCard,
    gradientIcon: themeColors.gradientIcon,

    // Основной текст
    text: isDark ? 'rgb(230, 230, 235)' : 'rgb(28, 28, 32)',

    // Второстепенный текст
    textSecondary: isDark ? 'rgb(200, 200, 210)' : 'rgb(70, 70, 80)',

    // Третичный текст
    textTertiary: isDark ? 'rgba(230, 230, 235, 0.87)' : 'rgba(28, 28, 32, 0.87)',

    // Четвертичный текст
    textQuaternary: isDark ? 'rgba(230, 230, 235, 0.74)' : 'rgba(28, 28, 32, 0.74)',

    // Приглушенный текст
    textMuted: isDark ? 'rgba(230, 230, 235, 0.60)' : 'rgba(28, 28, 32, 0.60)',

    // Текст приветствия
    welcomeText: isDark ? 'rgba(230, 230, 235, 0.87)' : 'rgba(28, 28, 32, 0.74)',

    // Фон поля ввода
    inputBg: isDark ? 'rgb(30, 30, 35)' : 'rgb(250, 248, 255)',

    // Placeholder поля ввода
    inputPlaceholder: isDark ? 'rgba(230, 230, 235, 0.60)' : 'rgba(28, 28, 32, 0.60)',

    // Фон карточки
    cardBg: isDark ? 'rgb(28, 28, 32)' : 'rgb(255, 255, 255)',

    // Placeholder карточки
    cardPlaceholder: isDark ? 'rgb(30, 30, 35)' : 'rgb(248, 245, 253)',

    // Фон метаданных
    metaBg: isDark ? 'rgb(35, 35, 40)' : 'rgb(248, 245, 253)',

    // Верхняя граница (используем primary цвет темы)
    borderTop: themeColors.primaryMedium,
  };
};
