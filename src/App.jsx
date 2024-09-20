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
        console.error("خطأ في تهيئة التطبيق:", error);
        setError(error.message || "حدث خطأ أثناء تهيئة التطبيق");
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
      console.error("خطأ في تعيين السمة:", error);
      setError(`فشل في تعيين السمة: ${error.message}`);
    }
  };

  const handleUserDataChange = async (newUserData) => {
    try {
      setUserDataState(newUserData);
      await setUserData(newUserData);
    } catch (error) {
      console.error("خطأ في تعيين بيانات المستخدم:", error);
      setError(`فشل في تعيين بيانات المستخدم: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="loading text-center text-2xl p-4">جاري تحميل التطبيق...</div>;
  }

  if (error) {
    return (
      <div className="error text-center p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-2">خطأ</h1>
        <p className="text-lg mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={{ theme, setTheme: handleThemeChange }}>
        <div dir="rtl" className={`app-container theme-${theme}`} lang="ar">
          {isFirstTime ? (
            <IntroSlider onComplete={() => setIsFirstTime(false)} />
          ) : (
            <Router>
              <div className={`app-content theme-${theme}`}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/marketing" element={<MarketingPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                </Routes>
                <ThemeSlider />
                <NavigationBar />
              </div>
            </Router>
          )}
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
