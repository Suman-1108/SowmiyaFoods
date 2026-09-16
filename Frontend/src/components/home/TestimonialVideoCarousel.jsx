import React, { useState, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaQuoteLeft, FaStar } from 'react-icons/fa';
import test1 from "../../assets/test1.mp4";
import test2 from "../../assets/test2.mp4";
import test3 from "../../assets/test3.mp4";
import test4 from "../../assets/test4.mp4";

const TestimonialVideoCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRef = useRef(null);
  const touchStartRef = useRef(0);

  const testimonials = [
    {
      id: 1,
      name: "Priya & Family",
      location: "Chennai",
      rating: 5,
      quote: "Sowmiya vermicelli has become our Sunday breakfast tradition. The texture is just perfect!",
      videoUrl: test1,
      verified: true
    },
    {
      id: 2,
      name: "Meena's Kitchen",
      location: "Coimbatore",
      rating: 5,
      quote: "As a home chef, I only trust Sowmiya rava for my upma. Consistent quality every time.",
      videoUrl: test2,
      verified: true
    },
    {
      id: 3,
      name: "Rajesh Kumar",
      location: "Madurai",
      rating: 5,
      quote: "The noodles are a hit with my kids! Quick, tasty, and I know it's made with good ingredients.",
      videoUrl: test3,
      verified: true
    },
    {
      id: 4,
      name: "Lakshmi Aunty",
      location: "Salem",
      rating: 5,
      quote: "30 years of cooking, and Sowmiya atta makes the softest rotis. Highly recommended!",
      videoUrl: test4,
      verified: true
    }
  ];

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const nextSlide = () => {
    stopVideo();
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    stopVideo();
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    stopVideo();
    setActiveIndex(index);
  };

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
  };

  const current = testimonials[activeIndex];

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFFBF5] to-[#FFF5EB] overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-[#E63946]/10 text-[#E63946] text-sm font-semibold rounded-full mb-4">
            Customer Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
            Loved by Home Cooks
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Watch real customers share their experiences with Sowmiya Foods products
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#F7931E]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#E63946]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            {/* ── Video side ── */}
            <div className="relative group">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                <div className="relative aspect-[4/3] bg-gray-900">
                  <video
                    key={activeIndex}
                    ref={videoRef}
                    src={current.videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                  />
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-[#F7931E] rounded-tl-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-[#E63946] rounded-br-3xl pointer-events-none" />
              </div>

              {/* Floating rating badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 animate-bounce-slow">
                <div className="flex text-yellow-400">
                  {[...Array(current.rating)].map((_, i) => (
                    <FaStar key={i} className="text-sm" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-600">5.0</span>
              </div>
            </div>

            {/* ── Content side ── */}
            <div className="lg:pl-8">
              <div className="mb-6">
                <FaQuoteLeft className="text-5xl text-[#F7931E]/30" />
              </div>

              <div className="mb-8">
                <p className="text-2xl md:text-3xl font-medium text-gray-800 leading-relaxed mb-6">
                  "{current.quote}"
                </p>

                <div className="flex items-center gap-4">
                  {/* Avatar initials circle — no image needed */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F7931E] to-[#E63946] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {current.name.charAt(0)}
                      </span>
                    </div>
                    {current.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{current.name}</h4>
                    <p className="text-gray-500 text-sm">{current.location}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={prevSlide}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#E63946] hover:text-[#E63946] transition-all duration-300"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#E63946] hover:text-[#E63946] transition-all duration-300"
                >
                  <FaChevronRight />
                </button>

                <div className="flex gap-2 ml-4">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === activeIndex
                          ? 'w-8 bg-[#E63946]'
                          : 'w-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Slide strip — now shows slide numbers instead of thumbnails */}
          <div className="mt-12 flex justify-center gap-4">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                onClick={() => goToSlide(index)}
                className={`w-16 h-12 rounded-xl flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  index === activeIndex
                    ? 'bg-[#E63946] text-white scale-110'
                    : 'bg-gray-100 text-gray-500 opacity-60 hover:opacity-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default TestimonialVideoCarousel;