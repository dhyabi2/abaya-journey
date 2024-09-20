import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const IntroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: '/images/intro-1.jpg',
      text: 'مرحبًا بك في معرض الأزياء الفريد للعباءات',
    },
    {
      image: '/images/intro-2.jpg',
      text: 'استعرض أحدث تصاميم العباءات وغير المظهر بسهولة',
    },
    {
      image: '/images/intro-3.jpg',
      text: 'شارك التصاميم واكسب المكافآت',
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSwipe = (event, info) => {
    if (info.offset.x < -50) {
      nextSlide();
    } else if (info.offset.x > 50) {
      prevSlide();
    }
  };

  return (
    <div className="intro-slider h-screen flex flex-col justify-between">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="slide flex-grow flex flex-col items-center justify-center p-4"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleSwipe}
        >
          <img src={slides[currentSlide].image} alt="Abaya design" className="w-full h-64 object-cover rounded-lg mb-4" />
          <p className="text-xl text-center">{slides[currentSlide].text}</p>
        </motion.div>
      </AnimatePresence>
      <div className="navigation flex justify-between items-center p-4">
        <button onClick={prevSlide} disabled={currentSlide === 0} className="p-2 rounded-full bg-gray-200 disabled:opacity-50">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot w-3 h-3 rounded-full ${index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
        <button onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="p-2 rounded-full bg-gray-200 disabled:opacity-50">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default IntroSlider;
