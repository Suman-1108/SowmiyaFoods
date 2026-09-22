import React, { useState, useRef, useCallback, useEffect } from "react";
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, ArrowRight, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ph from "../../assets/image.png";
import { useHomeProducts } from "../../hooks/useProducts";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import NotifyMeModal from "../products/NotifyMeModal";

// Tamil name mapping for categories
const categoryTamilNames = {
  "Millet": "சிறுதானியம்",
  "Instant Products": "உடனடி பொருட்கள்",
  "Noodles": "நூடுல்ஸ்",
  "Semiya": "சேமியா",
  "Flour Items": "மாவு வகைகள்",
  "Rava Sooji": "ரவை & சூஜி",
  "Pickles": "ஊறுகாய்",
  "Thokku": "தொக்கு",
  "Traditional Mix": "பாரம்பரிய மிக்ஸ்",
  "Appalam": "அப்பளம்",
  // Legacy mappings
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

// Tamil slogan mapping by product name keywords
const getTamilSlogan = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('millet') || lower.includes('ragi') || lower.includes('bajra') || lower.includes('kambu')) return "சத்தான சிறுதானியம்";
  if (lower.includes('noodles')) return "ருசியான நொடிப்பொழுதில்";
  if (lower.includes('vermicelli') || lower.includes('semiya')) return "மென்மையான சேமியா";
  if (lower.includes('atta') || lower.includes('wheat') || lower.includes('maida')) return "மென்மையானது, மிருதுவானது";
  if (lower.includes('sooji') || lower.includes('rava')) return "சூப்பர் ரவை";
  if (lower.includes('rice flour')) return "தூய அரிசி மாவு";
  if (lower.includes('gram flour') || lower.includes('kadalai')) return "உயர் தர கடலை மாவு";
  if (lower.includes('idli podi') || lower.includes('idly podi')) return "சுவையான இட்லிக்கு";
  if (lower.includes('ellu podi')) return "எள்ளின் சுவையுடன்";
  if (lower.includes('puliyotharai')) return "பாரம்பரிய சுவையில் புளியோதரை";
  if (lower.includes('ulundhankali') || lower.includes('ulunthankali')) return "உடலுக்கு உறுதி";
  if (lower.includes('puttu')) return "சிறுதானிய சத்து";
  if (lower.includes('idiappam') || lower.includes('idiappa')) return "மென்மையான இடியாப்பம்";
  if (lower.includes('murukku')) return "மொறுமொறுப்பான முறுக்கு";
  if (lower.includes('bajji') || lower.includes('bonda')) return "மொறுமொறுப்பான பஜ்ஜிக்கு";
  if (lower.includes('parotta')) return "மென்மையான பரோட்டா";
  if (lower.includes('kozhukattai')) return "பாரம்பரிய கொழுக்கட்டை";
  if (lower.includes('dosa') || lower.includes('adai')) return "சுவையான தோசை";
  if (lower.includes('corn')) return "சத்தான சோள மாவு";
  return "ராமர் தரம்";
};

// Get Tamil name for a product
const getTamilName = (name, category) => {
  const lower = name.toLowerCase();
  if (lower.includes('millet') && lower.includes('noodles')) return "சிறுதானிய நூடுல்ஸ்";
  if (lower.includes('millet') && lower.includes('vermicelli')) return "சிறுதானிய சேமியா";
  if (lower.includes('millet') && (lower.includes('puttu') || lower.includes('dosa'))) return "சிறுதானிய மாவு";
  if (lower.includes('ragi') && lower.includes('vermicelli')) return "ராகி சேமியா";
  if (lower.includes('ragi') && lower.includes('flour')) return "ராகி மாவு";
  if (lower.includes('bajra') && lower.includes('flour')) return "கம்பு மாவு";
  if (lower.includes('vermicelli')) return "சேமியா";
  if (lower.includes('noodles')) return "நூடுல்ஸ்";
  if (lower.includes('atta') || lower.includes('wheat')) return "கோதுமை மாவு";
  if (lower.includes('maida')) return "மைதா";
  if (lower.includes('sooji') || lower.includes('rava')) return "ரவை";
  if (lower.includes('rice flour')) return "அரிசி மாவு";
  if (lower.includes('gram flour')) return "கடலை மாவு";
  if (lower.includes('idli podi') || lower.includes('idly podi')) return "இட்லி பொடி";
  if (lower.includes('ellu podi')) return "எள்ளு இட்லி பொடி";
  if (lower.includes('puliyotharai')) return "புளியோதரை மிக்ஸ்";
  if (lower.includes('ulundhankali') || lower.includes('ulunthankali')) return "உடலுக்கு உறுதி";
  if (lower.includes('puttu')) return "புட்டு பொடி";
  if (lower.includes('idiappam') || lower.includes('idiappa')) return "இடியாப்ப மாவு";
  if (lower.includes('murukku')) return "முறுக்கு மாவு";
  if (lower.includes('bajji') || lower.includes('bonda')) return "பஜ்ஜி போண்டா மிக்ஸ்";
  if (lower.includes('parotta')) return "பரோட்டா மாவு";
  if (lower.includes('kozhukattai')) return "கொழுக்கட்டை மாவு";
  if (lower.includes('dosa') || lower.includes('adai')) return "தோசை மாவு";
  if (lower.includes('corn')) return "சோள மாவு";
  if (lower.includes('samba') && lower.includes('wheat')) return "சம்பா கோதுமை ரவை";
  if (lower.includes('sivappu') || lower.includes('kavuni')) return "சிவப்பு கவுனி மாவு";
  if (lower.includes('broken')) return "சம்பா கொத்திக்குருணை";
  return categoryTamilNames[category] || category;
};

