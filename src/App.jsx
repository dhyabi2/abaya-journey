import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { initDB, getTheme, getUserData } from './utils/indexedDB';
import IntroSlider from './components/IntroSlider';
import HomePage from './components/HomePage';
import NavigationBar from './components/NavigationBar';
import MarketingPage from './components/MarketingPage';
import FAQPage from './components/FAQPage';
import './localization/arabic';
import './styles/global.css';

const App = () => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [theme, setTheme] = useState('default');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      await initDB();
      const storedTheme = await getTheme();
      const storedUserData = await getUserData();
      
      if (storedTheme) {
        setTheme(storedTheme);
      }
      
      if (storedUserData) {
        setUserData(storedUserData);
        setIsFirstTime(false);
      }
    };

    initializeApp();
  }, []);

  const handleIntroComplete = () => {
    setIsFirstTime(false);
  };

  return (
    <ThemeProvider value={{ theme, setTheme }}>
      <div dir="rtl" className={`app-container theme-${theme}`}>
        {isFirstTime ? (
          <IntroSlider onComplete={handleIntroComplete} />
        ) : (
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/marketing" element={<MarketingPage />} />
              <Route path="/faq" element={<FAQPage />} />
            </Routes>
            <NavigationBar />
          </Router>
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;
