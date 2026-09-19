import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Import real product images from assets
import bajraFlour from '../../assets/bajra-flour.png';
import ramarMaitha from '../../assets/maida.jpeg';
import ramarNoodles from '../../assets/noodles.jpeg';
import wheatFlour1 from '../../assets/atta.jpeg';
import ramarBajjiBonda from '../../assets/Ramar Bajji Bonda.jpg.jpeg';
import ramarElluIdlyPodi from '../../assets/ellupodi.jpeg';
import ramarIdlyPodi from '../../assets/idlypodi.jpeg';
import kambuMaavu from '../../assets/sambakurunai.jpeg';
import ramarMaida from '../../assets/maida.jpeg';
import ramarMilletPuttu from '../../assets/milletpodi.jpeg';
import ramarNoodles2 from '../../assets/Ramar Noodles_DZN-1115_1Kg_350x220mm_5.jpg.jpeg';
import ramarPuliyotharai from '../../assets/onion.png';
import ramarSambaKothikurunai from '../../assets/sambakurunai.jpeg';
import idiyappam from '../../assets/idiyappam.jpeg';
import sambarava from '../../assets/idiyappam.jpeg';
import ramarUlunthankali from '../../assets/ulunthakali.jpeg';
import wheatFlour2 from '../../assets/atta.jpeg';
import ramarWheatFlour3 from '../../assets/atta.jpeg';

