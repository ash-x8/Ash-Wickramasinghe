import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSiteSettings } from '../lib/firebase';
import { defaultSiteSettings } from '../data/defaultContent';

interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('aw_theme_mode');
    return (saved === 'light' ? 'light' : 'dark');
  });

  const [accentColor, setAccentColorState] = useState<string>(defaultSiteSettings.accentColor || '#c59b63');

  useEffect(() => {
    // Load accent color and default theme from Firestore
    async function loadThemeSettings() {
      try {
        const settings = await getSiteSettings();
        if (settings.accentColor) {
          setAccentColorState(settings.accentColor);
        }
        if (!localStorage.getItem('aw_theme_mode') && settings.defaultTheme) {
          setTheme(settings.defaultTheme);
        }
      } catch (e) {
        // use default
      }
    }
    loadThemeSettings();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('aw_theme_mode', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
