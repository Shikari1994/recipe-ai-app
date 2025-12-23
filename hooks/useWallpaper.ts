import { useMemo } from 'react';
import { WALLPAPERS, WallpaperConfig, getDefaultWallpaperId } from '@/constants/wallpapers';

/**
 * Custom hook для загрузки обоев в зависимости от темы
 * Автоматически выбирает темные обои для темной темы и светлые для светлой
 * @param isDark - текущая тема (темная или светлая)
 * @returns конфигурация обоев
 */
export function useWallpaper(isDark: boolean) {
  const wallpaperConfig = useMemo<WallpaperConfig | null>(() => {
    const wallpaperId = getDefaultWallpaperId(isDark);
    const wallpaper = WALLPAPERS.find(w => w.id === wallpaperId);
    return wallpaper || null;
  }, [isDark]);

  return wallpaperConfig;
}
