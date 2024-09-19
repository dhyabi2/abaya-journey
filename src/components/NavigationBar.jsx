import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, PaletteIcon, ShareIcon, HelpCircleIcon } from 'lucide-react';

const NavigationBar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around items-center h-16">
        <Link to="/" className={`p-2 ${isActive('/') ? 'text-blue-500' : 'text-gray-500'}`}>
          <HomeIcon size={24} />
        </Link>
        <Link to="/themes" className={`p-2 ${isActive('/themes') ? 'text-blue-500' : 'text-gray-500'}`}>
          <PaletteIcon size={24} />
        </Link>
        <Link to="/share" className={`p-2 ${isActive('/share') ? 'text-blue-500' : 'text-gray-500'}`}>
          <ShareIcon size={24} />
        </Link>
        <Link to="/faq" className={`p-2 ${isActive('/faq') ? 'text-blue-500' : 'text-gray-500'}`}>
          <HelpCircleIcon size={24} />
        </Link>
      </div>
    </nav>
  );
};

export default NavigationBar;