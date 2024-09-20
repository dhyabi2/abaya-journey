import React, { useState, useEffect } from 'react';
import { HeartIcon, ShareIcon, ZoomInIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getLikeStatus, setLikeStatus } from '../utils/indexedDB';

const AbayaItem = ({ id, image, brand }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      // This is a placeholder for the actual API call
      const response = await fetch(`/api/like-abaya/${id}`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to like abaya');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['abayaItems']);
    },
  });

  useEffect(() => {
    const checkLikeStatus = async () => {
      const status = await getLikeStatus(id);
      setIsLiked(status);
    };

    checkLikeStatus();
  }, [id]);

  const handleLike = async () => {
    const newLikeStatus = !isLiked;
    setIsLiked(newLikeStatus);
    try {
      await likeMutation.mutateAsync();
      await setLikeStatus(id, newLikeStatus);
    } catch (error) {
      console.error('Error updating like status:', error);
      setIsLiked(isLiked); // Revert state if mutation fails
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Abaya by ${brand}`,
          text: `Check out this beautiful abaya by ${brand}!`,
          url: `${window.location.origin}/abaya/${id}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert(`Share this abaya by ${brand}: ${window.location.origin}/abaya/${id}`);
    }
  };

  const handleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg">
      {!imageLoaded && (
        <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
      )}
      <img 
        src={image}
        alt={`Abaya by ${brand}`} 
        className={`w-full h-auto object-cover ${isZoomed ? 'scale-150' : 'scale-100'} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out' }}
        onLoad={handleImageLoad}
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
        <p className="text-sm font-semibold">{brand}</p>
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
          <button 
            onClick={handleZoom} 
            className="p-1 rounded-full bg-white bg-opacity-50"
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            <ZoomInIcon size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbayaItem;
