import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HeartIcon, ShareIcon, ZoomInIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getLikeStatus, setLikeStatus } from '../utils/indexedDB';
import { motion, AnimatePresence } from 'framer-motion';

const AbayaItem = ({ id, image, brand }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
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

  const handleLike = useCallback(async () => {
    const newLikeStatus = !isLiked;
    setIsLiked(newLikeStatus);
    try {
      await likeMutation.mutateAsync();
      await setLikeStatus(id, newLikeStatus);
    } catch (error) {
      console.error('Error updating like status:', error);
      setIsLiked(isLiked);
    }
  }, [id, isLiked, likeMutation]);

  const handleShare = useCallback(async () => {
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
  }, [brand, id]);

  const handleZoom = useCallback(() => {
    setIsZoomed((prev) => !prev);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const imageStyle = useMemo(() => ({
    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
    transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
    opacity: imageLoaded ? 1 : 0,
  }), [isZoomed, imageLoaded]);

  return (
    <motion.div
      className="relative overflow-hidden rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      layout
    >
      {!imageLoaded && (
        <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
      )}
      <img 
        src={image}
        alt={`Abaya by ${brand}`} 
        className="w-full h-auto object-cover"
        style={imageStyle}
        onLoad={handleImageLoad}
        loading="lazy"
      />
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={handleZoom}
              className="absolute top-2 right-2 text-white"
              aria-label="Close zoom"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-sm font-semibold">{brand}</p>
        <div className="absolute top-2 right-2 flex space-x-2">
          <motion.button 
            onClick={handleLike} 
            className="p-1 rounded-full bg-white bg-opacity-50"
            whileTap={{ scale: 0.9 }}
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <HeartIcon size={20} className={isLiked ? 'text-red-500' : 'text-white'} />
          </motion.button>
          <motion.button 
            onClick={handleShare} 
            className="p-1 rounded-full bg-white bg-opacity-50"
            whileTap={{ scale: 0.9 }}
            aria-label="Share"
          >
            <ShareIcon size={20} className="text-white" />
          </motion.button>
          <motion.button 
            onClick={handleZoom} 
            className="p-1 rounded-full bg-white bg-opacity-50"
            whileTap={{ scale: 0.9 }}
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            <ZoomInIcon size={20} className="text-white" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(AbayaItem);
