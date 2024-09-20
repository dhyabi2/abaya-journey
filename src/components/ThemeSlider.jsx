import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { setTheme as setThemeInDB, getUserPreferences, setUserPreferences } from '../utils/indexedDB';

const ThemeSlider = () => {
  const { theme, setTheme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);

  const themes = useMemo(() => [
    { name: 'default', color: '#ffffff', label: 'الافتراضي' },
    { name: 'dark', color: '#1a1a1a', label: 'داكن' },
    { name: 'light', color: '#f0f0f0', label: 'فاتح' },
    { name: 'sepia', color: '#f1e7d0', label: 'بني فاتح' },
    { name: 'ocean', color: '#e0f8ff', label: 'محيطي' },
    { name: 'forest', color: '#e8f5e9', label: 'غابة' },
    { name: 'sunset', color: '#ffecd9', label: 'غروب' },
    { name: 'midnight', color: '#121212', label: 'منتصف الليل' },
    { name: 'pastel', color: '#fdeff2', label: 'باستيل' },
    { name: 'monochrome', color: '#d5d5d5', label: 'أحادي اللون' }
  ], []);

  useEffect(() => {
    const loadThemePreference = async () => {
      const preferences = await getUserPreferences();
      if (preferences.theme) {
        setTheme(preferences.theme);
      }
    };
    loadThemePreference();
  }, [setTheme]);

  useEffect(() => {
    const index = themes.findIndex(t => t.name === theme);
    setSliderPosition(index * (100 / (themes.length - 1)));
  }, [theme, themes]);

  const handleThemeChange = useCallback(async (newTheme) => {
    setTheme(newTheme);
    setIsDragging(false);
    await setThemeInDB(newTheme);
    const preferences = await getUserPreferences();
    await setUserPreferences({ ...preferences, theme: newTheme });
  }, [setTheme]);

  const handleDrag = useCallback((_, info) => {
    const newPosition = Math.max(0, Math.min(info.point.x, 100));
    setSliderPosition(newPosition);
    const index = Math.round((newPosition / 100) * (themes.length - 1));
    handleThemeChange(themes[index].name);
  }, [themes, handleThemeChange]);

  return (
    <motion.div 
      className="theme-slider fixed bottom-20 left-4 right-4 bg-white p-4 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold mb-2">اختر النمط</h3>
      <motion.div 
        className="relative h-12 bg-gray-200 rounded-full overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div 
          className="absolute top-0 left-0 h-full w-12 bg-blue-500 rounded-full cursor-grab active:cursor-grabbing"
          style={{ x: `${sliderPosition}%` }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDrag={handleDrag}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        />
        {themes.map((t, index) => (
          <motion.div
            key={t.name}
            className="absolute top-0 h-full flex items-center justify-center"
            style={{ left: `${index * (100 / (themes.length - 1))}%`, x: '-50%' }}
          >
            <span className="w-3 h-3 rounded-full bg-gray-400" />
          </motion.div>
        ))}
      </motion.div>
      <div className="mt-2 flex justify-between">
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => handleThemeChange(t.name)}
            className="text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg p-1"
            aria-label={`Select ${t.label} theme`}
          >
            <div 
              className="w-6 h-6 mx-auto rounded-full mb-1 transition-all duration-300"
              style={{ 
                backgroundColor: t.color, 
                border: theme === t.name ? '2px solid blue' : 'none',
                transform: theme === t.name ? 'scale(1.1)' : 'scale(1)'
              }}
            />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default React.memo(ThemeSlider);
