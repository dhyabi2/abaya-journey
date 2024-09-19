import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeSlider = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'default', color: '#ffffff' },
    { name: 'dark', color: '#1a1a1a' },
    { name: 'light', color: '#f0f0f0' },
    { name: 'sepia', color: '#f1e7d0' },
    { name: 'ocean', color: '#e0f8ff' },
    { name: 'forest', color: '#e8f5e9' },
    { name: 'sunset', color: '#ffecd9' },
    { name: 'midnight', color: '#121212' },
    { name: 'pastel', color: '#fdeff2' },
    { name: 'monochrome', color: '#d5d5d5' }
  ];

  const handleThemeChange = (event) => {
    setTheme(themes[event.target.value].name);
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
        value={themes.findIndex(t => t.name === theme)}
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
        <AnimatePresence>
          {themes.map((t) => (
            <motion.span 
              key={t.name} 
              className={`text-sm cursor-pointer ${theme === t.name ? 'font-bold' : ''} mb-1`}
              style={{ backgroundColor: t.color, padding: '4px 8px', borderRadius: '4px' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(t.name)}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
            >
              {t.name}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ThemeSlider;
