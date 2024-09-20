import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, PaletteIcon, ShareIcon, HelpCircleIcon } from 'lucide-react';

const NavigationBar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around items-center h-16">
        <Link to="/" className={`p-2 rounded-full transition-colors duration-300 ${isActive('/') ? 'bg-blue-100 text-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}>
          <HomeIcon size={24} />
        </Link>
        <Link to="/themes" className={`p-2 rounded-full transition-colors duration-300 ${isActive('/themes') ? 'bg-blue-100 text-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}>
          <PaletteIcon size={24} />
        </Link>
        <Link to="/share" className={`p-2 rounded-full transition-colors duration-300 ${isActive('/share') ? 'bg-blue-100 text-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}>
          <ShareIcon size={24} />
        </Link>
        <Link to="/faq" className={`p-2 rounded-full transition-colors duration-300 ${isActive('/faq') ? 'bg-blue-100 text-blue-500' : 'text-gray-500 hover:bg-gray-100'}`}>
          <HelpCircleIcon size={24} />
        </Link>
      </div>
    </nav>
  );
};

export default NavigationBar;
