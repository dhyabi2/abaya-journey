import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SearchIcon, Loader } from 'lucide-react';
import { getAbayaItems, getAllImages, getUserPreferences, setUserPreferences } from '../utils/indexedDB';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { debounce } from 'lodash';
import ErrorBoundary from './ErrorBoundary';
import { useToast } from '../components/ui/use-toast';

const ThemeSlider = lazy(() => import('./ThemeSlider'));
const DeviceInfo = lazy(() => import('./DeviceInfo'));
const AbayaItem = lazy(() => import('./AbayaItem'));

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
    screenSize: '',
    orientation: '',
  });
  const [userPreferences, setUserPreferencesState] = useState({});
  const { t } = useLanguage();
  const { toast } = useToast();

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
    queryFn: ({ pageParam = 0 }) => getAbayaItems(pageParam, userPreferences.itemsPerPage || 10, debouncedSearchTerm),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    onError: (error) => {
      toast({
        title: t('errorOccurred'),
        description: error.message || t('errorLoadingData'),
        variant: "destructive",
      });
    },
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
    refetch().catch(error => {
      toast({
        title: t('errorRefetching'),
        description: error.message || t('errorRefetchingData'),
        variant: "destructive",
      });
    });
  }, [debouncedSearchTerm, refetch, t, toast]);

  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const preferences = await getUserPreferences();
        setUserPreferencesState(preferences);
        setIsThemeSliderVisible(preferences.showThemeSlider || false);
      } catch (error) {
        toast({
          title: t('errorLoadingPreferences'),
          description: error.message || t('errorLoadingPreferencesData'),
          variant: "destructive",
        });
      }
    };
    loadUserPreferences();
  }, [t, toast]);

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
        toast({
          title: t('errorLoadingImages'),
          description: error.message || t('errorLoadingImagesData'),
          variant: "destructive",
        });
      }
    };
    loadBase64Images();
  }, [t, toast]);

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
      const screenSize = `${window.screen.width}x${window.screen.height}`;
      const orientation = window.screen.orientation ? window.screen.orientation.type : 'unknown';

      setDeviceInfo({ isMobile, isTablet, isDesktop, browserName, osName, screenSize, orientation });
    };

    checkDeviceCompatibility();
    window.addEventListener('resize', checkDeviceCompatibility);
    window.addEventListener('orientationchange', checkDeviceCompatibility);
    return () => {
      window.removeEventListener('resize', checkDeviceCompatibility);
      window.removeEventListener('orientationchange', checkDeviceCompatibility);
    };
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const toggleThemeSlider = useCallback(() => {
    const newVisibility = !isThemeSliderVisible;
    setIsThemeSliderVisible(newVisibility);
    setUserPreferences({ ...userPreferences, showThemeSlider: newVisibility }).catch(error => {
      toast({
        title: t('errorSavingPreferences'),
        description: error.message || t('errorSavingPreferencesData'),
        variant: "destructive",
      });
    });
  }, [isThemeSliderVisible, userPreferences, setUserPreferences, t, toast]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      refetch().catch(error => {
        toast({
          title: t('errorSearching'),
          description: error.message || t('errorSearchingData'),
          variant: "destructive",
        });
      });
    }
  }, [refetch, t, toast]);

  const memoizedAbayaItems = useMemo(() => {
    return data?.pages.flatMap(page => page.items) || [];
  }, [data]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <motion.div 
          className="flex justify-center items-center h-64" 
          role="status" 
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loader className="animate-spin h-12 w-12 text-blue-500" />
          <span className="sr-only">{t('loading')}</span>
        </motion.div>
      );
    }

    if (isError) {
      return (
        <motion.div 
          className="text-red-500 text-center mt-4 p-4 bg-red-100 rounded-lg" 
          role="alert"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <h2 className="text-xl font-bold mb-2">{t('errorOccurred')}</h2>
          <p>{error.message || t('errorLoadingData')}</p>
          <motion.button 
            onClick={() => refetch().catch(error => {
              toast({
                title: t('errorRetrying'),
                description: error.message || t('errorRetryingData'),
                variant: "destructive",
              });
            })} 
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            aria-label={t('retryButton')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('retryButton')}
          </motion.button>
        </motion.div>
      );
    }

    if (memoizedAbayaItems.length === 0) {
      return (
        <motion.div 
          className="text-center mt-4 p-4" 
          role="status" 
          aria-live="polite"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <p className="text-xl">{t('noResults')}</p>
        </motion.div>
      );
    }

    return (
      <>
        <motion.div 
          className={`grid gap-6 mt-8 ${
            deviceInfo.isMobile 
              ? 'grid-cols-1' 
              : deviceInfo.isTablet 
                ? 'grid-cols-2 sm:grid-cols-3' 
                : 'grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AnimatePresence>
            {memoizedAbayaItems.map((item) => (
              <motion.div
                key={item.id}
                className="transform hover:scale-105 transition-transform duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <ErrorBoundary>
                  <Suspense fallback={<div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>}>
                    <AbayaItem 
                      id={item.id} 
                      image={base64Images[item.id] || item.image} 
                      brand={item.brand} 
                      deviceInfo={deviceInfo}
                    />
                  </Suspense>
                </ErrorBoundary>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {hasNextPage && (
          <motion.button 
            onClick={() => fetchNextPage().catch(error => {
              toast({
                title: t('errorLoadingMore'),
                description: error.message || t('errorLoadingMoreData'),
                variant: "destructive",
              });
            })} 
            disabled={isFetchingNextPage}
            className="mt-8 w-full md:w-auto md:px-8 bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors shadow-md font-semibold disabled:opacity-50 flex justify-center items-center"
            aria-label={isFetchingNextPage ? t('loading') : t('loadMore')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isFetchingNextPage ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                {t('loading')}
              </>
            ) : (
              t('loadMore')
            )}
          </motion.button>
        )}
      </>
    );
  };

  return (
    <div className={`p-4 pb-20 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen ${deviceInfo.orientation === 'landscape' ? 'landscape-layout' : ''}`}>
      <motion.header 
        className={`sticky top-0 bg-white z-10 pb-4 shadow-md rounded-b-lg ${deviceInfo.isMobile ? 'mobile-header' : ''}`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-2xl md:text-3xl font-bold text-center mb-4 text-gray-800 ${deviceInfo.isMobile ? 'text-xl' : ''}`}>{t('abayaGallery')}</h1>
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            className={`w-full p-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all ${deviceInfo.isMobile ? 'text-sm' : ''}`}
            aria-label={t('searchAbayas')}
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={deviceInfo.isMobile ? 16 : 20} aria-hidden="true" />
        </div>
        <motion.button
          onClick={toggleThemeSlider}
          className={`mt-4 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors shadow-md mx-auto block ${deviceInfo.isMobile ? 'text-sm px-4 py-1' : ''}`}
          aria-expanded={isThemeSliderVisible}
          aria-controls="theme-slider"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isThemeSliderVisible ? t('hideColorSlider') : t('showColorSlider')}
        </motion.button>
      </motion.header>
      <AnimatePresence>
        {isThemeSliderVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={<div className="w-full h-12 bg-gray-200 animate-pulse rounded-lg mt-4"></div>}>
              <ThemeSlider id="theme-slider" />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
      <ErrorBoundary>
        <main>
          {renderContent()}
        </main>
      </ErrorBoundary>
      <Suspense fallback={null}>
        <DeviceInfo deviceInfo={deviceInfo} />
      </Suspense>
    </div>
  );
};

export default React.memo(HomePage);
