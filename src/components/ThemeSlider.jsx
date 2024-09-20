import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { setTheme as setThemeInDB } from '../utils/indexedDB';

const ThemeSlider = () => {
  const { theme, setTheme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

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
    const applyTheme = async () => {
      document.body.className = `theme-${theme}`;
      await setThemeInDB(theme);
    };
    applyTheme();
  }, [theme]);

  const handleThemeChange = useCallback(async (newTheme) => {
    setTheme(newTheme);
    setIsDragging(false);
  }, [setTheme]);

  const renderThemeButton = useCallback((t, index) => (
    <motion.div
      key={t.name}
      className={`w-12 h-12 flex items-center justify-center cursor-pointer ${theme === t.name ? 'ring-2 ring-blue-500' : ''}`}
      style={{ backgroundColor: t.color }}
      onClick={() => handleThemeChange(t.name)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      layout
      transition={{
        type: "spring",
        stiffness: 700,
        damping: 30
      }}
    >
      <span className="text-xs font-bold" style={{ color: t.name === 'dark' || t.name === 'midnight' ? 'white' : 'black' }}>
        {t.label}
      </span>
    </motion.div>
  ), [theme, handleThemeChange]);

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
          className="absolute top-0 left-0 h-full flex"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(e, info) => {
            const draggedDistance = info.offset.x;
            const themeWidth = 100 / themes.length;
            const newIndex = Math.round(draggedDistance / themeWidth);
            const clampedIndex = Math.max(0, Math.min(newIndex, themes.length - 1));
            handleThemeChange(themes[clampedIndex].name);
          }}
        >
          {themes.map(renderThemeButton)}
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 text-center text-sm text-gray-600"
          >
            اسحب لتغيير النمط
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default React.memo(ThemeSlider);
