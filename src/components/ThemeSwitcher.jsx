// BONUS FEATURE: Lets users select their preferred theme for the website

import React from 'react';
import { useTheme, themes } from '../context/ThemeContext';
import { Palette } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative">
      <label htmlFor="theme-select" className="sr-only">Select Theme</label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="bg-transparent text-foreground rounded-md p-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer border border-transparent hover:border-muted"
      >
        {Object.entries(themes).map(([key, name]) => (
          <option key={key} value={key} className="bg-secondary text-foreground">
            {name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-foreground/50">
        <Palette size={16} />
      </div>
    </div>
  );
}