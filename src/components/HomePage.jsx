import React from 'react';
import { SearchIcon } from 'lucide-react';
import AbayaItem from './AbayaItem';
import { useQuery } from '@tanstack/react-query';

const fetchAbayaItems = async () => {
  // This is a placeholder for the actual API call
  const response = await fetch('/api/abaya-items');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const HomePage = () => {
  const { data: abayaItems, isLoading, error } = useQuery({
    queryKey: ['abayaItems'],
    queryFn: fetchAbayaItems,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div className="p-4 pb-20">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-center mb-2">معرض العباءات</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="بحث"
            className="w-full p-2 pr-10 rounded-full border border-gray-300"
            aria-label="Search abaya items"
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
