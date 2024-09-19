import React from 'react';
import { SearchIcon } from 'lucide-react';
import AbayaItem from './AbayaItem';

const HomePage = () => {
  // Placeholder data for abaya items
  const abayaItems = [
    { id: 1, image: 'base64_image_1', brand: 'Brand 1' },
    { id: 2, image: 'base64_image_2', brand: 'Brand 2' },
    { id: 3, image: 'base64_image_3', brand: 'Brand 3' },
  ];

  return (
    <div className="p-4 pb-20">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-center mb-2">معرض العباءات</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="بحث"
            className="w-full p-2 pr-10 rounded-full border border-gray-300"
          />
          <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </header>
      <div className="grid grid-cols-2 gap-4">
        {abayaItems.map((item) => (
          <AbayaItem key={item.id} image={item.image} brand={item.brand} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;