import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import banner1 from "../../assets/banner1.png";
import banner2 from "../../assets/banner2.png";
import banner3 from "../../assets/banner3.png";
import banner4 from "../../assets/banner4.png";
import banner6 from "../../assets/banner6.png";


import banner1Mobile from "../../assets/banner1-mobile.png";
import banner2Mobile from "../../assets/banner2-mobile.png";
import banner3Mobile from "../../assets/banner3-mobile.png";
import banner4Mobile from "../../assets/banner4-mobile.png";
import banner5Mobile from "../../assets/banner5-mobile.png";

const desktopBanners = [banner6, banner2, banner3, banner1];
const mobileBanners = [banner1Mobile, banner2Mobile, banner3Mobile, banner5Mobile];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const audioRef = useRef(null);
  const prevIndexRef = useRef(0);
  const touchStartRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const banners = isMobile ? mobileBanners : desktopBanners;

  useEffect(() => {
    if (currentIndex !== prevIndexRef.current) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
          console.log("Audio playback failed:", error);
        });
      }
      prevIndexRef.current = currentIndex;
    }
  }, [currentIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  const goToSlide = (index) => setCurrentIndex(index);

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-gray-100 ${isMobile ? "aspect-[9/16] max-h-auto" : "h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px]"
        }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {banners.map((banner, index) => (
        <div
          key={`${isMobile ? "mobile" : "desktop"}-${index}`}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
        >
          <img
            src={banner}
            alt={`Banner ${index + 1}`}
            className={`w-full h-full ${isMobile ? "object-fill" : "object-cover object-center"
              }`}
          />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/30 hover:bg-white/60 rounded-full flex items-center justify-center text-gray-800 transition-all duration-300 backdrop-blur-sm shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeft size={isMobile ? 18 : 24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-white/30 hover:bg-white/60 rounded-full flex items-center justify-center text-gray-800 transition-all duration-300 backdrop-blur-sm shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRight size={isMobile ? 18 : 24} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-3 sm:bottom-6 w-full flex justify-center gap-2 sm:gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${currentIndex === index
              ? "w-6 h-2 sm:w-8 sm:h-2.5 bg-white rounded-full"
              : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/60 rounded-full hover:bg-white/80"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;