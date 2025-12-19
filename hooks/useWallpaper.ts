import { useState, useEffect } from 'react';
import { WALLPAPERS, WallpaperConfig, getDefaultWallpaperId } from '@/constants/wallpapers';

/**
 * Custom hook для загрузки обоев в зависимости от темы
 * Автоматически выбирает темные обои для темной темы и светлые для светлой
 * @param isDark - текущая тема (темная или светлая)
 * @returns конфигурация обоев
 */
export function useWallpaper(isDark: boolean) {
  const [wallpaperConfig, setWallpaperConfig] = useState<WallpaperConfig | null>(null);

  useEffect(() => {
    const wallpaperId = getDefaultWallpaperId(isDark);
    const wallpaper = WALLPAPERS.find(w => w.id === wallpaperId);
    if (wallpaper) {
      setWallpaperConfig(wallpaper);
    }
  }, [isDark]);

  return wallpaperConfig;
}
