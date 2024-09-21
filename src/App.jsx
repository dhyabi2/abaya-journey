import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";

const IntroSlider = lazy(() => import("./components/IntroSlider"));
const HomePage = lazy(() => import("./components/HomePage"));
const NavigationBar = lazy(() => import("./components/NavigationBar"));
const ThemeSlider = lazy(() => import("./components/ThemeSlider"));
const MarketingPage = lazy(() => import("./components/MarketingPage"));
const FAQPage = lazy(() => import("./components/FAQPage"));
const AddAbaya = lazy(() => import("./pages/AddAbaya"));

const queryClient = new QueryClient();

const App = () => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const { getUserData } = await import("./utils/indexedDB");
        const userData = await getUserData();
        setIsFirstTime(!userData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking first-time user:", error);
        setIsLoading(false);
      }
    };

    checkFirstTimeUser();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <ThemeProvider>
            {isFirstTime ? (
              <Suspense fallback={<div>Loading...</div>}>
                <IntroSlider onComplete={() => setIsFirstTime(false)} />
              </Suspense>
            ) : (
              <Router>
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/marketing" element={<MarketingPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/add-abaya" element={<AddAbaya />} />
                  </Routes>
                  <ThemeSlider />
                  <NavigationBar />
                </Suspense>
              </Router>
            )}
          </ThemeProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
