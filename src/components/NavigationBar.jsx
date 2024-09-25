import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, PlusCircleIcon } from 'lucide-react';

const NavigationBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around items-center h-16">
        <Link to="/" className="flex flex-col items-center">
          <HomeIcon size={24} />
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/add-abaya" className="flex flex-col items-center">
          <PlusCircleIcon size={24} />
          <span className="text-xs">Add Abaya</span>
        </Link>
      </div>
    </nav>
  );
};

export default NavigationBar;
