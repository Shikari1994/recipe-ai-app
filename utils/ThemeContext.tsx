import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

type Colors = {
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  inputBackground: string;
  shadow: string;
};

const LIGHT_COLORS: Readonly<Colors> = {
  background: '#f5f5f5',
  cardBackground: '#fff',
  text: '#333',
  textSecondary: '#666',
  border: '#e0e0e0',
  primary: '#FF6B6B',
  inputBackground: '#f5f5f5',
  shadow: '#000',
};

const DARK_COLORS: Readonly<Colors> = {
  background: '#121212',
  cardBackground: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  primary: '#FF6B6B',
  inputBackground: '#2C2C2C',
  shadow: '#000',
};

type ThemeContextType = {
  theme: Theme;
  colors: Colors;
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  // Side effects: save theme when it changes
  // Note: Wallpapers now change automatically via useWallpaper hook
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem(THEME_KEY, theme);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    };

    saveTheme();
  }, [theme]);

  const colors = useMemo(
    () => theme === 'light' ? LIGHT_COLORS : DARK_COLORS,
    [theme]
  );

  const isDark = useMemo(() => theme === 'dark', [theme]);

  const contextValue = useMemo(
    () => ({ theme, colors, toggleTheme, isDark }),
    [theme, colors, toggleTheme, isDark]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
