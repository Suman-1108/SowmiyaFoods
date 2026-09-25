import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, ArrowRight, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import { useCart } from '../../context/CartContext';
import NotifyMeModal from '../products/NotifyMeModal';
import { getCachedProducts, setCachedProducts } from '../../utils/productCache';

// Tamil name mapping for categories
const categoryTamilNames = {
  "Millet": "சிறுதானியம்",
  "Instant Products": "உடனடி பொருட்கள்",
  "Noodles": "நூடுல்ஸ்",
  "Semiya": "சேமியா",
  "Flour Items": "மாவு வகைகள்",
  "Maida": "மைதா வகைகள்",
  "Maida Items": "மைதா வகைகள்",
  "Rava Sooji": "ரவை & சூஜி",
  "Pickles": "ஊறுகாய்",
  "Thokku": "தொக்கு",
  "Traditional Mix": "பாரம்பரிய மிக்ஸ்",
  "Appalam": "அப்பளம்",
  "FLOUR": "மாவு வகைகள்",
  "NOODLES": "நூடுல்ஸ்",
  "INSTANT PRODUCTS": "உடனடி பொருட்கள்",
  "RAVA": "ரவை & சூஜி",
  "VERMICELLI": "சேமியா",
  "spices": "பாரம்பரிய மிக்ஸ்",
  "pickles": "ஊறுகாய்",
  "Millet Products": "சிறுதானியம்",
  "Maida": "மாவு வகைகள்",
  "Sooji": "ரவை & சூஜி",
  "MILLETS": "சிறுதானியம்",
  "puppet": "அப்பளம்",
};

// Get Tamil name for a product
const getTamilName = (name = "", category = "") => {
  const lower = (name || "").toLowerCase();
  if (lower.includes('thokku')) {
    if (lower.includes('tomato') || lower.includes('thakkali')) return "தக்காளி தொக்கு";
    if (lower.includes('garlic') || lower.includes('poondu')) return "பூண்டு தொக்கு";
    if (lower.includes('onion') || lower.includes('vengayam')) return "வெங்காய தொக்கு";
    return "சுவையான தொக்கு";
  }
  if (lower.includes('pickle') || lower.includes('oorugai')) {
    if (lower.includes('mango') || lower.includes('maangai')) return "மாங்காய் ஊறுகாய்";
    if (lower.includes('lemon') || lower.includes('elamichai')) return "எலுமிச்சை ஊறுகாய்";
    if (lower.includes('garlic') || lower.includes('poondu')) return "பூண்டு ஊறுகாய்";
    return "பாரம்பரிய ஊறுகாய்";
  }
  if (lower.includes('millet') && lower.includes('noodles')) return "சிறுதானிய நூடுல்ஸ்";
  if (lower.includes('millet') && lower.includes('vermicelli')) return "சிறுதானிய சேமியா";
  if (lower.includes('millet') && (lower.includes('puttu') || lower.includes('dosa'))) return "சிறுதானிய மாவு";
  if (lower.includes('ragi') && (lower.includes('vermicelli') || lower.includes('semiya'))) return "ராகி சேமியா";
  if (lower.includes('ragi') && lower.includes('flour')) return "ராகி மாவு";
  if (lower.includes('bajra') && lower.includes('flour')) return "கம்பு மாவு";
  if (lower.includes('noodles')) return "நூடுல்ஸ்";
  if (lower.includes('vermicelli') || lower.includes('semiya')) return "சேமியா";
  if (lower.includes('atta') || lower.includes('wheat')) return "கோதுமை மாவு";
  if (lower.includes('maida')) return "மைதா";
  if (lower.includes('sooji') || lower.includes('rava')) return "ரவை";
  if (lower.includes('idli podi') || lower.includes('idly podi')) return "இட்லி பொடி";
  if (lower.includes('ellu podi')) return "எள்ளு இட்லி பொடி";
  if (lower.includes('puliyotharai') || lower.includes('puliyodharai')) return "புளியோதரை மிக்ஸ்";
  if (lower.includes('ulundhankali') || lower.includes('ulunthankali')) return "உளுந்தங்களி மிக்ஸ்";
  if (lower.includes('puttu')) return "புட்டு பொடி";
  if (lower.includes('idiappam') || lower.includes('idiappa')) return "இடியாப்ப மாவு";
  if (lower.includes('murukku')) return "முறுக்கு மாவு";
  if (lower.includes('bajji') || lower.includes('bonda')) return "பஜ்ஜி போண்டா மிக்ஸ்";
  if (lower.includes('parotta')) return "பரோட்டா மாவு";
  if (lower.includes('appalam')) return "பாரம்பரிய அப்பளம்";
  return categoryTamilNames[category] || category || "ராமர் தயாரிப்பு";
};

