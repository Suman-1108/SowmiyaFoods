import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart, Zap, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ph from '../../assets/image.png';
import axiosInstance from '../../api/axiosInstance';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import NotifyMeModal from '../products/NotifyMeModal';

// High resolution local product images
import attaImg from '../../assets/Atta_1.png';
import noodlesImg from '../../assets/noodles_1.png';
import vermicelliImg from '../../assets/vermicelli.jpeg';
import ravaImg from '../../assets/rava_1.png';
import cutMangoImg from '../../assets/CutMango_1.png';
import puliyotharaiImg from '../../assets/Ramar Puliyotharai Mix_DZN-2205_100g_11x14.5x6cm 02-02.jpg.jpeg';
import idlyPodiImg from '../../assets/Ramar Idly Podi_DZN-2203_100g 03-02.jpg.jpeg';
import elluPodiImg from '../../assets/Ramar Ellu Idly Podi_DZN-2204_100g_11x14.5x6cm 03-02.jpg.jpeg';
import ulundhankaliImg from '../../assets/Ramar Ulunthankali Mix_DZN-2783_250g_145x190x90mm_10-02.jpg.jpeg';
import kambuImg from '../../assets/Ramar Kambu Maavu 500g.jpg.jpeg';
import maidaImg from '../../assets/Ramar Maida Pouch_DZN-1114_500g_350x240mm_7.jpg.jpeg';
import puttuImg from '../../assets/Ramar Millet Puttu Podi_DZN-2782_250g_145x190x90mm 05-02.jpg.jpeg';
import bajjiImg from '../../assets/Ramar Bajji Bonda.jpg.jpeg';
import murukkuImg from '../../assets/Ramar_muruku.png';
import poppetsImg from '../../assets/poppets.jpg';
import milletPodiImg from '../../assets/milletpodi_1.png';
import onionImg from '../../assets/onion.png';

// Canonical 10-Category Ordering requested by client
export const CANONICAL_CATEGORIES = [
  "Millet",
  "Instant Products",
  "Noodles",
  "Semiya",
  "Flour Items",
  "Rava Sooji",
  "Pickles",
  "Thokku",
  "Traditional Mix",
  "Appalam",
];

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
  // Legacy mappings for backward compatibility
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

// Normalize any category string or product name into one of the 10 canonical categories
export const normalizeCategory = (category, productName = "") => {
  const cat = (category || "").trim();
  const name = (productName || "").trim().toLowerCase();

  // Explicit category matching
  if (/^millet/i.test(cat) || cat.toUpperCase() === "MILLETS" || cat.toUpperCase() === "MILLET PRODUCTS") {
    if (name.includes("noodle")) return "Noodles";
    if (name.includes("semiya") || name.includes("vermicelli")) return "Semiya";
    return "Millet";
  }

  if (/^instant/i.test(cat)) return "Instant Products";
  if (/^noodle/i.test(cat)) return "Noodles";
  if (/^semiya/i.test(cat) || /^vermicelli/i.test(cat) || /^semia/i.test(cat)) return "Semiya";
  if (/^flour/i.test(cat) || /^maida/i.test(cat) || /^atta/i.test(cat)) return "Flour Items";
  if (/^rava/i.test(cat) || /^sooji/i.test(cat)) return "Rava Sooji";
  if (/^pickle/i.test(cat)) return "Pickles";
  if (/^thokku/i.test(cat)) return "Thokku";
  if (/^traditional/i.test(cat) || /^spices/i.test(cat) || /^podi/i.test(cat)) return "Traditional Mix";
  if (/^appalam/i.test(cat) || /^puppet/i.test(cat) || /^papad/i.test(cat)) return "Appalam";

  // Match by product name if category is generic
  if (name.includes("pickle") || name.includes("oorugai")) return "Pickles";
  if (name.includes("thokku")) return "Thokku";
  if (name.includes("appalam") || name.includes("papad") || name.includes("vadam")) return "Appalam";
  if (name.includes("noodle")) return "Noodles";
  if (name.includes("semiya") || name.includes("vermicelli") || name.includes("semia")) return "Semiya";
  if (name.includes("flour") || name.includes("atta") || name.includes("maida")) return "Flour Items";
  if (name.includes("rava") || name.includes("sooji") || name.includes("kurunai")) return "Rava Sooji";
  if (name.includes("puliyotharai") || name.includes("podi") || name.includes("kali")) return "Traditional Mix";
  if (name.includes("millet") || name.includes("ragi") || name.includes("kambu") || name.includes("bajra")) return "Millet";
  if (name.includes("parotta") || name.includes("instant") || name.includes("dosa mix") || name.includes("adai")) return "Instant Products";

  return "Flour Items";
};

// Check if packaging is Bottle or Pack
export const isBottlePresentation = (product) => {
  if (product.packagingType === "bottle" || product.packaging === "bottle") return true;
  if (product.packagingType === "pack" || product.packaging === "pack" || product.packaging === "pouch") return false;
  const name = (product.name || "").toLowerCase();
  if (name.includes("bottle") || name.includes("jar")) return true;
  if (name.includes("pack") || name.includes("pouch")) return false;
  return true; // Default to bottle for pickles/thokku if unspecified
};

export const isPackPresentation = (product) => {
  if (product.packagingType === "pack" || product.packaging === "pack" || product.packaging === "pouch") return true;
  const name = (product.name || "").toLowerCase();
  return name.includes("pack") || name.includes("pouch");
};

