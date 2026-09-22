import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ==========================================
// Category Definitions (Text Navigation - Icons Commented)
// ==========================================
const CATEGORIES = [
  {
    id: "all",
    apiCategory: "all",
    name: "For You",
    tamil: "உங்களுக்காக",
  },
  {
    id: "millet",
    apiCategory: "Millet",
    name: "Millet",
    tamil: "சிறுதானியம்",
  },
  {
    id: "instant-products",
    apiCategory: "Instant Products",
    name: "Instant Products",
    tamil: "உடனடி பொருட்கள்",
  },
  {
    id: "noodles",
    apiCategory: "Noodles",
    name: "Noodles",
    tamil: "நூடுல்ஸ்",
  },
  {
    id: "semiya",
    apiCategory: "Semiya",
    name: "Semiya",
    tamil: "சேமியா",
  },
  {
    id: "flour-items",
    apiCategory: "Flour Items",
    name: "Flour Items",
    tamil: "மாவு வகைகள்",
  },
  {
    id: "rava-sooji",
    apiCategory: "Rava Sooji",
    name: "Rava Sooji",
    tamil: "ரவை & சூஜி",
  },
  {
    id: "pickles",
    apiCategory: "Pickles",
    name: "Pickles",
    tamil: "ஊறுகாய்",
  },
  {
    id: "thokku",
    apiCategory: "Thokku",
    name: "Thokku",
    tamil: "தொக்கு",
  },
  {
    id: "traditional-mix",
    apiCategory: "Traditional Mix",
    name: "Traditional Mix",
    tamil: "பாரம்பரிய மிக்ஸ்",
  },
  {
    id: "appalam",
    apiCategory: "Appalam",
    name: "Appalam",
    tamil: "அப்பளம்",
  },
];

/*
// ==========================================
// OPTIONAL: ICON DEFINITIONS (Commented out)
// If you want to enable icons again, restore these:
// ==========================================
const CATEGORY_ICONS = {
  all: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  vermicelli: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M4 11h16a8 8 0 0 1-16 0Z"/><path d="M7 11V6a3 3 0 0 1 3-3"/><path d="M12 11V4a2 2 0 0 1 2-2"/></svg>,
  noodles: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 12c0 5 4 9 9 9s9-4 9-9H3Z"/><path d="M8 12c0-3 1-6 2-8"/></svg>,
  flour: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M6 8c0-3 2.5-5 6-5s6 2 6 5c0 4-1 13-6 13S6 12 6 8Z"/><path d="M6 10h12"/></svg>,
  sooji: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 13h18a9 9 0 0 1-18 0Z"/></svg>,
  "instant-products": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg>,
  "millet-products": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12 22V8"/><path d="M12 8a6 6 0 0 1 6-6c0 4-3 6-6 6Z"/></svg>,
  pickles: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect width="14" height="15" x="5" y="7" rx="3"/><path d="M8 7V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3"/></svg>,
  puppet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="9"/></svg>,
  maida: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/></svg>,
};
*/

const CategoryNavbar = () => {
  const [activeId, setActiveId] = useState("all");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check scroll bounds to conditionally show desktop scroll arrows
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  // Smooth scroll category strip horizontally
  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -280 : 280;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Auto-update active tab when scrolling through ProductRangeCarousel on the home page
  useEffect(() => {
    if (location.pathname !== "/") return;

    const sections = CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
      const el =
        document.getElementById(`category-section-${cat.id}`) ||
        document.getElementById(
          `category-section-${cat.apiCategory.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
        );
      return { id: cat.id, element: el };
    });

    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 220;
      let currentActive = "all";

      // If scrolled near top
      if (window.scrollY < 300) {
        setActiveId("all");
        return;
      }

      for (const section of sections) {
        if (section.element) {
          const top = section.element.offsetTop;
          const height = section.element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentActive = section.id;
            break;
          }
        }
      }

      setActiveId(currentActive);
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [location.pathname]);

  // Handle clicking a category item
  const handleCategoryClick = (cat) => {
    setActiveId(cat.id);

    if (location.pathname === "/") {
      if (cat.id === "all") {
        const productRange = document.getElementById("our-product-range");
        if (productRange) {
          productRange.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      // Find matching section in ProductRangeCarousel
      const possibleIds = [
        `category-section-${cat.id}`,
        `category-section-${cat.apiCategory.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      ];

      let targetEl = null;
      for (const id of possibleIds) {
        const el = document.getElementById(id);
        if (el) {
          targetEl = el;
          break;
        }
      }

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // If specific section not found, navigate to category page
        navigate(`/category/${encodeURIComponent(cat.apiCategory)}`);
      }
    } else {
      // If on another page, navigate directly to category page
      if (cat.id === "all") {
        navigate("/products");
      } else {
        navigate(`/category/${encodeURIComponent(cat.apiCategory)}`);
      }
    }
  };

  return (
    <div className="relative w-full bg-white border-b border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] z-40 select-none">
      <div className="max-w-7xl mx-auto relative px-2 sm:px-4">
        {/* Left Scroll Arrow (Desktop) */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll("left")}
            aria-label="Scroll Left"
            className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 items-center justify-center bg-white/95 hover:bg-white text-gray-700 hover:text-[#E05A1B] rounded-full shadow-md border border-gray-200 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Right Scroll Arrow (Desktop) */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll("right")}
            aria-label="Scroll Right"
            className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 items-center justify-center bg-white/95 hover:bg-white text-gray-700 hover:text-[#E05A1B] rounded-full shadow-md border border-gray-200 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Horizontal Category Strip */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center justify-start md:justify-center gap-2 sm:gap-4 md:gap-6 overflow-x-auto py-2.5 px-2 scroll-smooth scrollbar-none"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={`group flex flex-col items-center justify-center flex-shrink-0 px-2.5 sm:px-3 py-1 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none ${
                  isActive ? "text-[#E05A1B]" : "text-gray-700 hover:text-[#E05A1B]"
                }`}
              >
                {/* 
                  =======================================================
                  ICON NAVIGATION (Commented Out as requested)
                  =======================================================
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl transition-all duration-300 mb-1 ${
                      isActive
                        ? "bg-amber-50 text-[#E05A1B] ring-1.5 ring-amber-300/80 shadow-xs scale-105"
                        : "bg-gray-50 text-gray-600 group-hover:bg-amber-50/50 group-hover:text-[#E05A1B]"
                    }`}
                  >
                    {CATEGORY_ICONS[cat.id]}
                  </div>
                */}

                {/* Category Title */}
                <span
                  className={`text-[12.5px] sm:text-[13.5px] leading-tight text-center tracking-tight whitespace-nowrap transition-colors duration-200 ${
                    isActive ? "font-bold text-[#E05A1B]" : "font-semibold text-gray-700 group-hover:text-gray-900"
                  }`}
                >
                  {cat.name}
                </span>

                {/* Tamil Micro-label */}
                <span
                  className={`text-[10px] sm:text-[10.5px] leading-none mt-0.5 tracking-tight transition-colors duration-200 ${
                    isActive ? "text-amber-700/90 font-medium" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                >
                  {cat.tamil}
                </span>

                {/* Active Underline Indicator Bar */}
                <div
                  className={`w-full h-[2.5px] rounded-full mt-1 transition-all duration-300 ${
                    isActive ? "bg-[#E05A1B] opacity-100 scale-x-100" : "bg-transparent opacity-0 scale-x-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryNavbar;
