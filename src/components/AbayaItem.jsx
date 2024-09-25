import React from 'react';

const AbayaItem = ({ brand, price, image }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg">
      <img src={image} alt={`Abaya by ${brand}`} className="w-full h-64 object-cover" />
      <div className="p-4">
        <h2 className="font-bold text-xl mb-2">{brand}</h2>
        <p className="text-gray-700 text-base">Price: ${price}</p>
      </div>
    </div>
  );
};

export default AbayaItem;
