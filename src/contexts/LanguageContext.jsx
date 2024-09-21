import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLanguage, setLanguage as setLanguageInDB } from '../utils/indexedDB';
import { getTranslation, getDirection } from '../utils/localization';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('ar');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await getLanguage();
        setLanguageState(savedLanguage || 'ar');
        const loadedTranslations = await getTranslation(savedLanguage || 'ar');
        setTranslations(loadedTranslations);
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (newLanguage) => {
    try {
      setLanguageState(newLanguage);
      await setLanguageInDB(newLanguage);
      document.documentElement.lang = newLanguage;
      document.documentElement.dir = await getDirection(newLanguage);
      const newTranslations = await getTranslation(newLanguage);
      setTranslations(newTranslations);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const t = (key) => translations[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
