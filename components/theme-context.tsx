'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [colorMode, setColorMode] = useState<ColorMode>('dark');

  useEffect(() => {
    const persistedColorPreference = window.localStorage.getItem('color-mode');
    const initialColorMode =
      persistedColorPreference === 'light' || persistedColorPreference === 'dark'
        ? persistedColorPreference
        : 'dark';

    setColorMode(initialColorMode);
  }, []);

  useEffect(() => {
    if (colorMode) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(colorMode);
      window.localStorage.setItem('color-mode', colorMode);
    }
  }, [colorMode]);

  const value = {
    colorMode,
    setColorMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