// Tamil slogan mapping by product name keywords
const getTamilSlogan = (name, category) => {
  const lower = (name || "").toLowerCase();
  const lowerCat = (category || "").toLowerCase();

  if (lower.includes("pickle") || lowerCat.includes("pickle")) {
    return "பாரம்பரிய கைவண்ணத்தில் - சுவையான ஊறுகாய்";
  }
  if (lower.includes("thokku") || lowerCat.includes("thokku")) {
    return "நாவில் ஊறும் சுவை - ராமர் ஸ்பெஷல் தொக்கு";
  }
  if (lower.includes("appalam") || lower.includes("papad") || lowerCat.includes("appalam")) {
    return "மொறுமொறுப்பான சுவை - பாரம்பரிய அப்பளம்";
  }
  if (lower.includes("millet") || lower.includes("ragi") || lower.includes("bajra") || lower.includes("kambu") || lowerCat.includes("millet")) {
    return "சத்தான சிறுதானியம் - ஆரோக்கியத்திற்கு நல்லது";
  }
  if (lower.includes("noodles") || lowerCat.includes("noodles")) {
    return "ருசியான நொடிப்பொழுதில் - ராமர் நூடுல்ஸ்";
  }
  if (lower.includes("vermicelli") || lower.includes("semiya") || lowerCat.includes("semiya")) {
    return "மென்மையான சேமியா - சுவையான உணவு";
  }
  if (lower.includes("atta") || lower.includes("wheat") || lower.includes("maida") || lowerCat.includes("flour")) {
    return "மென்மையானது, மிருதுவானது - ராமர் மாவு";
  }
  if (lower.includes("sooji") || lower.includes("rava") || lowerCat.includes("rava")) {
    return "சூப்பர் ரவை - சுவையான உப்மா";
  }
  if (lower.includes("puliyotharai") || lower.includes("idli podi") || lower.includes("podi") || lowerCat.includes("traditional")) {
    return "பாரம்பரிய சுவையில் ராமர் ஸ்பெஷல் மிக்ஸ்";
  }
  return "ராமர் தரம் - சுவையும் ஆரோக்கியமும்";
};

// Get Tamil name for a product
const getTamilName = (name, category) => {
  const lower = (name || "").toLowerCase();

  if (lower.includes("thokku")) {
    if (lower.includes("tomato") || lower.includes("thakkali")) return "தக்காளி தொக்கு";
    if (lower.includes("garlic") || lower.includes("poondu")) return "பூண்டு தொக்கு";
    if (lower.includes("onion") || lower.includes("vengayam")) return "வெங்காய தொக்கு";
    return "சுவையான தொக்கு";
  }
  if (lower.includes("pickle") || lower.includes("oorugai")) {
    if (lower.includes("mango") || lower.includes("maangai")) return "மாங்காய் ஊறுகாய்";
    if (lower.includes("lemon") || lower.includes("elamichai") || lower.includes("lime")) return "எலுமிச்சை ஊறுகாய்";
    if (lower.includes("garlic") || lower.includes("poondu")) return "பூண்டு ஊறுகாய்";
    if (lower.includes("citron") || lower.includes("narthangai")) return "நார்த்தங்காய் ஊறுகாய்";
    if (lower.includes("mixed")) return "கலவை ஊறுகாய்";
    return "பாரம்பரிய ஊறுகாய்";
  }
  if (lower.includes("appalam") || lower.includes("papad") || lower.includes("vadam")) {
    if (lower.includes("pepper") || lower.includes("milagu")) return "மிளகு அப்பளம்";
    if (lower.includes("jeera") || lower.includes("seeragam")) return "சீரக அப்பளம்";
    if (lower.includes("garlic")) return "பூண்டு அப்பளம்";
    if (lower.includes("rice") || lower.includes("vadam")) return "அரிசி அப்பளம்";
    return "பாரம்பரிய அப்பளம்";
  }

  if (lower.includes("millet") && lower.includes("noodles")) return "சிறுதானிய நூடுல்ஸ்";
  if (lower.includes("ragi") && lower.includes("noodles")) return "ராகி நூடுல்ஸ்";
  if (lower.includes("kambu") && lower.includes("noodles")) return "கம்பு நூடுல்ஸ்";
  if (lower.includes("varagu") && lower.includes("noodles")) return "வரகு நூடுல்ஸ்";
  if (lower.includes("thinai") && lower.includes("noodles")) return "தினை நூடுல்ஸ்";
  if (lower.includes("millet") && lower.includes("vermicelli")) return "சிறுதானிய சேமியா";
  if (lower.includes("millet") && (lower.includes("puttu") || lower.includes("dosa"))) return "சிறுதானிய மாவு";
  if (lower.includes("ragi") && (lower.includes("vermicelli") || lower.includes("semiya"))) return "ராகி சேமியா";
  if (lower.includes("ragi") && lower.includes("flour")) return "ராகி மாவு";
  if (lower.includes("bajra") && lower.includes("flour")) return "கம்பு மாவு";
  if (lower.includes("regular semiya") || lower.includes("vermicelli") || lower.includes("semiya")) return "சேமியா";
  if (lower.includes("noodles")) return "நூடுல்ஸ்";
  if (lower.includes("atta") || lower.includes("wheat")) return "கோதுமை மாவு";
  if (lower.includes("maida")) return "மைதா";
  if (lower.includes("sooji") || lower.includes("rava")) return "ரவை";
  if (lower.includes("rice flour")) return "அரிசி மாவு";
  if (lower.includes("gram flour")) return "கடலை மாவு";
  if (lower.includes("idli podi") || lower.includes("idly podi")) return "இட்லி பொடி";
  if (lower.includes("ellu podi")) return "எள்ளு இட்லி பொடி";
  if (lower.includes("puliyotharai")) return "புளியோதரை மிக்ஸ்";
  if (lower.includes("ulundhankali") || lower.includes("ulunthankali")) return "உளுந்தங்களி மிக்ஸ்";
  if (lower.includes("puttu")) return "புட்டு பொடி";
  if (lower.includes("idiappam") || lower.includes("idiappa")) return "இடியாப்ப மாவு";
  if (lower.includes("murukku")) return "முறுக்கு மாவு";
  if (lower.includes("bajji") || lower.includes("bonda")) return "பஜ்ஜி போண்டா மிக்ஸ்";
  if (lower.includes("parotta")) return "பரோட்டா மாவு";
  if (lower.includes("kozhukattai")) return "கொழுக்கட்டை மாவு";
  if (lower.includes("dosa") || lower.includes("adai")) return "தோசை மிக்ஸ்";
  if (lower.includes("corn")) return "சோள மாவு";
  if (lower.includes("samba") && lower.includes("wheat")) return "சம்பா கோதுமை ரவை";
  if (lower.includes("sivappu") || lower.includes("kavuni")) return "சிவப்பு கவுனி மாவு";
  if (lower.includes("broken")) return "சம்பா கொத்திக்குருணை";
  
  // Fallback to category mapping
  return categoryTamilNames[category] || category;
};

