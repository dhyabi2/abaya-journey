import React, { useState } from 'react';
import { HeartIcon, ShareIcon } from 'lucide-react';

const AbayaItem = ({ image, brand }) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement storing like state in IndexedDB
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Abaya by ${brand}`,
          text: `Check out this beautiful abaya by ${brand}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert(`Share this abaya by ${brand}`);
    }
  };

  return (
    <div className="relative">
      <img src={`data:image/png;base64,${image}`} alt={`Abaya by ${brand}`} className="w-full h-auto rounded-lg" />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
        <p className="text-sm">{brand}</p>
        <div className="absolute top-2 right-2 flex space-x-2">
          <button 
            onClick={handleLike} 
            className="p-1 rounded-full bg-white bg-opacity-50"
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <HeartIcon size={20} className={isLiked ? 'text-red-500' : 'text-white'} />
          </button>
          <button 
            onClick={handleShare} 
            className="p-1 rounded-full bg-white bg-opacity-50"
            aria-label="Share"
          >
            <ShareIcon size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbayaItem;
