import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { initDB, getTheme, getUserData, setTheme, setUserData } from './utils/indexedDB';
import IntroSlider from './components/IntroSlider';
import HomePage from './components/HomePage';
import NavigationBar from './components/NavigationBar';
import ThemeSlider from './components/ThemeSlider';
import MarketingPage from './components/MarketingPage';
import FAQPage from './components/FAQPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './localization/arabic';
import './styles/global.css';

const queryClient = new QueryClient();

const App = () => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [theme, setThemeState] = useState('default');
  const [userData, setUserDataState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDB();
        const storedTheme = await getTheme();
        const storedUserData = await getUserData();
        
        if (storedTheme) {
          setThemeState(storedTheme);
        }
        
        if (storedUserData) {
          setUserDataState(storedUserData);
          setIsFirstTime(false);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);

  const handleThemeChange = async (newTheme) => {
    setThemeState(newTheme);
    await setTheme(newTheme);
  };

  const handleUserDataChange = async (newUserData) => {
    setUserDataState(newUserData);
    await setUserData(newUserData);
  };

  const handleIntroComplete = () => {
    setIsFirstTime(false);
    handleUserDataChange({ hasCompletedIntro: true });
  };

  if (isLoading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={{ theme, setTheme: handleThemeChange }}>
        <div dir="rtl" className={`app-container theme-${theme}`} role="application">
          {isFirstTime ? (
            <IntroSlider onComplete={handleIntroComplete} />
          ) : (
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/marketing" element={<MarketingPage />} />
                <Route path="/faq" element={<FAQPage />} />
              </Routes>
              <ThemeSlider />
              <NavigationBar />
            </Router>
          )}
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
