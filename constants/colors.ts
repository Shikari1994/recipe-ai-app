/**
 * Константы цветов для темной и светлой темы
 */
export const COLORS = {
  primary: '#FF6B6B',
  white: '#fff',
  black: '#000',
  gray: {
    light: '#ccc',
    medium: '#999',
    dark: '#666',
    darker: '#333',
  },
  purple: {
    light: 'rgba(138, 43, 226, 0.2)',
    medium: 'rgba(138, 43, 226, 0.3)',
    shadow: 'rgba(138, 43, 226, 0.3)',
  },
  background: {
    dark: 'rgba(30, 30, 30, 0.5)',
    light: 'rgba(255, 255, 255, 0.5)',
    darkSolid: 'rgba(30, 30, 30, 0.7)',
    lightSolid: 'rgba(255, 255, 255, 0.8)',
  },
  overlay: {
    light: 'rgba(255, 255, 255, 0.3)',
    white: 'rgba(255, 255, 255, 0.85)',
  },
  shadow: {
    black: '#000',
  },
  gradient: {
    purple: {
      light: ['rgba(138, 43, 226, 0.08)', 'rgba(75, 0, 130, 0.04)'] as const,
      dark: ['rgba(138, 43, 226, 0.15)', 'rgba(75, 0, 130, 0.1)'] as const,
    },
    card: {
      light: ['rgba(138, 43, 226, 0.06)', 'rgba(75, 0, 130, 0.03)'] as const,
      dark: ['rgba(138, 43, 226, 0.12)', 'rgba(75, 0, 130, 0.08)'] as const,
    },
    icon: ['rgba(138, 43, 226, 0.8)', 'rgba(75, 0, 130, 0.8)'] as const,
  },
} as const;

/**
 * Получить цвета в зависимости от темы
 */
export const getThemeColors = (isDark: boolean) => ({
  text: isDark ? '#fff' : '#1a1a1a',
  textSecondary: isDark ? 'rgba(255, 255, 255, 0.85)' : '#333',
  textTertiary: isDark ? 'rgba(255, 255, 255, 0.8)' : '#444',
  textQuaternary: isDark ? 'rgba(255, 255, 255, 0.7)' : '#666',
  textMuted: isDark ? 'rgba(255, 255, 255, 0.4)' : '#999',
  welcomeText: isDark ? 'rgba(255, 255, 255, 0.8)' : '#666',
  inputBg: isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.6)',
  inputPlaceholder: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
  cardBg: isDark ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.8)',
  cardPlaceholder: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f0f0f0',
  metaBg: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9',
  borderTop: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0',
});
