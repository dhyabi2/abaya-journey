import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { initDB, getTheme, getUserData, setTheme, setUserData } from "./utils/indexedDB";
import { seedDatabase } from "./utils/seedData";
import IntroSlider from "./components/IntroSlider";
import HomePage from "./components/HomePage";
import NavigationBar from "./components/NavigationBar";
import ThemeSlider from "./components/ThemeSlider";
import MarketingPage from "./components/MarketingPage";
import FAQPage from "./components/FAQPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [theme, setThemeState] = useState("default");
  const [userData, setUserDataState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await initDB();
      await seedDatabase(); // Seed the database with initial data
      const storedTheme = await getTheme();
      const storedUserData = await getUserData();
      
      if (storedTheme) {
        setThemeState(storedTheme);
      }
      
      if (storedUserData) {
        setUserDataState(storedUserData);
        setIsFirstTime(false);
      }
      
      setIsLoading(false);
    };

    initializeApp();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js");
      });
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    });
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

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      });
    }
  };

  if (isLoading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={{ theme, setTheme: handleThemeChange }}>
        <div dir="rtl" className={`app-container theme-${theme}`} role="application">
          {showInstallPrompt && (
            <div className="install-prompt">
              <p>هل ترغب في تثبيت التطبيق على جهازك؟</p>
              <button onClick={handleInstallClick}>تثبيت</button>
              <button onClick={() => setShowInstallPrompt(false)}>لاحقًا</button>
            </div>
          )}
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
