import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroSlider = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: 'base64_image_1',
      text: 'مرحبًا بك في معرض الأزياء الفريد للعباءات',
    },
    {
      image: 'base64_image_2',
      text: 'استعرض أحدث تصاميم العباءات وغير المظهر بسهولة',
    },
    {
      image: 'base64_image_3',
      text: 'شارك التصاميم واكسب المكافآت',
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="intro-slider">
      <AnimatePresence>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="slide"
        >
          <img src={slides[currentSlide].image} alt="Abaya design" />
          <p>{slides[currentSlide].text}</p>
        </motion.div>
      </AnimatePresence>
      <div className="navigation">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
      <button onClick={nextSlide}>
        {currentSlide === slides.length - 1 ? 'ابدأ الآن' : 'التالي'}
      </button>
      <button onClick={onComplete}>تخطي</button>
    </div>
  );
};

export default IntroSlider;