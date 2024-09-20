import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { initDB, getTheme, getUserData, setTheme, setUserData, getReferralCode, setReferralCode, getUUID, setUUID, getUserPreferences, setUserPreferences } from "./utils/indexedDB";
import { seedDatabase } from "./utils/seedData";
import IntroSlider from "./components/IntroSlider";
import HomePage from "./components/HomePage";
import NavigationBar from "./components/NavigationBar";
import ThemeSlider from "./components/ThemeSlider";
import MarketingPage from "./components/MarketingPage";
import FAQPage from "./components/FAQPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import { v4 as uuidv4 } from 'uuid';
import LanguageSwitcher from "./components/LanguageSwitcher";

const queryClient = new QueryClient();

const AppContent = () => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [theme, setThemeState] = useState("default");
  const [userData, setUserDataState] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [referralCode, setReferralCodeState] = useState(null);
  const [uuid, setUUIDState] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [userPreferences, setUserPreferencesState] = useState({});
  const { language } = useLanguage();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDB();
        await seedDatabase();
        const storedTheme = await getTheme();
        const storedUserData = await getUserData();
        const storedReferralCode = await getReferralCode();
        const storedPreferences = await getUserPreferences();
        let storedUUID = await getUUID();
        
        if (storedTheme) setThemeState(storedTheme);
        if (storedPreferences) setUserPreferencesState(storedPreferences);
        
        if (storedUserData) {
          setUserDataState(storedUserData);
          setIsFirstTime(false);
          const updatedUserData = {
            ...storedUserData,
            lastVisit: new Date().toISOString(),
            visitCount: (storedUserData.visitCount || 0) + 1
          };
          await setUserData(updatedUserData);
        } else {
          setIsFirstTime(true);
          const initialUserData = {
            createdAt: new Date().toISOString(),
            lastVisit: new Date().toISOString(),
            visitCount: 1
          };
          await setUserData(initialUserData);
          setUserDataState(initialUserData);
        }

        if (storedReferralCode) {
          setReferralCodeState(storedReferralCode);
        } else {
          const newReferralCode = generateReferralCode();
          await setReferralCode(newReferralCode);
          setReferralCodeState(newReferralCode);
        }

        if (!storedUUID) {
          storedUUID = uuidv4();
          await setUUID(storedUUID);
        }
        setUUIDState(storedUUID);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing app:", error);
        setError(error.message || "An error occurred during app initialization");
        setIsLoading(false);
      }
    };

    initializeApp();

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
    };
  }, []);

  const handleThemeChange = useCallback(async (newTheme) => {
    try {
      setThemeState(newTheme);
      await setTheme(newTheme);
      document.documentElement.className = `theme-${newTheme}`;
      const updatedPreferences = { ...userPreferences, theme: newTheme };
      await setUserPreferences(updatedPreferences);
      setUserPreferencesState(updatedPreferences);
    } catch (error) {
      console.error("Error setting theme:", error);
      setError(`Failed to set theme: ${error.message}`);
    }
  }, [userPreferences]);

  const handleUserDataChange = useCallback(async (newUserData) => {
    try {
      setUserDataState(newUserData);
      await setUserData(newUserData);
    } catch (error) {
      console.error("Error setting user data:", error);
      setError(`Failed to set user data: ${error.message}`);
    }
  }, []);

  const generateReferralCode = useCallback(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  }, [deferredPrompt]);

  const handleIntroComplete = useCallback(() => {
    setIsFirstTime(false);
    const updatedUserData = {
      ...userData,
      introCompleted: true,
      lastVisit: new Date().toISOString(),
      visitCount: (userData?.visitCount || 0) + 1
    };
    handleUserDataChange(updatedUserData);
  }, [userData, handleUserDataChange]);

  const memoizedThemeProvider = useMemo(() => (
    <ThemeProvider value={{ theme, setTheme: handleThemeChange }}>
      {isFirstTime ? (
        <IntroSlider onComplete={handleIntroComplete} />
      ) : (
        <Router>
          <div className={`app-content theme-${theme} ${language === 'ar' ? 'rtl' : 'ltr'}`} role="main">
            {showInstallPrompt && (
              <div className="install-prompt fixed top-0 left-0 right-0 bg-blue-500 text-white p-4 text-center">
                <p>Add our app to your home screen for quick access!</p>
                <button 
                  onClick={handleInstallClick}
                  className="mt-2 bg-white text-blue-500 px-4 py-2 rounded"
                >
                  Install App
                </button>
              </div>
            )}
            <LanguageSwitcher />
            <Routes>
              <Route path="/" element={<HomePage uuid={uuid} userPreferences={userPreferences} setUserPreferences={setUserPreferences} />} />
              <Route path="/marketing" element={<MarketingPage referralCode={referralCode} uuid={uuid} />} />
              <Route path="/faq" element={<FAQPage />} />
            </Routes>
            <ThemeSlider />
            <NavigationBar />
          </div>
        </Router>
      )}
    </ThemeProvider>
  ), [theme, isFirstTime, uuid, referralCode, handleThemeChange, showInstallPrompt, handleInstallClick, language, handleIntroComplete, userPreferences]);

  if (isLoading) {
    return <div className="loading text-center text-2xl p-4 bg-gray-100 h-screen flex items-center justify-center" role="status" aria-live="polite">Loading app...</div>;
  }

  if (error) {
    return (
      <div className="error text-center p-4 bg-red-100 h-screen flex flex-col items-center justify-center" role="alert" aria-live="assertive">
        <h1 className="text-2xl font-bold text-red-700 mb-2">Error</h1>
        <p className="text-lg mb-4 text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          aria-label="Retry"
        >
          Retry
        </button>
      </div>
    );
  }

  return memoizedThemeProvider;
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
