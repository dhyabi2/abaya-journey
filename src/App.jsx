import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import LanguageSwitcher from "./components/LanguageSwitcher";

const IntroSlider = lazy(() => import("./components/IntroSlider"));
const HomePage = lazy(() => import("./components/HomePage"));
const NavigationBar = lazy(() => import("./components/NavigationBar"));
const ThemeSlider = lazy(() => import("./components/ThemeSlider"));
const MarketingPage = lazy(() => import("./components/MarketingPage"));
const FAQPage = lazy(() => import("./components/FAQPage"));

const queryClient = new QueryClient();

// Embedded data
const embeddedData = {
  abayaItems: [
    { id: 1, image: '/images/abaya1.jpg', brand: 'Elegant Abayas', price: 299.99, date: '2023-03-15' },
    { id: 2, image: '/images/abaya2.jpg', brand: 'Modern Modest', price: 349.99, date: '2023-03-16' },
    { id: 3, image: '/images/abaya3.jpg', brand: 'Chic Covers', price: 279.99, date: '2023-03-17' },
    { id: 4, image: '/images/abaya4.jpg', brand: 'Stylish Wraps', price: 399.99, date: '2023-03-18' },
    { id: 5, image: '/images/abaya5.jpg', brand: 'Graceful Gowns', price: 329.99, date: '2023-03-19' },
  ],
  leaderboard: [
    { id: 1, name: 'مستخدم 1', referrals: 10, points: 500 },
    { id: 2, name: 'مستخدم 2', referrals: 8, points: 400 },
    { id: 3, name: 'مستخدم 3', referrals: 6, points: 300 },
    { id: 4, name: 'مستخدم 4', referrals: 4, points: 200 },
    { id: 5, name: 'مستخدم 5', referrals: 2, points: 100 },
  ],
  faqs: [
    { id: 1, question: 'كيف يمكنني تتبع طلبي؟', answer: 'يمكنك تتبع طلبك من خلال الضغط على "تتبع الطلب" في صفحة حسابك.', category: 'الطلبات' },
    { id: 2, question: 'ما هي سياسة الإرجاع؟', answer: 'نقبل الإرجاع خلال 30 يومًا من تاريخ الاستلام للمنتجات غير المستخدمة.', category: 'الإرجاع والاستبدال' },
    { id: 3, question: 'هل تقدمون الشحن الدولي؟', answer: 'نعم، نقدم الشحن الدولي لمعظم الدول. يمكنك التحقق من تفاصيل الشحن أثناء عملية الدفع.', category: 'الشحن' },
  ],
  userData: {
    theme: 'default',
    language: 'ar',
    referralCode: 'WELCOME2024',
    rewards: 100,
    preferences: { itemsPerPage: 10, showThemeSlider: true },
    uuid: 'demo-user-123'
  }
};

const AppContent = () => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [theme, setTheme] = useState(embeddedData.userData.theme);
  const [userData, setUserData] = useState(embeddedData.userData);
  const [error, setError] = useState(null);
  const { language } = useLanguage();

  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
    setUserData(prev => ({ ...prev, theme: newTheme }));
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIsFirstTime(false);
    setUserData(prev => ({
      ...prev,
      introCompleted: true,
      lastVisit: new Date().toISOString(),
      visitCount: (prev.visitCount || 0) + 1
    }));
  }, []);

  const memoizedThemeProvider = useMemo(() => (
    <ThemeProvider value={{ theme, setTheme: handleThemeChange }}>
      {isFirstTime ? (
        <Suspense fallback={<div role="status" aria-live="polite">Loading...</div>}>
          <IntroSlider onComplete={handleIntroComplete} />
        </Suspense>
      ) : (
        <Router>
          <div className={`app-content theme-${theme} ${language === 'ar' ? 'rtl' : 'ltr'}`} role="main">
            <LanguageSwitcher />
            <ErrorBoundary>
              <Suspense fallback={<div role="status" aria-live="polite">Loading...</div>}>
                <Routes>
                  <Route path="/" element={<HomePage abayaItems={embeddedData.abayaItems} userPreferences={userData.preferences} />} />
                  <Route path="/marketing" element={<MarketingPage referralCode={userData.referralCode} leaderboard={embeddedData.leaderboard} />} />
                  <Route path="/faq" element={<FAQPage faqs={embeddedData.faqs} />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            <Suspense fallback={<div role="status" aria-live="polite">Loading...</div>}>
              <ThemeSlider />
            </Suspense>
            <Suspense fallback={<div role="status" aria-live="polite">Loading...</div>}>
              <NavigationBar />
            </Suspense>
          </div>
        </Router>
      )}
    </ThemeProvider>
  ), [theme, isFirstTime, userData, language, handleThemeChange, handleIntroComplete]);

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
