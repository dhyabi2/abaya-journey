import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, PaletteIcon, ShareIcon, HelpCircleIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const NavigationBar = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-4">
        <Link to="/" className={`flex flex-col items-center justify-center w-1/4 p-2 rounded-lg transition-colors duration-300 ${isActive('/') ? 'bg-blue-100 text-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}>
          <HomeIcon size={24} className="mb-1" />
          <span className="text-xs hidden sm:inline">{t('home')}</span>
        </Link>
        <Link to="/themes" className={`flex flex-col items-center justify-center w-1/4 p-2 rounded-lg transition-colors duration-300 ${isActive('/themes') ? 'bg-blue-100 text-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}>
          <PaletteIcon size={24} className="mb-1" />
          <span className="text-xs hidden sm:inline">{t('themes')}</span>
        </Link>
        <Link to="/share" className={`flex flex-col items-center justify-center w-1/4 p-2 rounded-lg transition-colors duration-300 ${isActive('/share') ? 'bg-blue-100 text-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}>
          <ShareIcon size={24} className="mb-1" />
          <span className="text-xs hidden sm:inline">{t('share')}</span>
        </Link>
        <Link to="/faq" className={`flex flex-col items-center justify-center w-1/4 p-2 rounded-lg transition-colors duration-300 ${isActive('/faq') ? 'bg-blue-100 text-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}>
          <HelpCircleIcon size={24} className="mb-1" />
          <span className="text-xs hidden sm:inline">{t('help')}</span>
        </Link>
      </div>
    </nav>
  );
};

export default NavigationBar;
