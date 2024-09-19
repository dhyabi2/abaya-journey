import React, { useState, useEffect } from 'react';
import { HeartIcon, ShareIcon, ZoomInIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const AbayaItem = ({ id, image, brand }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
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
      // This is a placeholder for checking like status from IndexedDB
      const db = await openDatabase();
      const status = await getLikeStatus(db, id);
      setIsLiked(status);
    };

    checkLikeStatus();
  }, [id]);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    try {
      await likeMutation.mutateAsync();
      const db = await openDatabase();
      await storeLikeStatus(db, id, !isLiked);
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

  return (
    <div className="relative">
      <img 
        src={`data:image/png;base64,${image}`} 
        alt={`Abaya by ${brand}`} 
        className={`w-full h-auto rounded-lg transition-transform duration-300 ${isZoomed ? 'scale-150' : ''}`} 
      />
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

// IndexedDB functions (placeholders)
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AbayaApp', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('likes', { keyPath: 'id' });
    };
  });
};

const getLikeStatus = (db, id) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['likes'], 'readonly');
    const store = transaction.objectStore('likes');
    const request = store.get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ? request.result.status : false);
  });
};

const storeLikeStatus = (db, id, status) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['likes'], 'readwrite');
    const store = transaction.objectStore('likes');
    const request = store.put({ id, status });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export default AbayaItem;
