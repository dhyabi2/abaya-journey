import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SearchIcon, Loader } from 'lucide-react';
import AbayaItem from './AbayaItem';
import { getAbayaItems, getAllImages } from '../utils/indexedDB';
import ThemeSlider from './ThemeSlider';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { debounce } from 'lodash';
import ErrorBoundary from './ErrorBoundary';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isThemeSliderVisible, setIsThemeSliderVisible] = useState(false);
  const [base64Images, setBase64Images] = useState({});
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    browserName: '',
    osName: '',
  });
  const { t } = useLanguage();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['abayaItems', debouncedSearchTerm],
    queryFn: ({ pageParam = 0 }) => getAbayaItems(pageParam, 10, debouncedSearchTerm),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const debouncedSearch = useMemo(
    () => debounce((value) => {
      setDebouncedSearchTerm(value);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    refetch();
  }, [debouncedSearchTerm, refetch]);

  useEffect(() => {
    const loadBase64Images = async () => {
      try {
        const images = await getAllImages();
        const imageMap = {};
        images.forEach(img => {
          imageMap[img.id] = img.data;
        });
        setBase64Images(imageMap);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };
    loadBase64Images();
  }, []);

  useEffect(() => {
    const checkDeviceCompatibility = () => {
      const ua = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua);
      const isDesktop = !isMobile && !isTablet;
      const browserName = (function() {
        if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) return "Opera";
        else if (ua.indexOf("Edge") > -1) return "Edge";
        else if (ua.indexOf("Chrome") > -1) return "Chrome";
        else if (ua.indexOf("Safari") > -1) return "Safari";
        else if (ua.indexOf("Firefox") > -1) return "Firefox";
        else if ((ua.indexOf("MSIE") > -1) || (!!document.documentMode == true)) return "IE";
        return "Unknown";
      })();
      const osName = (function() {
        if (ua.indexOf("Win") > -1) return "Windows";
        if (ua.indexOf("Mac") > -1) return "MacOS";
        if (ua.indexOf("Linux") > -1) return "Linux";
        if (ua.indexOf("Android") > -1) return "Android";
        if (ua.indexOf("like Mac") > -1) return "iOS";
        return "Unknown";
      })();

      setDeviceInfo({ isMobile, isTablet, isDesktop, browserName, osName });
    };

    checkDeviceCompatibility();
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const toggleThemeSlider = useCallback(() => {
    setIsThemeSliderVisible((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      refetch();
    }
  }, [refetch]);

  const memoizedAbayaItems = useMemo(() => {
    return data?.pages.flatMap(page => page.items) || [];
  }, [data]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
          <Loader className="animate-spin h-12 w-12 text-blue-500" />
          <span className="sr-only">{t('loading')}</span>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-red-500 text-center mt-4 p-4 bg-red-100 rounded-lg" role="alert">
          <h2 className="text-xl font-bold mb-2">{t('errorOccurred')}</h2>
          <p>{error.message || t('errorLoadingData')}</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            aria-label={t('retryButton')}
          >
            {t('retryButton')}
          </button>
        </div>
      );
    }

    if (memoizedAbayaItems.length === 0) {
      return (
        <div className="text-center mt-4 p-4" role="status" aria-live="polite">
          <p className="text-xl">{t('noResults')}</p>
        </div>
      );
    }

    return (
      <>
        <div className={`grid gap-6 mt-8 ${deviceInfo.isMobile ? 'grid-cols-1' : deviceInfo.isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}>
          <AnimatePresence>
            {memoizedAbayaItems.map((item) => (
              <motion.div
                key={item.id}
                className="transform hover:scale-105 transition-transform duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ErrorBoundary>
                  <AbayaItem 
                    id={item.id} 
                    image={base64Images[item.id] || item.image} 
                    brand={item.brand} 
                    deviceInfo={deviceInfo}
                  />
                </ErrorBoundary>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {hasNextPage && (
          <button 
            onClick={() => fetchNextPage()} 
            disabled={isFetchingNextPage}
            className="mt-8 w-full bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors shadow-md font-semibold disabled:opacity-50 flex justify-center items-center"
            aria-label={isFetchingNextPage ? t('loading') : t('loadMore')}
          >
            {isFetchingNextPage ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                {t('loading')}
              </>
            ) : (
              t('loadMore')
            )}
          </button>
        )}
      </>
    );
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <header className="sticky top-0 bg-white z-10 pb-4 shadow-md rounded-b-lg">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">{t('abayaGallery')}</h1>
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            className="w-full p-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
            aria-label={t('searchAbayas')}
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
        </div>
        <button
          onClick={toggleThemeSlider}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors shadow-md mx-auto block"
          aria-expanded={isThemeSliderVisible}
          aria-controls="theme-slider"
        >
          {isThemeSliderVisible ? t('hideColorSlider') : t('showColorSlider')}
        </button>
      </header>
      {isThemeSliderVisible && <ThemeSlider id="theme-slider" />}
      <ErrorBoundary>
        <main>
          {renderContent()}
        </main>
      </ErrorBoundary>
      <div className="mt-8 text-sm text-gray-500">
        <p>Device: {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}</p>
        <p>Browser: {deviceInfo.browserName}</p>
        <p>OS: {deviceInfo.osName}</p>
      </div>
    </div>
  );
};

export default React.memo(HomePage);
