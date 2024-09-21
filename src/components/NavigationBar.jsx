import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, PaletteIcon, ShareIcon, HelpCircleIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const NavigationBar = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'home' },
    { path: '/themes', icon: PaletteIcon, label: 'themes' },
    { path: '/share', icon: ShareIcon, label: 'share' },
    { path: '/faq', icon: HelpCircleIcon, label: 'help' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-4">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center w-1/4 p-2 rounded-lg transition-colors duration-300 ${
              isActive(path) ? 'bg-blue-100 text-blue-500' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Icon size={24} className="mb-1" />
            <span className="text-xs">{t(label)}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default NavigationBar;
