import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  X,
  Heart,
  Eye,
  ShoppingCart,
  Bell,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  PackageX,
  Star,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext.jsx";
import ph from "../../assets/image.png";
import Navbar from "../Navbar";
import Footer from "../Footer";
import NotifyMeModal from "./NotifyMeModal";
import ProductFilterSidebar from "./ProductFilterSidebar";
import { getCachedProducts, setCachedProducts } from "../../utils/productCache";

const AllProducts = () => {
  const cachedData = useRef(getCachedProducts()).current;
  const [products, setProducts] = useState(cachedData?.products || []);
  const [loading, setLoading] = useState(!cachedData?.products?.length);
  const [error, setError] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedWeights, setSelectedWeights] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(null);
  const [sortBy, setSortBy] = useState("featured");

  // Mobile Drawer Toggle
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notifyProduct, setNotifyProduct] = useState(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  // Load URL query params on mount/change
  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("q") || "";
    const cat = searchParams.get("category");
    if (q) setSearchTerm(q);
    if (cat && cat !== "all") {
      setSelectedCategories([cat]);
    }
  }, [searchParams]);

  // Fetch all products from API
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get("/products");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data);
          setCachedProducts(res.data);
        } else if (!cachedData?.products?.length) {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
        if (!cachedData?.products?.length) {
          setError("Failed to fetch products. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Extract weight from product name (e.g. 500g, 1kg, 250g)
  const extractWeight = (name) => {
    const match = name?.match(/(\d+\s?(g|kg|ml|L))/i);
    return match ? match[0] : null;
  };

  const cleanName = (name) => {
    return (name || "").replace(/(\d+\s?(g|kg|ml|L))/i, "").trim();
  };

  // Extract dynamic categories & weights with counts
  const { categories, categoryCounts, weights, weightCounts } = useMemo(() => {
    const catMap = {};
    const weightMap = {};

    products.forEach((p) => {
      // Category count
      const cat = p.category?.trim();
      if (cat) {
        catMap[cat] = (catMap[cat] || 0) + 1;
      }

      // Weight count
      const w = extractWeight(p.name);
      if (w) {
        const normalizedWeight = w.replace(/\s+/g, "").toLowerCase();
        weightMap[normalizedWeight] = (weightMap[normalizedWeight] || 0) + 1;
      }
    });

    return {
      categories: Object.keys(catMap).sort(),
      categoryCounts: catMap,
      weights: Object.keys(weightMap).sort(),
      weightCounts: weightMap,
    };
  }, [products]);

  // Search input handler with URL sync
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    const newParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newParams.set("search", value.trim());
    } else {
      newParams.delete("search");
      newParams.delete("q");
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    newParams.delete("q");
    setSearchParams(newParams, { replace: true });
  };

  const handleResetAll = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedWeights([]);
    setPriceRange({ min: "", max: "" });
    setInStockOnly(false);
    setMinRating(null);
    setSortBy("featured");
    setSearchParams({}, { replace: true });
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Category filter (multi-select)
    if (selectedCategories.length > 0) {
      const lowerCats = selectedCategories.map((c) => c.toLowerCase());
      result = result.filter(
        (p) => p.category && lowerCats.includes(p.category.toLowerCase().trim())
      );
    }

    // 2. Search filter (matches name, category, description)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const catMatch = p.category?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        return nameMatch || catMatch || descMatch;
      });
    }

    // 3. In stock filter
    if (inStockOnly) {
      result = result.filter((p) => {
        const isOutOfStock =
          p.inStock === false ||
          (p.stock !== undefined && Number(p.stock) <= 0);
        return !isOutOfStock;
      });
    }

    // 4. Weight filter
    if (selectedWeights.length > 0) {
      result = result.filter((p) => {
        const w = extractWeight(p.name)?.replace(/\s+/g, "").toLowerCase();
        return w && selectedWeights.includes(w);
      });
    }

    // 5. Price filter
    if (priceRange.min !== "") {
      result = result.filter((p) => (Number(p.price) || 0) >= Number(priceRange.min));
    }
    if (priceRange.max !== "") {
      result = result.filter((p) => (Number(p.price) || 0) <= Number(priceRange.max));
    }

    // 6. Customer rating filter
    if (minRating !== null) {
      result = result.filter((p) => {
        const rating = p.rating || 4.8;
        return rating >= minRating;
      });
    }

    // 7. Sorting (Flipkart-style sort options)
    if (sortBy === "price-low") {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === "popularity") {
      // Best sellers or highest stock/rating
      result.sort((a, b) => (Number(b.rating || 0) - Number(a.rating || 0)));
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [
    products,
    selectedCategories,
    searchTerm,
    inStockOnly,
    selectedWeights,
    priceRange,
    minRating,
    sortBy,
  ]);

  // Count active filters for badges
  const activeFiltersCount =
    (selectedCategories.length > 0 ? selectedCategories.length : 0) +
    (selectedWeights.length > 0 ? selectedWeights.length : 0) +
    (priceRange.min !== "" || priceRange.max !== "" ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minRating !== null ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0);

  // Flipkart-style Sort tabs config
  const sortTabs = [
    { id: "featured", label: "Relevance" },
    { id: "popularity", label: "Popularity" },
    { id: "price-low", label: "Price -- Low to High" },
    { id: "price-high", label: "Price -- High to Low" },
    { id: "newest", label: "Newest First" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          {/* 🍞 Breadcrumbs & Page Meta Header */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-[#e8703b] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <Link to="/products" className="hover:text-[#e8703b] transition-colors">
              Products
            </Link>
            {selectedCategories.length === 1 && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-gray-800 font-semibold truncate">
                  {selectedCategories[0]}
                </span>
              </>
            )}
          </nav>

          {/* 🔍 Global Product Search Bar (Top card above side-view) */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-3 sm:p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") handleClearSearch();
                  }}
                  placeholder="Search products by name, category, or ingredients (e.g. Flour, Millet, Noodles, Rava)..."
                  className="w-full pl-10 pr-9 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-[#e8703b] focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none transition"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Button trigger */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 shadow-2xs cursor-pointer flex-shrink-0"
              >
                <Filter className="w-3.5 h-3.5 text-[#e8703b]" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#e8703b] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ════════════════ MAIN SIDE-BY-SIDE LAYOUT ════════════════ */}
          <div className="flex flex-col lg:flex-row items-start gap-5">
            {/* ⬅️ LEFT COLUMN: Side View Filter Sidebar (Desktop) */}
            <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
              <ProductFilterSidebar
                categories={categories}
                weights={weights}
                categoryCounts={categoryCounts}
                weightCounts={weightCounts}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedWeights={selectedWeights}
                setSelectedWeights={setSelectedWeights}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                minRating={minRating}
                setMinRating={setMinRating}
                onResetFilters={handleResetAll}
              />
            </div>

            {/* ➡️ RIGHT COLUMN: Products Results & Sort Bar */}
            <div className="flex-1 min-w-0 w-full">
              {/* Results Meta & Flipkart-style Sort Tabs Card */}
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs mb-4">
                {/* Top Row: Results count header */}
                <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                      {selectedCategories.length === 1
                        ? `${selectedCategories[0]} Products`
                        : "All Products & Grocery"}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Showing{" "}
                      <strong className="text-gray-800">
                        {filteredProducts.length}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-gray-800">
                        {products.length}
                      </strong>{" "}
                      results
                      {searchTerm && (
                        <span>
                          {" "}
                          for <strong className="text-[#e8703b]">"{searchTerm}"</strong>
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Flipkart-style Horizontal Sort Tabs */}
                <div className="px-4 sm:px-5 flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-hide">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-shrink-0 py-3">
                    Sort By
                  </span>

                  <div className="flex items-center gap-1 sm:gap-4 flex-nowrap whitespace-nowrap">
                    {sortTabs.map((tab) => {
                      const isActive = sortBy === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSortBy(tab.id)}
                          className={`py-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer ${
                            isActive
                              ? "border-[#e8703b] text-[#e8703b] font-bold"
                              : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 🏷️ Active Filter Pills / Chips (Removable tags) */}
              {activeFiltersCount > 0 && (
                <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs p-3 mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
                    Applied:
                  </span>

                  {/* Search Chip */}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium">
                      Keyword: "{searchTerm}"
                      <button
                        onClick={handleClearSearch}
                        className="hover:text-red-600 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Category Chips */}
                  {selectedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-[#e8703b] border border-orange-200 text-xs font-medium"
                    >
                      {cat}
                      <button
                        onClick={() =>
                          setSelectedCategories(
                            selectedCategories.filter((c) => c !== cat)
                          )
                        }
                        className="hover:text-red-600 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {/* Price Range Chip */}
                  {(priceRange.min !== "" || priceRange.max !== "") && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 border border-gray-200 text-xs font-medium">
                      Price: ₹{priceRange.min || 0} – ₹
                      {priceRange.max || "Max"}
                      <button
                        onClick={() => setPriceRange({ min: "", max: "" })}
                        className="hover:text-red-600 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Weight Chips */}
                  {selectedWeights.map((w) => (
                    <span
                      key={w}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium"
                    >
                      {w}
                      <button
                        onClick={() =>
                          setSelectedWeights(
                            selectedWeights.filter((item) => item !== w)
                          )
                        }
                        className="hover:text-red-600 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {/* In Stock Chip */}
                  {inStockOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium">
                      In Stock Only
                      <button
                        onClick={() => setInStockOnly(false)}
                        className="hover:text-red-600 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Rating Chip */}
                  {minRating !== null && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
                      {minRating}★ & above
                      <button
                        onClick={() => setMinRating(null)}
                        className="hover:text-red-600 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Clear All Button */}
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-2 ml-auto cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* 🔄 Loading State */}
              {loading && (
                <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200/80 p-8 shadow-xs">
                  <div className="w-10 h-10 border-4 border-amber-500/20 border-t-[#e8703b] rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-600 font-medium text-sm">
                    Loading products...
                  </p>
                </div>
              )}

              {/* ⚠️ Error State */}
              {!loading && error && (
                <div className="py-16 text-center bg-white rounded-2xl p-8 border border-red-100 shadow-xs max-w-lg mx-auto">
                  <PackageX className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-red-600 font-medium mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-5 py-2 rounded-xl bg-[#e8703b] text-white text-sm font-semibold hover:bg-[#d45f2a]"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* 📭 Empty State */}
              {!loading && !error && filteredProducts.length === 0 && (
                <div className="py-16 text-center bg-white rounded-2xl p-8 border border-gray-200/80 shadow-xs">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3 stroke-[1.5]" />
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    No products found
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                    {searchTerm
                      ? `We couldn't find any products matching "${searchTerm}" with the applied filters.`
                      : "No products match the selected filters. Try broadening your criteria."}
                  </p>
                  <button
                    onClick={handleResetAll}
                    className="px-6 py-2.5 rounded-xl bg-[#e8703b] hover:bg-[#d45f2a] text-white text-sm font-bold shadow-sm transition cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {/* 📦 Product Grid (Flipkart / Modern E-Commerce Style) */}
              {!loading && !error && filteredProducts.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                  {filteredProducts.map((product, pIdx) => {
                    const weight = extractWeight(product.name);
                    const displayName = cleanName(product.name);
                    const price = Number(product.price) || 0;
                    const mrp = Math.round(price * 1.3) || price + 35;
                    const reviewCount = 45 + ((pIdx * 27) % 75);
                    const isOutOfStock =
                      product.inStock === false ||
                      (product.stock !== undefined && Number(product.stock) <= 0);

                    // Badge assignment: only "New" product pill (Best Seller, Sale, Pure removed)
                    let badge = null;
                    if (isOutOfStock) {
                      badge = {
                        text: "Out of Stock",
                        bg: "bg-rose-600 text-white font-bold",
                      };
                    } else {
                      badge = { text: "New", bg: "bg-[#e8703b] text-white" };
                    }

                    return (
                      <div
                        key={product._id}
                        onClick={() =>
                          navigate(`/product/${product.slug || product._id}`)
                        }
                        className="bg-white rounded-2xl border border-gray-200/85 hover:border-gray-300 shadow-2xs hover:shadow-md transition-all duration-300 p-3 sm:p-3.5 flex flex-col justify-between group cursor-pointer"
                      >
                        {/* 1. Square Image Container */}
                        <div className="relative w-full aspect-square bg-[#F7F7F7] rounded-xl overflow-hidden mb-3 flex items-center justify-center p-3">
                          {/* Top-Left Badge */}
                          {badge && (
                            <div className="absolute top-2.5 left-2.5 z-10">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-semibold tracking-wide ${badge.bg}`}
                              >
                                {badge.text}
                              </span>
                            </div>
                          )}

                          {/* Top-Right Heart Icon */}
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await addToWishlist(product);
                              toast.success("Added to wishlist", {
                                duration: 1500,
                              });
                            }}
                            className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-red-500 transition shadow-2xs"
                            aria-label="Add to wishlist"
                          >
                            <Heart className="w-3.5 h-3.5 stroke-[1.8]" />
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
                          <h3
                            className="font-semibold text-gray-900 text-[13px] sm:text-[14px] leading-tight truncate group-hover:text-[#e8703b] transition-colors"
                            title={product.name}
                          >
                            {displayName}
                            {weight && (
                              <span className="text-gray-500 font-normal ml-1">
                                ({weight})
                              </span>
                            )}
                          </h3>

                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                            {product.category || "Grocery"}
                          </p>

                          {/* Price Row */}
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

                          {/* Star Rating */}
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

                          {/* CTA Button */}
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
                              onClick={async (e) => {
                                e.stopPropagation();
                                await addToCart(product, 1);
                                toast.success(
                                  `Added ${product.name} to cart`,
                                  { duration: 1500 }
                                );
                              }}
                              className="w-full mt-3 py-2 px-3 rounded-lg bg-[#e8703b] hover:bg-[#d45f2a] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 stroke-[1.9]" />
                              <span>Add to Cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 📱 Mobile Filter Drawer / Slide-Over */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            <ProductFilterSidebar
              categories={categories}
              weights={weights}
              categoryCounts={categoryCounts}
              weightCounts={weightCounts}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedWeights={selectedWeights}
              setSelectedWeights={setSelectedWeights}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              minRating={minRating}
              setMinRating={setMinRating}
              onResetFilters={handleResetAll}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Back in stock notification modal */}
      <NotifyMeModal
        isOpen={!!notifyProduct}
        onClose={() => setNotifyProduct(null)}
        product={notifyProduct}
      />

      <Footer />
    </div>
  );
};

export default AllProducts;
