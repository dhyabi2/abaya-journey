import React, { useState, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import AbayaItem from './AbayaItem';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getAbayaItems } from '../utils/indexedDB';
import ThemeSlider from './ThemeSlider';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isThemeSliderVisible, setIsThemeSliderVisible] = useState(false);
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['abayaItems', debouncedSearchTerm],
    queryFn: ({ pageParam = 0 }) => getAbayaItems(pageParam, 10, debouncedSearchTerm),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    refetch();
  }, [debouncedSearchTerm, refetch]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleThemeSlider = () => {
    setIsThemeSliderVisible(!isThemeSliderVisible);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (isError) return (
    <div className="text-red-500 text-center mt-4 p-4 bg-red-100 rounded-lg">
      <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
      <p>{error.message}</p>
      <button 
        onClick={() => refetch()} 
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
      >
        إعادة المحاولة
      </button>
    </div>
  );

  const abayaItems = data?.pages.flatMap(page => page.items) || [];

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="mb-6 sticky top-0 bg-white z-10 pb-4 shadow-md rounded-b-lg">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">معرض العباءات</h1>
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="بحث عن العباءات"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
            aria-label="Search abaya items"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button
          onClick={toggleThemeSlider}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors shadow-md mx-auto block"
        >
          {isThemeSliderVisible ? 'إخفاء منزلق الألوان' : 'إظهار منزلق الألوان'}
        </button>
      </header>
      {isThemeSliderVisible && <ThemeSlider />}
      <div className="grid grid-cols-2 gap-6 mt-8">
        {abayaItems.map((item) => (
          <div key={item.id} className="transform hover:scale-105 transition-transform duration-200">
            <AbayaItem id={item.id} image={item.image} brand={item.brand} />
          </div>
        ))}
      </div>
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()} 
          className="mt-8 w-full bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors shadow-md font-semibold"
        >
          تحميل المزيد
        </button>
      )}
    </div>
  );
};

export default HomePage;
