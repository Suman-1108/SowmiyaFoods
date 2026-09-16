import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Check,
  Star,
  SlidersHorizontal,
} from "lucide-react";

/**
 * ProductFilterSidebar
 * E-commerce (Flipkart-style) collapsible filter sidebar
 * Designed with Sowmiya Foods theme colors (#e8703b, #1e3a5f)
 */
const ProductFilterSidebar = ({
  categories = [],
  weights = [],
  categoryCounts = {},
  weightCounts = {},
  selectedCategories = [],
  setSelectedCategories,
  selectedWeights = [],
  setSelectedWeights,
  priceRange = { min: "", max: "" },
  setPriceRange,
  inStockOnly = false,
  setInStockOnly,
  minRating = null,
  setMinRating,
  onResetFilters,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  // Accordion toggle states
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    availability: true,
    weight: true,
    rating: false,
  });

  // Search inside category list (like "Search Processor" in Flipkart)
  const [categorySearch, setCategorySearch] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Search inside weights/pack sizes
  const [weightSearch, setWeightSearch] = useState("");
  const [showAllWeights, setShowAllWeights] = useState(false);

  // Local state for custom price min/max inputs
  const [minPriceInput, setMinPriceInput] = useState(priceRange.min || "");
  const [maxPriceInput, setMaxPriceInput] = useState(priceRange.max || "");

  const toggleSection = (sec) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Filtered categories based on inside search
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    return categories.filter((c) =>
      c.toLowerCase().includes(categorySearch.toLowerCase().trim())
    );
  }, [categories, categorySearch]);

  // Categories visible in list (limit to 5 unless expanded)
  const visibleCategories = showAllCategories
    ? filteredCategories
    : filteredCategories.slice(0, 6);

  // Filtered weights based on inside search
  const filteredWeights = useMemo(() => {
    if (!weightSearch.trim()) return weights;
    return weights.filter((w) =>
      w.toLowerCase().includes(weightSearch.toLowerCase().trim())
    );
  }, [weights, weightSearch]);

  const visibleWeights = showAllWeights
    ? filteredWeights
    : filteredWeights.slice(0, 6);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategories.length > 0 ||
      selectedWeights.length > 0 ||
      inStockOnly ||
      minRating !== null ||
      priceRange.min !== "" ||
      priceRange.max !== ""
    );
  }, [
    selectedCategories,
    selectedWeights,
    inStockOnly,
    minRating,
    priceRange,
  ]);

  const handleCategoryToggle = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleWeightToggle = (w) => {
    if (selectedWeights.includes(w)) {
      setSelectedWeights(selectedWeights.filter((item) => item !== w));
    } else {
      setSelectedWeights([...selectedWeights, w]);
    }
  };

  const handlePriceApply = (e) => {
    e?.preventDefault();
    setPriceRange({
      min: minPriceInput ? Number(minPriceInput) : "",
      max: maxPriceInput ? Number(maxPriceInput) : "",
    });
  };

  const handlePricePreset = (min, max) => {
    setMinPriceInput(min !== null ? String(min) : "");
    setMaxPriceInput(max !== null ? String(max) : "");
    setPriceRange({
      min: min !== null ? min : "",
      max: max !== null ? max : "",
    });
  };

  return (
    <aside
      className={`bg-white rounded-2xl border border-gray-200/90 shadow-xs flex flex-col ${
        isMobileDrawer ? "h-full" : "sticky top-24"
      }`}
    >
      {/* 🏷️ Top Header: Filters + Clear All */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#e8703b]" />
          <h3 className="text-base font-bold text-[#1e3a5f] tracking-tight">
            Filters
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-[11px] font-bold text-[#e8703b] hover:text-[#d45f2a] hover:underline cursor-pointer uppercase tracking-wider transition-colors"
            >
              Clear All
            </button>
          )}
          {isMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections Container */}
      <div
        className={`divide-y divide-gray-100 overflow-y-auto ${
          isMobileDrawer ? "flex-1 px-4 py-2" : "max-h-[calc(100vh-140px)] px-4 py-1"
        }`}
      >
        {/* ─── SECTION 1: CATEGORIES ─── */}
        <div className="py-4">
          <button
            type="button"
            onClick={() => toggleSection("category")}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
          >
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#e8703b] transition-colors">
              Categories
              {selectedCategories.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-[#e8703b] font-bold">
                  {selectedCategories.length}
                </span>
              )}
            </span>
            {openSections.category ? (
              <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" />
            )}
          </button>

          {openSections.category && (
            <div className="mt-3 space-y-2.5">
              {/* Internal search inside category (like "Search Processor" in Flipkart) */}
              {categories.length > 6 && (
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search Category"
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:border-[#e8703b] focus:bg-white focus:ring-1 focus:ring-amber-500/20 outline-none transition"
                  />
                  {categorySearch && (
                    <button
                      onClick={() => setCategorySearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {/* Category Checkbox List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {visibleCategories.length === 0 ? (
                  <p className="text-[11px] text-gray-400 py-1 italic">
                    No matching categories
                  </p>
                ) : (
                  visibleCategories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat);
                    const count = categoryCounts[cat] || 0;
                    return (
                      <label
                        key={cat}
                        className="flex items-center justify-between py-1 px-1 rounded-md hover:bg-amber-50/50 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              isChecked
                                ? "bg-[#e8703b] border-[#e8703b] text-white"
                                : "border-gray-300 bg-white group-hover:border-[#e8703b]"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isChecked}
                            onChange={() => handleCategoryToggle(cat)}
                          />
                          <span
                            className={`text-xs truncate transition-colors ${
                              isChecked
                                ? "font-semibold text-gray-900"
                                : "text-gray-600 group-hover:text-gray-900"
                            }`}
                            title={cat}
                          >
                            {cat}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium ml-2 flex-shrink-0">
                          ({count})
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              {/* Expand / Show More toggle */}
              {filteredCategories.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="mt-1 text-[11px] font-bold text-[#e8703b] hover:text-[#d45f2a] cursor-pointer uppercase tracking-wider block"
                >
                  {showAllCategories
                    ? "Show Less"
                    : `${filteredCategories.length - 6} MORE`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ─── SECTION 2: PRICE ─── */}
        <div className="py-4">
          <button
            type="button"
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
          >
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#e8703b] transition-colors">
              Price
              {(priceRange.min !== "" || priceRange.max !== "") && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-[#e8703b] font-bold">
                  Active
                </span>
              )}
            </span>
            {openSections.price ? (
              <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" />
            )}
          </button>

          {openSections.price && (
            <div className="mt-3 space-y-3">
              {/* Quick Presets */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "Under ₹100", min: null, max: 100 },
                  { label: "₹100 - ₹250", min: 100, max: 250 },
                  { label: "₹250 - ₹500", min: 250, max: 500 },
                  { label: "Above ₹500", min: 500, max: null },
                ].map((preset, idx) => {
                  const isActive =
                    (preset.min === null
                      ? priceRange.min === ""
                      : priceRange.min === preset.min) &&
                    (preset.max === null
                      ? priceRange.max === ""
                      : priceRange.max === preset.max);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePricePreset(preset.min, preset.max)}
                      className={`text-[11px] py-1 px-2 rounded-lg font-medium border text-center transition-colors cursor-pointer ${
                        isActive
                          ? "bg-amber-50 border-[#e8703b] text-[#e8703b] font-bold"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Min / Max range inputs */}
              <form onSubmit={handlePriceApply} className="pt-1">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      placeholder="Min"
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-[#e8703b] focus:bg-white focus:ring-1 focus:ring-amber-500/20 outline-none"
                    />
                  </div>
                  <span className="text-gray-400 text-xs font-medium">to</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      placeholder="Max"
                      className="w-full pl-6 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-[#e8703b] focus:bg-white focus:ring-1 focus:ring-amber-500/20 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 rounded-lg bg-[#e8703b] hover:bg-[#d45f2a] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    Go
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ─── SECTION 3: AVAILABILITY ─── */}
        <div className="py-4">
          <button
            type="button"
            onClick={() => toggleSection("availability")}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
          >
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#e8703b] transition-colors">
              Availability
            </span>
            {openSections.availability ? (
              <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" />
            )}
          </button>

          {openSections.availability && (
            <div className="mt-3">
              <label className="flex items-center gap-2.5 py-1 px-1 rounded-md hover:bg-amber-50/50 cursor-pointer group transition-colors">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    inStockOnly
                      ? "bg-[#e8703b] border-[#e8703b] text-white"
                      : "border-gray-300 bg-white group-hover:border-[#e8703b]"
                  }`}
                >
                  {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(!inStockOnly)}
                />
                <span
                  className={`text-xs transition-colors ${
                    inStockOnly
                      ? "font-semibold text-gray-900"
                      : "text-gray-600 group-hover:text-gray-900"
                  }`}
                >
                  Exclude Out of Stock
                </span>
              </label>
            </div>
          )}
        </div>

        {/* ─── SECTION 4: PACK SIZE / WEIGHT ─── */}
        {weights.length > 0 && (
          <div className="py-4">
            <button
              type="button"
              onClick={() => toggleSection("weight")}
              className="w-full flex items-center justify-between text-left group cursor-pointer"
            >
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#e8703b] transition-colors">
                Pack Size / Weight
                {selectedWeights.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-[#e8703b] font-bold">
                    {selectedWeights.length}
                  </span>
                )}
              </span>
              {openSections.weight ? (
                <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" />
              )}
            </button>

            {openSections.weight && (
              <div className="mt-3 space-y-2">
                {weights.length > 6 && (
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={weightSearch}
                      onChange={(e) => setWeightSearch(e.target.value)}
                      placeholder="Search Weight"
                      className="w-full pl-8 pr-7 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:border-[#e8703b] focus:bg-white focus:ring-1 focus:ring-amber-500/20 outline-none transition"
                    />
                    {weightSearch && (
                      <button
                        onClick={() => setWeightSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {visibleWeights.map((w) => {
                    const isChecked = selectedWeights.includes(w);
                    const count = weightCounts[w] || 0;
                    return (
                      <label
                        key={w}
                        className="flex items-center justify-between py-1 px-1 rounded-md hover:bg-amber-50/50 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              isChecked
                                ? "bg-[#e8703b] border-[#e8703b] text-white"
                                : "border-gray-300 bg-white group-hover:border-[#e8703b]"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isChecked}
                            onChange={() => handleWeightToggle(w)}
                          />
                          <span
                            className={`text-xs truncate transition-colors ${
                              isChecked
                                ? "font-semibold text-gray-900"
                                : "text-gray-600 group-hover:text-gray-900"
                            }`}
                          >
                            {w}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium ml-2 flex-shrink-0">
                          ({count})
                        </span>
                      </label>
                    );
                  })}
                </div>

                {filteredWeights.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllWeights(!showAllWeights)}
                    className="mt-1 text-[11px] font-bold text-[#e8703b] hover:text-[#d45f2a] cursor-pointer uppercase tracking-wider block"
                  >
                    {showAllWeights
                      ? "Show Less"
                      : `${filteredWeights.length - 6} MORE`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── SECTION 5: CUSTOMER RATINGS ─── */}
        <div className="py-4">
          <button
            type="button"
            onClick={() => toggleSection("rating")}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
          >
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider group-hover:text-[#e8703b] transition-colors">
              Customer Ratings
              {minRating && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-[#e8703b] font-bold">
                  {minRating}★+
                </span>
              )}
            </span>
            {openSections.rating ? (
              <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform" />
            )}
          </button>

          {openSections.rating && (
            <div className="mt-3 space-y-1.5">
              {[4, 3, 2].map((stars) => {
                const isSelected = minRating === stars;
                return (
                  <label
                    key={stars}
                    className="flex items-center gap-2.5 py-1 px-1 rounded-md hover:bg-amber-50/50 cursor-pointer group transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? "bg-[#e8703b] border-[#e8703b] text-white"
                          : "border-gray-300 bg-white group-hover:border-[#e8703b]"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="ratingFilter"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() =>
                        setMinRating(isSelected ? null : stars)
                      }
                    />
                    <div className="flex items-center gap-1">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                        {stars} <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 inline" />
                      </span>
                      <span className="text-xs text-gray-600">& above</span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Bottom Apply Bar */}
      {isMobileDrawer && (
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition"
          >
            Reset All
          </button>
          <button
            type="button"
            onClick={onCloseMobileDrawer}
            className="flex-1 py-2.5 rounded-xl bg-[#e8703b] hover:bg-[#d45f2a] text-white text-xs font-bold shadow-xs transition"
          >
            Apply Filters
          </button>
        </div>
      )}
    </aside>
  );
};

export default ProductFilterSidebar;
