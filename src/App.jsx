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
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDB();
        await seedDatabase();
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
      } catch (error) {
        console.error("Error initializing app:", error);
        setError(error.message || "An error occurred while initializing the app");
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleThemeChange = async (newTheme) => {
    try {
      setThemeState(newTheme);
      await setTheme(newTheme);
    } catch (error) {
      console.error("Error setting theme:", error);
      setError(`Failed to set theme: ${error.message}`);
    }
  };

  const handleUserDataChange = async (newUserData) => {
    try {
      setUserDataState(newUserData);
      await setUserData(newUserData);
    } catch (error) {
      console.error("Error setting user data:", error);
      setError(`Failed to set user data: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="loading">Initializing app...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={{ theme, setTheme: handleThemeChange }}>
        <div dir="rtl" className={`app-container theme-${theme}`} role="application">
          {isFirstTime ? (
            <IntroSlider />
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