// Keywords to identify millet-based products
const milletKeywords = ['millet', 'ragi', 'bajra', 'kambu', 'varagu', 'samai', 'kuthiraivali'];

const isMilletProduct = (product) => {
  const lowerName = product.name.toLowerCase();
  const lowerCategory = (product.category || '').toLowerCase();
  return milletKeywords.some(keyword => lowerName.includes(keyword) || lowerCategory.includes(keyword));
};

// =========================================================================
// Category Carousel Section with Flipkart-style card, dots & 3-4 cards/row
// =========================================================================
const CategoryCarouselSection = ({
  category,
  categoryProducts,
  getCategoryDisplayName,
  navigate,
  addToCart,
  openZoom,
}) => {
  const scrollRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [notifyProduct, setNotifyProduct] = useState(null);

  const totalCards = categoryProducts.length;
  // Calculate total pages for dots: max 4 cards visible per page on desktop
  const totalDots = Math.max(1, Math.min(6, Math.ceil(totalCards / 4)));

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;

    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < maxScroll - 15);

    if (maxScroll > 0 && totalDots > 1) {
      const progress = scrollLeft / maxScroll;
      const dotIndex = Math.min(
        totalDots - 1,
        Math.max(0, Math.round(progress * (totalDots - 1)))
      );
      setActiveDot(dotIndex);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [categoryProducts.length, totalDots]);

  const scrollToDot = (index) => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    const targetScroll = (index / (totalDots - 1)) * maxScroll;
    scrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
    setActiveDot(index);
  };

  const scrollByDirection = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount =
      direction === "left"
        ? -scrollRef.current.clientWidth * 0.8
        : scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const sectionId = `category-section-${category.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

  return (
    <div
      id={sectionId}
      data-category-name={category}
      className="category-section scroll-mt-28 relative"
    >
      {/* Category Heading */}
      <div className="mb-6 text-center">
        <h3 className="text-[#3E2723] text-2xl sm:text-3xl md:text-4xl font-bold italic mb-2">
          {getCategoryDisplayName(category)}
        </h3>
        <div className="flex items-center justify-center gap-3">
          <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-[#5D4037]/40"></div>
          <div className="w-2 h-2 bg-[#5D4037]/60 rotate-45"></div>
          <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-[#5D4037]/40"></div>
        </div>
      </div>

      {/* Category Carousel Container */}
      <div className="relative group/carousel px-1 sm:px-3">
        {/* Left Arrow (Desktop) */}
        {canScrollLeft && (
          <button
            onClick={() => scrollByDirection("left")}
            aria-label="Previous products"
            className="hidden md:flex absolute -left-3 lg:-left-5 top-1/2 -translate-y-12 z-20 w-10 h-10 items-center justify-center bg-white/95 hover:bg-white text-gray-800 hover:text-[#E05A1B] rounded-full shadow-lg border border-gray-200 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Arrow (Desktop) */}
        {canScrollRight && (
          <button
            onClick={() => scrollByDirection("right")}
            aria-label="Next products"
            className="hidden md:flex absolute -right-3 lg:-right-5 top-1/2 -translate-y-12 z-20 w-10 h-10 items-center justify-center bg-white/95 hover:bg-white text-gray-800 hover:text-[#E05A1B] rounded-full shadow-lg border border-gray-200 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Horizontal Cards Row: exactly 3 or 4 cards per row on desktop */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="category-carousel flex gap-3.5 sm:gap-4 md:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 px-1 cursor-grab active:cursor-grabbing"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {categoryProducts.map((product, pIdx) => {
            const price = Number(product.price) || 0;
            const mrp = Math.round(price * 1.32) || price + 40;
            const discount = Math.round(((mrp - price) / mrp) * 100);
            const rating = (4.2 + ((pIdx * 3) % 7) / 10).toFixed(1);
            const isOutOfStock =
              product.inStock === false ||
              (product.stock !== undefined && Number(product.stock) <= 0);

            const isPicklesOrThokku = category === "Pickles" || category === "Thokku";
            const isBottle = isBottlePresentation(product);
            const isPack = isPackPresentation(product);

            // For Pack presentation in Pickles or Thokku, weight should NOT be mentioned/displayed!
            let displayTitle = product.name;
            if (isPicklesOrThokku && isPack) {
              displayTitle = displayTitle
                .replace(/\b\d+\.?\d*\s*(g|kg|gm|grams|ml|l)\b/gi, "")
                .replace(/\s*-\s*$/, "")
                .replace(/\(\s*\)/, "")
                .trim();
            }

            return (
              <div
                key={product._id || product.name}
                onClick={() => navigate(product._id && !product._id.includes("-") ? `/product/${product._id}` : `/products`)}
                className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-12px)] lg:w-[calc(25%-15px)] snap-start cursor-pointer group flex flex-col"
              >
                {/* 1. Flipkart-Style Solid Grey Image Box with Rating Badge */}
                <div className="relative w-full aspect-square bg-[#F2F3F5] rounded-2xl overflow-hidden p-3 sm:p-5 flex items-center justify-center border border-gray-200/50 shadow-xs group-hover:shadow-md transition-all duration-300">
                  {/* Packaging Presentation Badge for Pickles & Thokku */}
                  {isPicklesOrThokku && (
                    <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10">
                      {isBottle ? (
                        <span className="text-[10px] sm:text-[11px] font-bold text-amber-900 bg-amber-100/95 backdrop-blur-xs px-2 py-0.5 rounded-md border border-amber-300/80 shadow-xs">
                          Bottle
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-[11px] font-bold text-orange-900 bg-orange-100/95 backdrop-blur-xs px-2 py-0.5 rounded-md border border-orange-300/80 shadow-xs">
                          Pack
                        </span>
                      )}
                    </div>
                  )}

                  {/* Product Image */}
                  <img
                    src={product.image || ph}
                    alt={displayTitle}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-106 transition-transform duration-300"
                  />

                  {/* Rating Badge at bottom-left corner */}
                  <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 bg-white/95 backdrop-blur-xs px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs border border-gray-200/80 flex items-center gap-1 text-[10.5px] sm:text-[11px] font-bold text-gray-800 z-10">
                    <span>{rating}</span>
                    <span className="text-emerald-600 text-xs">★</span>
                  </div>

                  {/* Zoom Preview Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openZoom({ ...product, name: displayTitle });
                    }}
                    className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-xs border border-gray-200/70 flex items-center justify-center text-gray-600 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    title="Zoom preview"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                      <path d="M11 8v6" />
                      <path d="M8 11h6" />
                    </svg>
                  </button>
                </div>

                {/* 2. Text Content Below Image */}
                <div className="mt-2 sm:mt-2.5 flex flex-col flex-grow">
                  {/* Product Title */}
                  <h4 className="text-[13px] sm:text-[14.5px] font-semibold text-gray-900 truncate group-hover:text-[#E05A1B] transition-colors leading-snug">
                    {displayTitle}
                  </h4>

                  {/* Tamil Subtitle */}
                  {product.tamilName && (
                    <p className="text-[11px] sm:text-[11.5px] text-amber-800/85 font-medium truncate mt-0.5">
                      {product.tamilName}
                    </p>
                  )}

                  {/* Price Row: Strikethrough MRP + Bold Selling Price (Hidden when Out of Stock) */}
                  {isOutOfStock ? (
                    <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Out of Stock
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5 mt-1 sm:mt-1.5">
                      <span className="text-[11px] sm:text-xs text-gray-400 line-through font-normal">
                        ₹{mrp}
                      </span>
                      <span className="text-[14px] sm:text-[16px] font-bold text-gray-900">
                        ₹{price}
                      </span>
                      {discount > 0 && (
                        <span className="text-[10.5px] sm:text-[11px] font-semibold text-emerald-600 ml-auto">
                          {discount}% off
                        </span>
                      )}
                    </div>
                  )}

                  {/* Button: Notify Me when out of stock or Add To Cart */}
                  {isOutOfStock ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotifyProduct(product);
                      }}
                      className="mt-2 sm:mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Notify Me</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="mt-2 sm:mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-50/90 hover:bg-[#E05A1B] text-[#E05A1B] hover:text-white text-xs font-bold transition-all duration-200 border border-amber-200/70 hover:border-transparent cursor-pointer shadow-xs"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Dots Under Every Category */}
        {totalDots > 1 && (
          <div className="flex items-center justify-center gap-2 mt-5">
            {Array.from({ length: totalDots }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToDot(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeDot === idx
                    ? "w-6 h-2 bg-[#E05A1B] shadow-xs"
                    : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Back in stock alert modal */}
      <NotifyMeModal
        isOpen={!!notifyProduct}
        onClose={() => setNotifyProduct(null)}
        product={notifyProduct}
      />
    </div>
  );
};

const ProductRangeCarousel = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedProducts, setGroupedProducts] = useState({});
  const scrollContainerRef = useRef(null);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);
  const [zoomedImage, setZoomedImage] = useState(null);
  const zoomRef = useRef(null);

  // Comprehensive catalog dataset including all client requested additions
  const DEFAULT_PRODUCTS = [
    // 1. Millet
    {
      _id: "millet-1",
      name: "Kambu (Bajra) Flour 500g",
      category: "Millet",
      price: 40,
      image: kambuImg,
      description: "Nutritious stone-ground pearl millet flour rich in iron.",
    },
    {
      _id: "millet-2",
      name: "Ragi Flour 500g",
      category: "Millet",
      price: 35,
      image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/ragi-flour_mi8rqx.png",
      description: "Fiber-rich finger millet flour for healthy dosas and rotis.",
    },
    {
      _id: "millet-3",
      name: "Millet Puttu Podi 250g",
      category: "Millet",
      price: 55,
      image: puttuImg,
      description: "Authentic steamed millet puttu mix rich in wholesome grains.",
    },
    {
      _id: "millet-4",
      name: "Millet Idly Dosa Mix 500g",
      category: "Millet",
      price: 65,
      image: milletPodiImg,
      description: "Traditional fermented millet batter mix for crispy dosas.",
    },

    // 2. Instant Products
    {
      _id: "instant-1",
      name: "Instant Parotta 200g",
      category: "Instant Products",
      price: 30,
      image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272318/instant-parotta_lhleky.png",
      description: "Ready-to-cook layered flaky parotta.",
    },
    {
      _id: "instant-2",
      name: "Adai Dosa Mix 500g",
      category: "Instant Products",
      price: 85,
      image: ph,
      description: "Protein-rich multi-dal adai batter mix.",
    },
    {
      _id: "instant-3",
      name: "Rava Dosa Mix 500g",
      category: "Instant Products",
      price: 70,
      image: ravaImg,
      description: "Crispy hotel-style instant rava dosa mix.",
    },
    {
      _id: "instant-4",
      name: "Instant Puttu Mix 500g",
      category: "Instant Products",
      price: 60,
      image: puttuImg,
      description: "Quick aromatic rice and grain puttu blend.",
    },

    // 3. Noodles (Req 2: Noodles – 100g, Noodles – 200g, Millet Noodles – 4 products)
    {
      _id: "noodle-1",
      name: "Noodles – 100g",
      category: "Noodles",
      price: 14,
      image: noodlesImg,
      description: "Classic Ramar instant noodles with delicious tastemaker spice blend.",
    },
    {
      _id: "noodle-2",
      name: "Noodles – 200g",
      category: "Noodles",
      price: 28,
      image: noodlesImg,
      description: "Family pack Ramar noodles with authentic aromatic spices.",
    },
    {
      _id: "noodle-3",
      name: "Ragi Millet Noodles 200g",
      category: "Noodles",
      price: 55,
      image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png",
      description: "Health-focused finger millet noodles with natural seasoning.",
    },
    {
      _id: "noodle-4",
      name: "Kambu Millet Noodles 200g",
      category: "Noodles",
      price: 55,
      image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png",
      description: "High energy pearl millet noodles made without refined flour.",
    },
    {
      _id: "noodle-5",
      name: "Varagu Millet Noodles 200g",
      category: "Noodles",
      price: 58,
      image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png",
      description: "Kodo millet noodles rich in dietary fiber and nutrients.",
    },
    {
      _id: "noodle-6",
      name: "Thinai Millet Noodles 200g",
      category: "Noodles",
      price: 58,
      image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png",
      description: "Foxtail millet noodles packed with essential minerals.",
    },

    // 4. Semiya (Req 3: Ragi Semiya – 200g, Regular Semiya – 200g, Semia – 500g)
    {
      _id: "semiya-1",
      name: "Regular Semiya – 200g",
      category: "Semiya",
      price: 25,
      image: vermicelliImg,
      description: "Traditional roasted wheat vermicelli for savory upma and sweet payasam.",
    },
    {
      _id: "semiya-2",
      name: "Semia – 500g",
      category: "Semiya",
      price: 58,
      image: vermicelliImg,
      description: "Long roasted vermicelli strands for festival desserts and breakfast.",
    },
    {
      _id: "semiya-3",
      name: "Ragi Semiya – 200g",
      category: "Semiya",
      price: 32,
      image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272313/ragi-vermicelli_gvvkfj.png",
      description: "Nutritious finger millet vermicelli for healthy morning meals.",
    },

    // 5. Flour Items (Req 4: Flour Items)
    {
      _id: "flour-1",
      name: "Chakki Atta 500g",
      category: "Flour Items",
      price: 32,
      image: attaImg,
      description: "100% whole wheat freshly ground chakki atta for soft rotis.",
    },
    {
      _id: "flour-2",
      name: "Chakki Atta 5kg",
      category: "Flour Items",
      price: 270,
      image: attaImg,
      description: "Premium large pack whole wheat chakki atta.",
    },
    {
      _id: "flour-3",
      name: "Maida 500g",
      category: "Flour Items",
      price: 35,
      image: maidaImg,
      description: "Superfine all-purpose flour for baking and traditional snacks.",
    },
    {
      _id: "flour-4",
      name: "Rice Flour 500g",
      category: "Flour Items",
      price: 30,
      image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/rice-flour_cj7msm.png",
      description: "Fine white rice flour ideal for idiappam, murukku, and sweets.",
    },
    {
      _id: "flour-5",
      name: "Gram Flour 500g",
      category: "Flour Items",
      price: 60,
      image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272311/gram-flour_yyeeec.png",
      description: "Pure chana dal besan flour for savory crispy snacks.",
    },
    {
      _id: "flour-6",
      name: "Murukku Flour 500g",
      category: "Flour Items",
      price: 60,
      image: murukkuImg,
      description: "Traditional savory snack flour blend for crispy festival murukku.",
    },
    {
      _id: "flour-7",
      name: "Bajji Bonda Mix 200g",
      category: "Flour Items",
      price: 30,
      image: bajjiImg,
      description: "Ready spiced batter mix for tea-time crispy bajjis and bondas.",
    },
    {
      _id: "flour-8",
      name: "Idiappa Flour 500g",
      category: "Flour Items",
      price: 50,
      image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg",
      description: "Finely steamed rice idiyappam flour for soft string hoppers.",
    },

    // 6. Rava Sooji
    {
      _id: "rava-1",
      name: "Roasted Sooji 250g",
      category: "Rava Sooji",
      price: 20,
      image: ravaImg,
      description: "Golden roasted semolina for quick lump-free upma and kesari.",
    },
    {
      _id: "rava-2",
      name: "Roasted Sooji 500g",
      category: "Rava Sooji",
      price: 36,
      image: ravaImg,
      description: "Premium roasted rava for fluffy breakfast delicacies.",
    },
    {
      _id: "rava-3",
      name: "Roasted Sooji 1kg",
      category: "Rava Sooji",
      price: 71,
      image: ravaImg,
      description: "Value family pack roasted semolina.",
    },
    {
      _id: "rava-4",
      name: "Broken Samba Wheat 500g",
      category: "Rava Sooji",
      price: 65,
      image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.24_7c543103_oj7kiz.jpg",
      description: "Wholesome broken samba wheat daliya for healthy meals.",
    },

    // 7. Pickles (Req 5: Bottle First, Pack Second - Pack weight NOT mentioned)
    {
      _id: "pickle-1",
      name: "Mango Pickle (Bottle) 300g",
      category: "Pickles",
      packagingType: "bottle",
      price: 75,
      image: cutMangoImg,
      description: "Handcrafted sour and spicy cut mango pickle preserved in premium gingelly oil.",
    },
    {
      _id: "pickle-2",
      name: "Mixed Veg Pickle (Bottle) 300g",
      category: "Pickles",
      packagingType: "bottle",
      price: 75,
      image: cutMangoImg,
      description: "Aromatic mixed vegetable pickle crafted with South Indian spices.",
    },
    {
      _id: "pickle-3",
      name: "Lime Pickle (Bottle) 300g",
      category: "Pickles",
      packagingType: "bottle",
      price: 70,
      image: cutMangoImg,
      description: "Tangy sun-matured lemon pickle with mustard and fenugreek.",
    },
    {
      _id: "pickle-4",
      name: "Mango Pickle (Pack)",
      category: "Pickles",
      packagingType: "pack",
      price: 45,
      image: cutMangoImg,
      description: "Convenient travel pouch of authentic spicy mango pickle.",
    },
    {
      _id: "pickle-5",
      name: "Mixed Veg Pickle (Pack)",
      category: "Pickles",
      packagingType: "pack",
      price: 45,
      image: cutMangoImg,
      description: "Heritage vegetable pickle in fresh sealed stay-fresh pack.",
    },
    {
      _id: "pickle-6",
      name: "Lime Pickle (Pack)",
      category: "Pickles",
      packagingType: "pack",
      price: 40,
      image: cutMangoImg,
      description: "Zesty lemon pickle packed in modern barrier pouch.",
    },

    // 8. Thokku (Req 6: Bottle First, Pack Second - Pack weight NOT mentioned)
    {
      _id: "thokku-1",
      name: "Tomato Thokku (Bottle) 300g",
      category: "Thokku",
      packagingType: "bottle",
      price: 85,
      image: cutMangoImg,
      description: "Slow-simmered ripe country tomatoes with spicy tempered seasoning in glass jar.",
    },
    {
      _id: "thokku-2",
      name: "Garlic Thokku (Bottle) 300g",
      category: "Thokku",
      packagingType: "bottle",
      price: 95,
      image: cutMangoImg,
      description: "Immunity-boosting whole garlic cloves simmered in gingelly oil.",
    },
    {
      _id: "thokku-3",
      name: "Onion Thokku (Bottle) 300g",
      category: "Thokku",
      packagingType: "bottle",
      price: 85,
      image: onionImg,
      description: "Caramelized shallot onion thokku perfect with idli and dosa.",
    },
    {
      _id: "thokku-4",
      name: "Tomato Thokku (Pack)",
      category: "Thokku",
      packagingType: "pack",
      price: 50,
      image: cutMangoImg,
      description: "Flavorful simmered tomato thokku in fresh airtight packaging.",
    },
    {
      _id: "thokku-5",
      name: "Garlic Thokku (Pack)",
      category: "Thokku",
      packagingType: "pack",
      price: 55,
      image: cutMangoImg,
      description: "Spicy pungent garlic thokku in protective pouch pack.",
    },
    {
      _id: "thokku-6",
      name: "Onion Thokku (Pack)",
      category: "Thokku",
      packagingType: "pack",
      price: 50,
      image: onionImg,
      description: "Tasty onion thokku in flexible convenient pack.",
    },

    // 9. Traditional Mix (Req 7: Puliyotharai Mix & Traditional Mixes)
    {
      _id: "trad-1",
      name: "Puliyotharai Mix 100g",
      category: "Traditional Mix",
      price: 45,
      image: puliyotharaiImg,
      description: "Temple style tamarind rice paste made with roasted spices and peanuts.",
    },
    {
      _id: "trad-2",
      name: "Traditional Idli Podi 100g",
      category: "Traditional Mix",
      price: 40,
      image: idlyPodiImg,
      description: "Spicy roasted lentils and red chili gun powder for hot idlis.",
    },
    {
      _id: "trad-3",
      name: "Ellu Idli Podi 100g",
      category: "Traditional Mix",
      price: 45,
      image: elluPodiImg,
      description: "Nutritious roasted sesame seed gunpowder with authentic aroma.",
    },
    {
      _id: "trad-4",
      name: "Ulundhankali Mix 250g",
      category: "Traditional Mix",
      price: 65,
      image: ulundhankaliImg,
      description: "Traditional roasted black gram strengthening mix for healthy kali.",
    },

    // 10. Appalam (Req 8: Appalam final category)
    {
      _id: "appalam-1",
      name: "Traditional Appalam 100g",
      category: "Appalam",
      price: 35,
      image: poppetsImg,
      description: "Crispy sun-dried urad dal papad crafted in traditional village style.",
    },
    {
      _id: "appalam-2",
      name: "Pepper Appalam 100g",
      category: "Appalam",
      price: 40,
      image: poppetsImg,
      description: "Crunchy appalam infused with freshly cracked black peppercorns.",
    },
    {
      _id: "appalam-3",
      name: "Jeera Appalam 100g",
      category: "Appalam",
      price: 40,
      image: poppetsImg,
      description: "Digestive cumin-spiced appalam for festive dining.",
    },
    {
      _id: "appalam-4",
      name: "Rice Vadam / Appalam 100g",
      category: "Appalam",
      price: 45,
      image: poppetsImg,
      description: "Sun-dried crunchy rice crispies for meals and snacks.",
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let apiProducts = [];
        try {
          const res = await axiosInstance.get('/products');
          if (Array.isArray(res.data) && res.data.length > 0) {
            apiProducts = res.data;
          }
        } catch (e) {
          console.warn("Backend products fetch failed, using fallback catalog:", e);
        }

        // Map backend products to canonical categories
        const normalizedApiProducts = apiProducts.map((p) => {
          const canonicalCat = normalizeCategory(p.category, p.name);
          return {
            ...p,
            category: canonicalCat,
            originalCategory: p.category,
            packagingType:
              p.packagingType ||
              (isPackPresentation(p) ? "pack" : isBottlePresentation(p) ? "bottle" : undefined),
          };
        });

        // Merge: DEFAULT_PRODUCTS + normalizedApiProducts
        const mergedMap = new Map();
        DEFAULT_PRODUCTS.forEach((dp) => {
          mergedMap.set(dp.name.toLowerCase().trim(), dp);
        });

        normalizedApiProducts.forEach((ap) => {
          const key = ap.name.toLowerCase().trim();
          if (mergedMap.has(key)) {
            const existing = mergedMap.get(key);
            mergedMap.set(key, { ...existing, ...ap, category: ap.category || existing.category });
          } else {
            mergedMap.set(key, ap);
          }
        });

        let allProducts = Array.from(mergedMap.values());

        // Add computed fields
        allProducts = allProducts.map((product) => ({
          ...product,
          tamilName: getTamilName(product.name, product.category),
          tamilSlogan: getTamilSlogan(product.name, product.category),
        }));

        setProducts(allProducts);

        // Group products into CANONICAL_CATEGORIES in exact order
        const grouped = {};
        CANONICAL_CATEGORIES.forEach((cat) => {
          grouped[cat] = [];
        });

        allProducts.forEach((product) => {
          const cat = product.category;
          if (grouped[cat]) {
            grouped[cat].push(product);
          } else {
            grouped["Flour Items"].push(product);
          }
        });

        // Specific category sorting:
        // Pickles & Thokku: Bottle First, Pack Second!
        ["Pickles", "Thokku"].forEach((catKey) => {
          if (grouped[catKey]) {
            grouped[catKey].sort((a, b) => {
              const aIsBottle = isBottlePresentation(a);
              const bIsBottle = isBottlePresentation(b);
              if (aIsBottle && !bIsBottle) return -1;
              if (!aIsBottle && bIsBottle) return 1;
              return 0;
            });
          }
        });

        setGroupedProducts(grouped);
      } catch (error) {
        console.error("Failed to fetch products for carousel:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle touch start
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    touchEndRef.current = e.touches[0].clientX;
  };

  // Handle touch end - swipe detection
  const handleTouchEnd = (ref) => {
    if (!ref.current) return;
    
    const diff = touchStartRef.current - touchEndRef.current;
    const threshold = 50;
    const scrollAmount = 400; // Amount to scroll on swipe

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe left - scroll right
        ref.current.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      } else {
        // Swipe right - scroll left
        ref.current.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  // Handle mouse drag for desktop
  const handleMouseDown = (e, ref) => {
    e.preventDefault();
    if (!ref.current) return;
    
    const startX = e.pageX;
    const scrollLeft = ref.current.scrollLeft;

    const handleMouseMove = (e) => {
      const x = e.pageX;
      const walk = (startX - x) * 2;
      ref.current.scrollLeft = scrollLeft + walk;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle zoom modal
  const openZoom = useCallback((product) => {
    setZoomedImage(product);
  }, []);

  const closeZoom = useCallback(() => {
    setZoomedImage(null);
  }, []);

  // Close zoom on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeZoom();
    };
    if (zoomedImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [zoomedImage, closeZoom]);



  if (loading) {
    return (
      <section className="py-16 relative overflow-hidden bg-gradient-to-b from-[#FFFDF8] via-[#FAF6ED] to-[#FFF9F2]">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <p className="text-[#5D4037] text-sm font-medium mb-2">எங்கள் தயாரிப்புகள்</p>
            <h2 className="text-[#3E2723] text-4xl md:text-5xl font-bold italic">Our Range Of Products</h2>
          </div>
          <p className="text-center text-[#5D4037]">Loading products...</p>
        </div>
      </section>
    );
  }

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const categoryNames = {
      "Millet": "Millet",
      "Instant Products": "Instant Products",
      "Noodles": "Noodles",
      "Semiya": "Semiya",
      "Flour Items": "Flour Items",
      "Rava Sooji": "Rava Sooji",
      "Pickles": "Pickles",
      "Thokku": "Thokku",
      "Traditional Mix": "Traditional Mix",
      "Appalam": "Appalam",
      // legacy mappings
      "FLOUR": "Flour Items",
      "NOODLES": "Noodles",
      "INSTANT PRODUCTS": "Instant Products",
      "RAVA": "Rava Sooji",
      "VERMICELLI": "Semiya",
      "spices": "Traditional Mix",
      "pickles": "Pickles",
      "Millet Products": "Millet",
      "Maida": "Flour Items",
      "Sooji": "Rava Sooji",
      "MILLETS": "Millet",
      "puppet": "Appalam",
    };
    return categoryNames[category] || category;
  };

  return (
    <section
      id="our-product-range"
      className="pt-16 pb-24 md:pb-32 relative overflow-hidden bg-gradient-to-b from-[#FFFDF8] via-[#FAF6ED] to-[#FFF9F2] scroll-mt-20"
    >
      {/* ========================================================= */}
      {/* Seamless Moving Background Pattern (Continuous Motion) */}
      {/* ========================================================= */}
      
      {/* Moving Heritage Vector Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute -top-[100px] -left-[100px] w-[calc(100%+200px)] h-[calc(100%+200px)] pointer-events-none opacity-45 will-change-transform animate-pattern-motion"
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="traditionalHeritagePattern"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                {/* Corner Intersection Dots */}
                <circle cx="0" cy="0" r="1.5" fill="#FEF3C7" opacity="0.75" />
                <circle cx="100" cy="0" r="1.5" fill="#FEF3C7" opacity="0.75" />
                <circle cx="0" cy="100" r="1.5" fill="#FEF3C7" opacity="0.75" />
                <circle cx="100" cy="100" r="1.5" fill="#FEF3C7" opacity="0.75" />
                <circle cx="50" cy="50" r="2.5" fill="#FDE68A" opacity="0.85" />

                {/* Central Floral Kolam Motif */}
                <path
                  d="M50 35 C42 42, 42 58, 50 65 C58 58, 58 42, 50 35 Z"
                  fill="none"
                  stroke="#FDE68A"
                  strokeWidth="1.2"
                  opacity="0.9"
                />
                <path
                  d="M35 50 C42 42, 58 42, 65 50 C58 58, 42 58, 35 50 Z"
                  fill="none"
                  stroke="#FDE68A"
                  strokeWidth="1.2"
                  opacity="0.9"
                />

                {/* Diamond Lattice Links */}
                <path
                  d="M50 15 L85 50 L50 85 L15 50 Z"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  opacity="0.65"
                />

                {/* Four Corner Wheat Sprigs & Grains */}
                {/* Top-Left */}
                <path
                  d="M10 10 Q20 15 25 25 M15 10 Q22 18 20 28 M10 15 Q18 22 28 20"
                  fill="none"
                  stroke="#FEF3C7"
                  strokeWidth="1"
                  opacity="0.7"
                />
                {/* Top-Right */}
                <path
                  d="M90 10 Q80 15 75 25 M85 10 Q78 18 80 28 M90 15 Q82 22 72 20"
                  fill="none"
                  stroke="#FEF3C7"
                  strokeWidth="1"
                  opacity="0.7"
                />
                {/* Bottom-Left */}
                <path
                  d="M10 90 Q20 85 25 75 M15 90 Q22 82 20 72 M10 85 Q18 78 28 80"
                  fill="none"
                  stroke="#FEF3C7"
                  strokeWidth="1"
                  opacity="0.7"
                />
                {/* Bottom-Right */}
                <path
                  d="M90 90 Q80 85 75 75 M85 90 Q78 82 80 72 M90 85 Q82 78 72 80"
                  fill="none"
                  stroke="#FEF3C7"
                  strokeWidth="1"
                  opacity="0.7"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#traditionalHeritagePattern)" />
          </svg>
        </div>
      </div>

      {/* Radial Ambient Warm Glows for Rich Lighting Depth */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-amber-400/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-2/3 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Traditional South Indian Framing Flourishes */}
      <div className="absolute top-4 left-4 w-24 h-24 opacity-25 pointer-events-none z-0">
        <svg viewBox="0 0 100 100" fill="none" stroke="#FDE68A" strokeWidth="1.5" className="w-full h-full">
          <path d="M5 5 L5 50 M5 5 L50 5 M15 15 L15 35 M15 15 L35 15 M5 5 Q35 35 45 45" />
          <circle cx="18" cy="18" r="2.5" fill="#FDE68A" />
        </svg>
      </div>
      <div className="absolute top-4 right-4 w-24 h-24 opacity-25 pointer-events-none z-0 scale-x-[-1]">
        <svg viewBox="0 0 100 100" fill="none" stroke="#FDE68A" strokeWidth="1.5" className="w-full h-full">
          <path d="M5 5 L5 50 M5 5 L50 5 M15 15 L15 35 M15 15 L35 15 M5 5 Q35 35 45 45" />
          <circle cx="18" cy="18" r="2.5" fill="#FDE68A" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-[#5D4037] text-sm font-medium mb-2">
            எங்கள் தயாரிப்புகள்
          </p>
          <h2 className="text-[#3E2723] text-4xl md:text-5xl font-bold italic">
            Our Range Of Products
          </h2>
          
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 h-3 bg-[#5D4033]/60 rounded-full"></div>
              ))}
            </div>
            <div className="w-16 h-0.5 bg-[#5D4037]/40"></div>
            <div className="w-3 h-3 bg-[#5D4037]/60 rotate-45"></div>
            <div className="w-16 h-0.5 bg-[#5D4037]/40"></div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 h-3 bg-[#5D4037]/60 rounded-full"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Carousels in strict client ordered sequence */}
        <div className="space-y-14">
          {CANONICAL_CATEGORIES.map((category) => {
            const categoryProducts = groupedProducts[category] || [];
            if (categoryProducts.length === 0) return null;
            return (
              <CategoryCarouselSection
                key={category}
                category={category}
                categoryProducts={categoryProducts}
                getCategoryDisplayName={getCategoryDisplayName}
                navigate={navigate}
                addToCart={addToCart}
                openZoom={openZoom}
              />
            );
          })}
        </div>
      </div>

      {/* Curvy Bottom Edge in Orange Color (Ending Divider) */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-14 sm:h-20 md:h-28 block drop-shadow-sm"
        >
          <defs>
            <linearGradient id="orangeCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#E05A1B" />
            </linearGradient>
            <linearGradient id="orangeAmbientGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E05A1B" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#E05A1B" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Layer 1: Warm ambient orange shadow curve */}
          <path
            d="M0,18 Q720,105 1440,18 L1440,120 L0,120 Z"
            fill="url(#orangeAmbientGrad)"
          />

          {/* Layer 2: Main white fill curve (blends seamlessly into next section) */}
          <path
            d="M0,32 Q720,118 1440,32 L1440,120 L0,120 Z"
            fill="#FFFFFF"
          />

          {/* Layer 3: Vibrant Orange Highlight Accent Edge along the curve */}
          <path
            d="M0,32 Q720,118 1440,32"
            stroke="url(#orangeCurveGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div
          ref={zoomRef}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={closeZoom}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeZoom}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors z-10"
              aria-label="Close zoom"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Product info bar */}
            <div className="absolute -top-12 left-0 text-white text-sm font-medium">
              {(zoomedImage.category === "Pickles" || zoomedImage.category === "Thokku") && isPackPresentation(zoomedImage)
                ? zoomedImage.name.replace(/\b\d+\.?\d*\s*(g|kg|gm|grams|ml|l)\b/gi, "").replace(/\s*-\s*$/, "").replace(/\(\s*\)/, "").trim()
                : zoomedImage.name}
            </div>

            {/* Image container */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={zoomedImage.image || ph}
                alt={zoomedImage.name}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))'
                }}
              />
            </div>

            {/* Bottom info */}
            <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-4 text-white/70 text-sm">
              <span>{zoomedImage.category}</span>
              <span>·</span>
              <span className="text-amber-300">{zoomedImage.tamilName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe for moving pattern & fadeIn animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes patternMoveMotion {
          0% {
            transform: translate3d(0px, 0px, 0px);
          }
          100% {
            transform: translate3d(100px, 100px, 0px);
          }
        }
        .animate-pattern-motion {
          animation: patternMoveMotion 12s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default ProductRangeCarousel;