import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLanguage, setLanguage as setLanguageInDB } from '../utils/indexedDB';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('ar');

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await getLanguage();
      setLanguageState(savedLanguage || 'ar');
    };
    loadLanguage();
  }, []);

  const setLanguage = async (newLanguage) => {
    setLanguageState(newLanguage);
    await setLanguageInDB(newLanguage);
    document.documentElement.lang = newLanguage;
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};