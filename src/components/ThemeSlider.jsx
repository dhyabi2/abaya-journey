import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

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
    <motion.div 
      className="theme-slider fixed bottom-20 left-4 right-4 bg-white p-4 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold mb-2">اختر النمط</h3>
      <motion.input
        type="range"
        min="0"
        max={themes.length - 1}
        value={themes.indexOf(theme)}
        onChange={handleThemeChange}
        className="w-full"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      />
      <motion.div 
        className="flex justify-between mt-2 flex-wrap"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {themes.map((t) => (
          <motion.span 
            key={t} 
            className={`text-sm ${theme === t ? 'font-bold' : ''} mb-1`}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(t)}
          >
            {t}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ThemeSlider;
