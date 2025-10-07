// Context to use and remember a theme

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Define the themes constant
export const themes = {
  'discord-blue': 'Discord Blue',
  'vintage-brown': 'Vintage Brown',
  'fairytale-pink': 'Fairytale Pink',
  'classic-dark': 'Classic Dark',
};

//Create the context
const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('talentflow-theme') || 'discord-blue';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(...Object.keys(themes));
    root.classList.add(theme);
    localStorage.setItem('talentflow-theme', theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};