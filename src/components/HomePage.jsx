import React, { useState, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import AbayaItem from './AbayaItem';
import { useInfiniteQuery } from '@tanstack/react-query';

const fetchAbayaItems = async ({ pageParam = 0 }) => {
  // This is a placeholder for the actual API call
  const response = await fetch(`/api/abaya-items?page=${pageParam}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['abayaItems', searchTerm],
    queryFn: fetchAbayaItems,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      if (hasNextPage) {
        fetchNextPage();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, fetchNextPage]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>An error occurred: {error.message}</div>;

  const abayaItems = data?.pages.flatMap(page => page.items) || [];

  return (
    <div className="p-4 pb-20">
      <header className="mb-4">
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
          <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </header>
      <div className="grid grid-cols-2 gap-4">
        {abayaItems.map((item) => (
          <AbayaItem key={item.id} image={item.image} brand={item.brand} />
        ))}
      </div>
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} className="mt-4 w-full bg-blue-500 text-white p-2 rounded">
          Load More
        </button>
      )}
    </div>
  );
};

export default HomePage;
