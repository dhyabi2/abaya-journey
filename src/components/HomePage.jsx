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

  if (isLoading) return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  if (isError) return <div className="text-red-500 text-center mt-4">حدث خطأ: {error.message}</div>;

  const abayaItems = data?.pages.flatMap(page => page.items) || [];

  return (
    <div className="p-4 pb-20">
      <header className="mb-4 sticky top-0 bg-white z-10 pb-4">
        <h1 className="text-2xl font-bold text-center mb-2">معرض العباءات</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="بحث"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 pr-10 rounded-full border border-gray-300"
            aria-label="Search abaya items"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button
          onClick={toggleThemeSlider}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
        >
          {isThemeSliderVisible ? 'إخفاء منزلق الألوان' : 'إظهار منزلق الألوان'}
        </button>
      </header>
      {isThemeSliderVisible && <ThemeSlider />}
      {isError ? (
        <div className="text-red-500 text-center mt-4">
          <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
          <p>{error.message}</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {abayaItems.map((item) => (
            <div key={item.id}>
              <AbayaItem id={item.id} image={item.image} brand={item.brand} />
            </div>
          ))}
        </div>
      )}
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()} 
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
        >
          تحميل المزيد
        </button>
      )}
    </div>
  );
};

export default HomePage;
