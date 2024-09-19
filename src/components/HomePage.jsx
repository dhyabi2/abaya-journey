import React, { useState, useEffect, useCallback } from 'react';
import { SearchIcon } from 'lucide-react';
import AbayaItem from './AbayaItem';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getAbayaItems } from '../utils/indexedDB';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
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
    retry: 1,
    retryDelay: 1000,
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

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      if (hasNextPage) {
        fetchNextPage();
      }
    }
  }, [hasNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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
      </header>
      <motion.div 
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {abayaItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AbayaItem id={item.id} image={item.image} brand={item.brand} />
          </motion.div>
        ))}
      </motion.div>
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
