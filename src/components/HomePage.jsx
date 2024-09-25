import React from 'react';
import AbayaItem from './AbayaItem';

const dummyAbayaData = [
  { id: 1, brand: 'Elegant Abayas', price: 150, image: 'https://example.com/abaya1.jpg' },
  { id: 2, brand: 'Modern Styles', price: 200, image: 'https://example.com/abaya2.jpg' },
  { id: 3, brand: 'Traditional Charm', price: 180, image: 'https://example.com/abaya3.jpg' },
  { id: 4, brand: 'Luxury Collection', price: 250, image: 'https://example.com/abaya4.jpg' },
];

const HomePage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Abaya Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dummyAbayaData.map((abaya) => (
          <AbayaItem key={abaya.id} {...abaya} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