const TrendingProducts = () => {
  const scrollRef = useRef(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);
  const [wishlist, setWishlist] = useState({});
  const [notifyProduct, setNotifyProduct] = useState(null);

  const { data, isLoading, error } = useHomeProducts();
  const products = data?.trendingProducts || [];

  const processedProducts = products.map(product => ({
    ...product,
    tamilName: getTamilName(product.name, product.category),
    tamilSlogan: getTamilSlogan(product.name),
  }));

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    setWishlist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        toast.success("Added to wishlist", { id: `wish-${id}`, duration: 1500 });
      }
      return next;
    });
  };

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
    const scrollAmount = 300;
    if (Math.abs(diff) > threshold) {
      scrollRef.current.scrollBy({
        left: diff > 0 ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    const startX = e.pageX;
    const scrollLeft = scrollRef.current.scrollLeft;
    let dragged = false;

    const handleMouseMove = (e) => {
      const x = e.pageX;
      const walk = (startX - x) * 2;
      scrollRef.current.scrollLeft = scrollLeft + walk;
      if (Math.abs(startX - x) > 5) dragged = true;
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

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (isLoading)
    return <p className="text-center mt-10 text-gray-500">Loading products...</p>;
  if (error)
    return (
      <p className="text-center mt-10 text-red-500">{error.message || "Failed to fetch products"}</p>
    );

  return (
    <section className="py-12 bg-white relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 pb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Trending Products
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/products")}
              className="text-xs sm:text-sm font-medium text-[#e8703b] hover:text-[#d45f2a] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {/* Carousel Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-1 ml-2">
              <button
                onClick={scrollLeft}
                className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollRight}
                className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 px-1 cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            {processedProducts.map((product, pIdx) => {
              const price = Number(product.price) || 0;
              const mrp = Math.round(price * 1.3) || price + 35;
              const isWishlisted = !!wishlist[product._id];
              const reviewCount = 70 + ((pIdx * 29) % 80);

              // Distinct badges matching reference image
              const isOutOfStock =
                product.inStock === false ||
                (product.stock !== undefined && Number(product.stock) <= 0);

              let badge = null;
              if (isOutOfStock) {
                badge = { text: "Out of Stock", bg: "bg-rose-600 text-white font-bold" };
              } else {
                badge = { text: "New", bg: "bg-[#e8703b] text-white" };
              }

              return (
                <div
                  key={product._id}
                  className="flex-shrink-0 w-[205px] sm:w-[220px] md:w-[235px] snap-start group flex flex-col"
                >
                  <div className="bg-white rounded-2xl border border-gray-200/85 hover:border-gray-300 shadow-xs hover:shadow-md transition-all duration-300 p-3 sm:p-3.5 flex flex-col justify-between h-full">
                    {/* 1. Square Image Container */}
                    <div
                      className="relative w-full aspect-square bg-[#F7F7F7] rounded-xl overflow-hidden mb-3 flex items-center justify-center p-3 cursor-pointer"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      {/* Top-Left Badge */}
                      {badge && (
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wide ${badge.bg}`}>
                            {badge.text}
                          </span>
                        </div>
                      )}

                      {/* Top-Right Heart Icon */}
                      <button
                        onClick={(e) => toggleWishlist(product._id, e)}
                        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors shadow-2xs"
                        aria-label="Add to wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-colors ${
                            isWishlisted ? "fill-red-500 text-red-500" : "stroke-[1.8]"
                          }`}
                        />
                      </button>

                      {/* Product Image */}
                      <img
                        src={product.image || ph}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-106 transition-transform duration-300"
                      />
                    </div>

                    {/* 2. Text Details */}
                    <div className="flex flex-col flex-grow">
                      {/* Product Title */}
                      <h3
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="font-semibold text-gray-900 text-[13.5px] sm:text-[14px] leading-tight truncate cursor-pointer group-hover:text-[#e8703b] transition-colors"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Tamil Name Subtitle */}
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {product.tamilName}
                      </p>

                      {/* Price Row (Hidden when Out of Stock) */}
                      {isOutOfStock ? (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Out of Stock
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="font-bold text-gray-900 text-sm sm:text-[15px]">
                            ₹{price}
                          </span>
                          {mrp > price && (
                            <span className="text-[11px] text-gray-400 line-through font-normal">
                              ₹{mrp}
                            </span>
                          )}
                        </div>
                      )}

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
                          ({reviewCount})
                        </span>
                      </div>

                      {/* Button: Notify Me when out of stock or Add to Cart when available */}
                      {isOutOfStock ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotifyProduct(product);
                          }}
                          className="w-full mt-3 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>Notify Me</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                            toast.success(`Added ${product.name} to cart`, { duration: 1500 });
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
        </div>
      </div>

      {/* Back in stock notification modal */}
      <NotifyMeModal
        isOpen={!!notifyProduct}
        onClose={() => setNotifyProduct(null)}
        product={notifyProduct}
      />
    </section>
  );
};

export default TrendingProducts;