import { useState, useEffect, useCallback } from 'react';
import { getUserPreferences } from '@/utils/userPreferences';
import { WALLPAPERS, WallpaperConfig, getDefaultWallpaperId } from '@/constants/wallpapers';

/**
 * Custom hook для загрузки и управления обоями
 * @param isDark - текущая тема (темная или светлая)
 * @returns объект с конфигурацией обоев и функцией перезагрузки
 */
export function useWallpaper(isDark: boolean) {
  const [wallpaperConfig, setWallpaperConfig] = useState<WallpaperConfig | null>(null);

  const loadWallpaper = useCallback(async () => {
    const prefs = await getUserPreferences();
    const wallpaperId = prefs.wallpaperId || getDefaultWallpaperId(isDark);
    const wallpaper = WALLPAPERS.find(w => w.id === wallpaperId);
    if (wallpaper) {
      setWallpaperConfig(wallpaper);
    }
  }, [isDark]);

  useEffect(() => {
    loadWallpaper();
  }, [loadWallpaper]);

  return {
    wallpaperConfig,
    reloadWallpaper: loadWallpaper,
  };
}
