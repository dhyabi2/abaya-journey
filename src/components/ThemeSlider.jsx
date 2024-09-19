import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSlider = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    'default',
    'dark',
    'light',
    'sepia',
    'ocean',
    'forest',
    'sunset',
    'midnight',
    'pastel',
    'monochrome'
  ];

  const handleThemeChange = (event) => {
    setTheme(themes[event.target.value]);
  };

  return (
    <div className="theme-slider fixed bottom-20 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-2">اختر النمط</h3>
      <input
        type="range"
        min="0"
        max={themes.length - 1}
        value={themes.indexOf(theme)}
        onChange={handleThemeChange}
        className="w-full"
      />
      <div className="flex justify-between mt-2 flex-wrap">
        {themes.map((t) => (
          <span key={t} className={`text-sm ${theme === t ? 'font-bold' : ''} mb-1`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ThemeSlider;