const FeaturedCollections = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const cachedData = useRef(getCachedProducts()).current;
  const [products, setProducts] = useState(cachedData?.products || []);
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState({});
  const [notifyProduct, setNotifyProduct] = useState(null);

  // Slider controls
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Touch & Drag state
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);

  // Fetch dynamic products from the API/database
  useEffect(() => {
    let isMounted = true;
    const fetchDynamicProducts = async () => {
      try {
        const res = await axiosInstance.get('/products');
        const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        if (isMounted && data.length > 0) {
          setProducts(data);
          setCachedProducts(data);
        }
      } catch (err) {
        console.warn("Could not fetch live products, keeping cached/default products:", err?.message || err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDynamicProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update arrow button states based on scroll position
  const checkScrollability = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
  }, []);

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [products, checkScrollability]);

  // Smooth scroll handler for left and right buttons
  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const cardWidth = 240;
    const scrollAmount = cardWidth * 2;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
    setTimeout(checkScrollability, 350);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!scrollRef.current) return;
    const diff = touchStartRef.current - touchEndRef.current;
    const threshold = 50;
    const cardWidth = 240;
    if (Math.abs(diff) > threshold) {
      scrollRef.current.scrollBy({
        left: diff > 0 ? cardWidth * 1.5 : -cardWidth * 1.5,
        behavior: 'smooth'
      });
      setTimeout(checkScrollability, 350);
    }
  };

  // Mouse drag handler for desktop
  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    const startX = e.pageX;
    const scrollLeft = scrollRef.current.scrollLeft;
    let dragged = false;

    const handleMouseMove = (moveEvent) => {
      const x = moveEvent.pageX;
      const walk = (startX - x) * 1.5;
      scrollRef.current.scrollLeft = scrollLeft + walk;
      if (Math.abs(startX - x) > 5) dragged = true;
      checkScrollability();
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (dragged) {
        const preventClick = (ce) => {
          ce.preventDefault();
          ce.stopPropagation();
          document.removeEventListener('click', preventClick, true);
        };
        document.addEventListener('click', preventClick, true);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Wishlist toggle handler
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

  return (
    <section className="py-12 bg-white relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 pb-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Featured Collections
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Explore our best handpicked grocery & pantry staples
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/products")}
              className="text-xs sm:text-sm font-medium text-[#e8703b] hover:text-[#d45f2a] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {/* Navigation Arrows (Working Scroll Controller) */}
            <div className="flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? "hover:bg-amber-50 hover:border-[#e8703b] text-gray-800 hover:text-[#e8703b] cursor-pointer shadow-2xs"
                    : "opacity-35 cursor-not-allowed text-gray-400 bg-gray-50"
                }`}
                aria-label="Previous collections"
                title="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all ${
                  canScrollRight
                    ? "hover:bg-amber-50 hover:border-[#e8703b] text-gray-800 hover:text-[#e8703b] cursor-pointer shadow-2xs"
                    : "opacity-35 cursor-not-allowed text-gray-400 bg-gray-50"
                }`}
                aria-label="Next collections"
                title="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-[#e8703b] rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 font-medium text-xs sm:text-sm">Loading collections...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl text-sm text-gray-500">
            No collections found.
          </div>
        ) : (
          /* Collections Horizontal Track with scrollRef */
          <div
            ref={scrollRef}
            onScroll={checkScrollability}
            className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth pb-4 px-1 cursor-grab active:cursor-grabbing snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {products.map((item, idx) => {
              const pid = item._id || String(idx);
              const isWishlisted = !!wishlist[pid];
              const price = Number(item.price) || 0;
              const mrp = item.mrp !== undefined && item.mrp !== null ? Number(item.mrp) : (Math.round(price * 1.32) || price + 35);
              const isOutOfStock =
                item.inStock === false ||
                (item.stock !== undefined && Number(item.stock) <= 0);
              const tamilName = getTamilName(item.name, item.category);
              const dynamicImage = item.image || ph;

              // Promotional badge logic
              const badgeText =
                idx % 4 === 0 ? "Featured" : idx % 3 === 0 ? "Popular" : idx % 2 === 0 ? "Special" : null;

              return (
                <div
                  key={pid}
                  className="flex-shrink-0 w-[205px] sm:w-[220px] md:w-[235px] snap-start group flex flex-col"
                >
                  <div className="bg-white rounded-2xl border border-gray-200/85 hover:border-gray-300 shadow-xs hover:shadow-md transition-all duration-300 p-3 sm:p-3.5 flex flex-col justify-between h-full">
                    {/* 1. Square Image Container (Dynamic Database/Cloudinary Image) */}
                    <div
                      className="relative w-full aspect-square bg-[#F7F7F7] rounded-xl overflow-hidden mb-3 flex items-center justify-center p-3 cursor-pointer"
                      onClick={() => navigate(`/product/${pid}`)}
                    >
                      {/* Top-Left Dynamic Badge */}
                      {badgeText && (
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-bold tracking-wide bg-[#e8703b] text-white shadow-2xs">
                            {badgeText}
                          </span>
                        </div>
                      )}

                      {/* Top-Right Heart Icon */}
                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(pid, e)}
                        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors shadow-2xs cursor-pointer"
                        aria-label="Add to wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-colors ${
                            isWishlisted ? "fill-red-500 text-red-500" : "stroke-[1.8]"
                          }`}
                        />
                      </button>

                      {/* Dynamic Product Image */}
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={dynamicImage}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-106"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = ph;
                          }}
                        />
                      </div>
                    </div>

                    {/* 2. Text Details */}
                    <div className="flex flex-col flex-grow">
                      {/* Collection Title */}
                      <h3
                        onClick={() => navigate(`/product/${pid}`)}
                        className="font-semibold text-gray-900 text-[13.5px] sm:text-[14px] leading-tight truncate cursor-pointer group-hover:text-[#e8703b] transition-colors"
                        title={item.name}
                      >
                        {item.name}
                      </h3>

                      {/* Tamil Name Subtitle */}
                      <p className="text-[11px] text-amber-800/80 font-medium truncate mt-0.5">
                        {tamilName}
                      </p>

                      {/* Price Row: Bold Price + Strikethrough MRP */}
                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className="font-bold text-gray-900 text-sm sm:text-[15px]">
                          ₹{price}
                        </span>
                        {mrp > price && (
                          <span className="text-[11px] text-gray-400 line-through font-normal">
                            ₹{mrp}
                          </span>
                        )}
                        {mrp > price && (
                          <span className="text-[10px] font-bold text-emerald-600 ml-auto">
                            {Math.round(((mrp - price) / mrp) * 100)}% off
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
                          (4.8)
                        </span>
                      </div>

                      {/* Action Button: Add to Cart or Notify Me */}
                      {isOutOfStock ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotifyProduct(item);
                          }}
                          className="w-full mt-3 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Bell className="w-3.5 h-3.5 stroke-[1.9]" />
                          <span>Notify Me</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          className="w-full mt-3 py-2 px-3 rounded-lg bg-[#e8703b] hover:bg-[#d45f2a] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 stroke-[1.9]" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Back In Stock Notify Modal */}
      <NotifyMeModal
        isOpen={!!notifyProduct}
        onClose={() => setNotifyProduct(null)}
        product={notifyProduct}
      />
    </section>
  );
};

export default FeaturedCollections;