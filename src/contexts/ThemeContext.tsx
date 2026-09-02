import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { THEMES, DEFAULT_THEME_ID, type ThemeId, type ThemeConfig, getThemeConfig } from '@/types/theme';

const STORAGE_KEY = 'frota-gpm-theme';

interface ThemeContextType {
  theme: ThemeId;
  themeConfig: ThemeConfig;
  availableThemes: ThemeConfig[];
  setTheme: (id: ThemeId) => void;
  resetToDefaultTheme: () => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
  openThemeSelector: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && THEMES.some((t) => t.id === stored)) {
        return stored as ThemeId;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return DEFAULT_THEME_ID;
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const themeConfig = useMemo(() => getThemeConfig(theme), [theme]);

  // Apply theme attributes to document on theme change
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    if (themeConfig.type === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    // Update meta theme-color
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', themeConfig.metaThemeColor);

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Unable to persist theme to localStorage:', e);
    }
  }, [theme, themeConfig]);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id);
  }, []);

  const resetToDefaultTheme = useCallback(() => {
    setThemeState(DEFAULT_THEME_ID);
  }, []);

  const openThemeSelector = useCallback(() => {
    setIsThemeModalOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      themeConfig,
      availableThemes: THEMES,
      setTheme,
      resetToDefaultTheme,
      isThemeModalOpen,
      setIsThemeModalOpen,
      openThemeSelector,
    }),
    [theme, themeConfig, setTheme, resetToDefaultTheme, isThemeModalOpen, openThemeSelector]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
