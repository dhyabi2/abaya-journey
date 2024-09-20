import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTheme, setTheme as setThemeInDB } from '../utils/indexedDB';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('default');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getTheme();
      if (savedTheme) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    await setThemeInDB(newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (themeName) => {
    document.documentElement.className = `theme-${themeName}`;
    localStorage.setItem('theme', themeName); // Fallback persistence
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
