const translations = {
  ar: {
    home: 'الرئيسية',
    themes: 'الألوان',
    share: 'المشاركة',
    help: 'المساعدة',
    searchPlaceholder: 'ابحث عن العباءات',
    showColorSlider: 'إظهار منزلق الألوان',
    hideColorSlider: 'إخفاء منزلق الألوان',
    loadMore: 'تحميل المزيد',
    loading: 'جاري التحميل...',
    noResults: 'لم يتم العثور على نتائج',
    errorMessage: 'حدث خطأ أثناء تحميل البيانات',
    retryButton: 'إعادة المحاولة',
    likeButton: 'إعجاب',
    shareButton: 'مشاركة',
    zoomButton: 'تكبير',
  },
  en: {
    home: 'Home',
    themes: 'Themes',
    share: 'Share',
    help: 'Help',
    searchPlaceholder: 'Search for abayas',
    showColorSlider: 'Show color slider',
    hideColorSlider: 'Hide color slider',
    loadMore: 'Load more',
    loading: 'Loading...',
    noResults: 'No results found',
    errorMessage: 'An error occurred while loading data',
    retryButton: 'Retry',
    likeButton: 'Like',
    shareButton: 'Share',
    zoomButton: 'Zoom',
  },
};

export const getTranslation = (key, language) => {
  if (!translations[language] || !translations[language][key]) {
    console.warn(`Translation missing for key "${key}" in language "${language}"`);
    return key;
  }
  return translations[language][key];
};

export const getDirection = (language) => {
  return language === 'ar' ? 'rtl' : 'ltr';
};