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
  // Оригинальные обои
  {
    id: 'dark-image',
    name: 'Темная тема',
    type: 'image',
    image: require('@/assets/images/black.png'),
  },
  {
    id: 'light-image',
    name: 'Светлая тема',
    type: 'image',
    image: require('@/assets/images/white.png'),
  },
  // Градиентные обои
  {
    id: 'gradient-sunset',
    name: 'Закат',
    type: 'gradient',
    colors: ['rgba(131, 58, 180, 1)', 'rgba(255, 82, 82, 1)', 'rgba(255, 208, 143, 1)'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'gradient-lavender',
    name: 'Лаванда',
    type: 'gradient',
    colors: ['rgba(106, 48, 147, 1)', 'rgba(160, 68, 255, 1)', 'rgba(219, 148, 255, 1)'],
    locations: [0, 0.5, 1],
  },
  // Светлые теплые градиенты
  {
    id: 'gradient-cream',
    name: 'Сливки',
    type: 'gradient',
    colors: ['rgba(255, 251, 245, 1)', 'rgba(255, 243, 224, 1)', 'rgba(255, 235, 205, 1)'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'gradient-peach',
    name: 'Персик',
    type: 'gradient',
    colors: ['rgba(255, 248, 240, 1)', 'rgba(255, 228, 196, 1)', 'rgba(255, 218, 185, 1)'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'gradient-rose',
    name: 'Розовое золото',
    type: 'gradient',
    colors: ['rgba(255, 250, 245, 1)', 'rgba(255, 235, 230, 1)', 'rgba(255, 220, 210, 1)'],
    locations: [0, 0.5, 1],
  },
  // Темные градиенты
  {
    id: 'gradient-midnight',
    name: 'Полночь',
    type: 'gradient',
    colors: ['rgba(10, 10, 25, 1)', 'rgba(20, 20, 40, 1)', 'rgba(30, 30, 50, 1)'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'gradient-deep-purple',
    name: 'Глубокий фиолетовый',
    type: 'gradient',
    colors: ['rgba(25, 10, 35, 1)', 'rgba(45, 20, 60, 1)', 'rgba(65, 30, 85, 1)'],
    locations: [0, 0.5, 1],
  },
];

export const DEFAULT_WALLPAPER_ID = 'dark-image';
