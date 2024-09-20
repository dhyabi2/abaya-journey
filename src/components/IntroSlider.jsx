import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const IntroSlider = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: '/images/intro-abaya1.jpg',
      text: 'مرحبًا بك في عالم العباءات الأنيقة',
      description: 'استكشف مجموعتنا الواسعة من العباءات العصرية والتقليدية'
    },
    {
      image: '/images/intro-abaya2.jpg',
      text: 'تصاميم فريدة لكل مناسبة',
      description: 'من العباءات اليومية إلى الفاخرة، لدينا ما يناسب ذوقك'
    },
    {
      image: '/images/intro-abaya3.jpg',
      text: 'جودة عالية وراحة فائقة',
      description: 'نستخدم أفضل الأقمشة لضمان الراحة والأناقة في آن واحد'
    },
    {
      image: '/images/intro-abaya4.jpg',
      text: 'تسوق بسهولة وأمان',
      description: 'استمتع بتجربة تسوق سلسة مع خيارات دفع آمنة وشحن سريع'
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
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
    <div className="intro-slider h-screen flex flex-col justify-between bg-gray-50" dir="rtl" lang="ar">
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
          <img 
            src={slides[currentSlide].image} 
            alt={`عباءة ${currentSlide + 1}`} 
            className="w-full h-64 object-cover rounded-lg mb-6 shadow-lg"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">{slides[currentSlide].text}</h2>
          <p className="text-md text-gray-600 text-center max-w-md">{slides[currentSlide].description}</p>
        </motion.div>
      </AnimatePresence>
      <div className="navigation flex justify-between items-center p-4 bg-white shadow-md">
        <button 
          onClick={prevSlide} 
          disabled={currentSlide === 0} 
          className="p-2 rounded-full bg-gray-200 disabled:opacity-50 transition-colors duration-200 hover:bg-gray-300"
          aria-label="الشريحة السابقة"
        >
          <ChevronRight className="h-6 w-6 text-gray-600" />
        </button>
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot w-3 h-3 rounded-full ${
                index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
              } cursor-pointer transition-colors duration-200`}
              onClick={() => setCurrentSlide(index)}
              role="button"
              aria-label={`الانتقال إلى الشريحة ${index + 1}`}
              tabIndex={0}
            />
          ))}
        </div>
        <button 
          onClick={nextSlide} 
          className="p-2 rounded-full bg-blue-500 text-white transition-colors duration-200 hover:bg-blue-600"
          aria-label={currentSlide === slides.length - 1 ? "إنهاء المقدمة" : "الشريحة التالية"}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default IntroSlider;
