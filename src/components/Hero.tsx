import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { De } from '../lib/sdk';
import { Banner } from '../types';

const DEFAULT_BANNERS = [
  {
    id: 'default-1',
    title: 'Elevate Your Style',
    slogan: 'Premium menswear crafted for the modern gentleman',
    image: 'https://media.base44.com/images/public/6a5e0623b671b808e3a154f8/a86fee29f_generated_23e56dac.png',
    order: 1,
    active: true
  },
  {
    id: 'default-2',
    title: 'New Collection',
    slogan: 'Discover the art of sophisticated dressing',
    image: 'https://media.base44.com/images/public/6a5e0623b671b808e3a154f8/ca1eba1bb_generated_ee3d7de1.png',
    order: 2,
    active: true
  },
  {
    id: 'default-3',
    title: 'Timeless Elegance',
    slogan: 'Where tradition meets modern craftsmanship',
    image: 'https://media.base44.com/images/public/6a5e0623b671b808e3a154f8/86b899b2c_generated_964ca257.png',
    order: 3,
    active: true
  }
];

export const Hero: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    De.entities.Banner.filter({ active: true }, 'order', 20)
      .then((res) => {
        if (res.length > 0) {
          setBanners(res);
        }
      })
      .catch((err) => console.error('Failed to load banners:', err));
  }, []);

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3500);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    resetTimer();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    resetTimer();
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative min-h-[65dvh] sm:min-h-[75dvh] md:min-h-[85dvh] h-[550px] sm:h-[650px] md:h-[720px] max-h-[850px] overflow-hidden bg-obsidian flex items-center">
      {/* Background Slides */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full"
          >
            {currentBanner.image ? (
              <img
                src={currentBanner.image}
                alt={currentBanner.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-slate-900" />
            )}
            {/* Ambient vignette gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian/95 via-obsidian/60 to-obsidian/30 sm:via-obsidian/40 sm:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/30" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Ambient Accent Blur */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-1000 opacity-20">
        <div className="absolute top-[30%] left-[20%] w-[200px] sm:w-[280px] h-[200px] sm:h-[280px] bg-cobalt/35 rounded-full blur-[80px] sm:blur-[100px]" />
      </div>

      {/* Slide Text Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full relative z-10 pt-12 sm:pt-16 pb-8 sm:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl md:max-w-2xl text-left"
          >
            <motion.p
              initial={{ opacity: 0, tracking: '0.1em' }}
              animate={{ opacity: 0.8, tracking: '0.25em' }}
              className="text-cobalt text-xs sm:text-sm font-bold uppercase mb-2 sm:mb-3"
            >
              {currentBanner.slogan || 'Kozzak Mens Wear'}
            </motion.p>
            <motion.h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-silver tracking-tight leading-[1.1] mb-5 sm:mb-7">
              {currentBanner.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Link
                to="/category"
                className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-cobalt text-white text-sm sm:text-base font-semibold rounded-xl glow-blue transition-transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-xl"
              >
                <span>Shop Collection</span>
                <ChevronRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel navigation controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="hidden sm:flex absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass items-center justify-center text-silver/70 hover:text-silver z-20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Previous"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="hidden sm:flex absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass items-center justify-center text-silver/70 hover:text-silver z-20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Next"
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-obsidian/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-silver/10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  resetTimer();
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex ? 'bg-cobalt w-6 sm:w-8 glow-blue' : 'bg-silver/30 hover:bg-silver/50 w-2'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
export default Hero;
