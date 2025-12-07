import { ImageSourcePropType } from 'react-native';

export type WallpaperType = 'image' | 'gradient';

export type WallpaperConfig = {
  id: string;
  name: string;
  type: WallpaperType;
  // Для изображений
  image?: ImageSourcePropType;
  // Для градиентов
  colors?: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
};

export const WALLPAPERS: WallpaperConfig[] = [
  // Темная тема - Глубокий фиолетовый
  {
    id: 'gradient-deep-purple',
    name: 'Глубокий фиолетовый',
    type: 'gradient',
    colors: ['rgba(25, 10, 35, 1)', 'rgba(45, 20, 60, 1)', 'rgba(65, 30, 85, 1)'],
    locations: [0, 0.5, 1],
  },
  // Светлая тема - Персик
  {
    id: 'gradient-peach',
    name: 'Персик',
    type: 'gradient',
    colors: ['rgba(255, 248, 240, 1)', 'rgba(255, 228, 196, 1)', 'rgba(255, 218, 185, 1)'],
    locations: [0, 0.5, 1],
  },
];

export const DEFAULT_WALLPAPER_ID = 'gradient-deep-purple';

/**
 * Получить ID обоев по умолчанию в зависимости от темы
 */
export function getDefaultWallpaperId(isDark: boolean): string {
  return isDark ? 'gradient-deep-purple' : 'gradient-peach';
}