const FeaturedCollections = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageIndices, setImageIndices] = useState({});
  const [wishlist, setWishlist] = useState({});
  const touchStartRef = useRef(0);

  const collections = [
    {
      id: 1,
      name: "Wheat Flour",
      category: "Flour",
      tamilName: "கோதுமை மாவு",
      quote: "மிருதுவான சப்பாத்திக்கு தரமான கோதுமை மாவு.",
      images: [wheatFlour1, wheatFlour2],
      price: 55,
      mrp: 75,
      badge: { text: "New", bg: "bg-[#e8703b] text-white" },
      reviews: 128,
      link: "/products?category=FLOUR",
    },
    {
      id: 2,
      name: "Idiyappam Podi",
      category: "Mixes",
      tamilName: "இடியாப்ப மாவு",
      quote: "சுவையான இடியாப்பம், குடும்பத்தின் விருப்பம்!",
      images: [idiyappam],
      price: 48,
      mrp: 65,
      badge: { text: "New", bg: "bg-[#e8703b] text-white" },
      reviews: 96,
      link: "/products?category=INSTANT%20PRODUCTS",
    },
    {
      id: 3,
      name: "Samba Rava",
      category: "Rava",
      tamilName: "சம்பா ரவை",
      quote: "எளிதில் சமைக்க சுவையான சம்பா கோதுமை குருணை.",
      images: [ramarSambaKothikurunai],
      price: 62,
      mrp: 80,
      badge: { text: "New", bg: "bg-[#e8703b] text-white" },
      reviews: 142,
      link: "/products?category=RAVA",
    },
    {
      id: 4,
      name: "Kambu Maavu",
      category: "Millets",
      tamilName: "கம்பு மாவு",
      quote: "உடலுக்கு வலிமை கம்பு மாவே!",
      images: [kambuMaavu],
      price: 52,
      mrp: 70,
      badge: null,
      reviews: 87,
      link: "/products?category=Millet%20Products",
    },
    {
      id: 5,
      name: "Special Noodles",
      category: "Noodles",
      tamilName: "நூடுல்ஸ்",
      quote: "செஃப்பின் விருப்பம்... ராமர் நூடுல்ஸ்!",
      images: [ramarNoodles2],
      price: 40,
      mrp: 55,
      badge: { text: "New", bg: "bg-[#e8703b] text-white" },
      reviews: 110,
      link: "/products?category=NOODLES",
    },
    {
      id: 6,
      name: "Pure Maida",
      category: "Flour",
      tamilName: "மைதா",
      quote: "மென்மையான மாவு... அற்புதமான சுவை!",
      images: [ramarMaitha],
      price: 45,
      mrp: 60,
      badge: null,
      reviews: 78,
      link: "/products?category=FLOUR",
    },
    {
      id: 7,
      name: "Idly Podi",
      category: "Podi",
      tamilName: "இட்லி பொடி",
      quote: "இட்லிக்கு இனிய துணை... சுவையின் முழுமை!",
      images: [ramarIdlyPodi],
      price: 35,
      mrp: 50,
      badge: { text: "New", bg: "bg-[#e8703b] text-white" },
      reviews: 154,
      link: "/products?category=spices",
    },
    {
      id: 8,
      name: "Puliyodharai Mix",
      category: "Mixes",
      tamilName: "புளியோதரை மிக்ஸ்",
      quote: "மணம் கமழும் புளியோதரை... மனம் நிறைக்கும் ருசி!",
      images: [ramarPuliyotharai],
      price: 42,
      mrp: 60,
      badge: null,
      reviews: 91,
      link: "/products?category=INSTANT%20PRODUCTS",
    },
    {
      id: 9,
      name: "Ulunthankali Mix",
      category: "Mixes",
      tamilName: "உளுந்தங்களி மிக்ஸ்",
      quote: "எலும்புகளுக்கு வலிமை தரும் பாரம்பரிய உணவு!",
      images: [ramarUlunthankali],
      price: 58,
      mrp: 75,
      badge: { text: "New", bg: "bg-[#e8703b] text-white" },
      reviews: 64,
      link: "/products?category=INSTANT%20PRODUCTS",
    },
    {
      id: 10,
      name: "Bajji Bonda Mix",
      category: "Mixes",
      tamilName: "பஜ்ஜி போண்டா மிக்ஸ்",
      quote: "மொறுமொறு பஜ்ஜி... மனம் கவரும் சுவை!",
      images: [ramarBajjiBonda],
      price: 38,
      mrp: 50,
      badge: { text: "New", bg: "bg-[#e8703b] text-white" },
      reviews: 136,
      link: "/products?category=INSTANT%20PRODUCTS",
    }
  ];

  // Auto-rotate images for collections with multiple images
  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndices(prev => {
        const newIndices = { ...prev };
        collections.forEach(item => {
          if (item.images.length > 1) {
            newIndices[item.id] = ((prev[item.id] || 0) + 1) % item.images.length;
          }
        });
        return newIndices;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    setWishlist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        toast.success("Added to wishlist", { id: `wish-col-${id}`, duration: 1500 });
      }
      return next;
    });
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, collections.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? collections.length - 4 : prev - 1));
  };

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
    <section className="py-12 bg-white relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 pb-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Featured Collections
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/products")}
              className="text-xs sm:text-sm font-medium text-[#e8703b] hover:text-[#d45f2a] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {/* Navigation Arrows */}
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={prevSlide}
                className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
                disabled={currentIndex === 0}
                aria-label="Previous collections"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
                disabled={currentIndex >= collections.length - 4}
                aria-label="Next collections"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Collections Horizontal Track */}
        <div
          className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth pb-4 px-1"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {collections.map((item) => {
            const isWishlisted = !!wishlist[item.id];

            return (
              <div
                key={item.id}
                className="flex-shrink-0 w-[205px] sm:w-[220px] md:w-[235px] group flex flex-col"
              >
                <div className="bg-white rounded-2xl border border-gray-200/85 hover:border-gray-300 shadow-xs hover:shadow-md transition-all duration-300 p-3 sm:p-3.5 flex flex-col justify-between h-full">
                  {/* 1. Square Image Container */}
                  <div
                    className="relative w-full aspect-square bg-[#F7F7F7] rounded-xl overflow-hidden mb-3 flex items-center justify-center p-3 cursor-pointer"
                    onClick={() => navigate(item.link)}
                  >
                    {/* Top-Left Badge */}
                    {item.badge && (
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wide ${item.badge.bg}`}>
                          {item.badge.text}
                        </span>
                      </div>
                    )}

                    {/* Top-Right Heart Icon */}
                    <button
                      onClick={(e) => toggleWishlist(item.id, e)}
                      className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors shadow-2xs"
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          isWishlisted ? "fill-red-500 text-red-500" : "stroke-[1.8]"
                        }`}
                      />
                    </button>

                    {/* Auto-Rotating Product Image */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      {item.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={item.name}
                          className={`absolute max-h-full max-w-full object-contain mix-blend-multiply transition-all duration-500 ease-out group-hover:scale-106 ${
                            (imageIndices[item.id] || 0) === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 2. Text Details */}
                  <div className="flex flex-col flex-grow">
                    {/* Collection Title */}
                    <h3
                      onClick={() => navigate(item.link)}
                      className="font-semibold text-gray-900 text-[13.5px] sm:text-[14px] leading-tight truncate cursor-pointer group-hover:text-[#e8703b] transition-colors"
                      title={item.name}
                    >
                      {item.name}
                    </h3>

                    {/* Tamil Name Subtitle */}
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {item.tamilName}
                    </p>

                    {/* Price Row: Bold Price + Strikethrough MRP */}
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <span className="font-bold text-gray-900 text-sm sm:text-[15px]">
                        ₹{item.price}
                      </span>
                      {item.mrp > item.price && (
                        <span className="text-[11px] text-gray-400 line-through font-normal">
                          ₹{item.mrp}
                        </span>
                      )}
                    </div>

                    {/* Star Rating Row */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="flex text-[#F59E0B] gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]"
                          />
                        ))}
                      </div>
                      <span className="text-[10.5px] text-gray-500 font-medium ml-0.5">
                        ({item.reviews})
                      </span>
                    </div>

                    {/* Full-width Orange Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(item.link);
                      }}
                      className="w-full mt-3 py-2 px-3 rounded-lg bg-[#e8703b] hover:bg-[#d45f2a] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 stroke-[1.9]" />
                      <span>Explore Collection</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;