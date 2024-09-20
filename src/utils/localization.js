import { getLanguage } from './indexedDB';

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
    referralCode: 'رمز الإحالة',
    copyCode: 'نسخ الرمز',
    shareCode: 'مشاركة الرمز',
    rewardsPoints: 'نقاط المكافآت',
    redeemPoints: 'استبدال النقاط',
    leaderboard: 'لوحة المتصدرين',
    faq: 'الأسئلة الشائعة',
    settings: 'الإعدادات',
    language: 'اللغة',
    theme: 'السمة',
    logout: 'تسجيل الخروج',
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
    referralCode: 'Referral Code',
    copyCode: 'Copy Code',
    shareCode: 'Share Code',
    rewardsPoints: 'Rewards Points',
    redeemPoints: 'Redeem Points',
    leaderboard: 'Leaderboard',
    faq: 'FAQ',
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    logout: 'Logout',
  },
};

export const getTranslation = async (key) => {
  const language = await getLanguage();
  if (!translations[language] || !translations[language][key]) {
    console.warn(`Translation missing for key "${key}" in language "${language}"`);
    return key;
  }
  return translations[language][key];
};

export const getDirection = async () => {
  const language = await getLanguage();
  return language === 'ar' ? 'rtl' : 'ltr';
};

export const getAllTranslations = async () => {
  const language = await getLanguage();
  return translations[language] || {};
};
