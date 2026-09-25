import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Loader2,
  Trash2,
  Plus,
  Tag,
  AlertCircle,
  Search,
  FolderTree,
  Quote,
  Sparkles,
  Languages,
  Layers,
  Star,
  Palette,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
} from "../../api/productApi";

const LABEL_PRESETS = [
  "Bestseller",
  "New",
  "Trending",
  "Special Offer",
  "Pure & Organic",
  "Hot",
  "Chef's Pick",
  "Limited Edition",
];

const BADGE_COLOR_PALETTES = [
  { name: "Brand Orange", value: "#e8703b" },
  { name: "Golden Amber", value: "#f59e0b" },
  { name: "Fiery Red", value: "#dc2626" },
  { name: "Ruby Rose", value: "#e11d48" },
  { name: "Emerald Green", value: "#059669" },
  { name: "Royal Purple", value: "#7c3aed" },
  { name: "Ocean Blue", value: "#2563eb" },
  { name: "Dark Slate", value: "#1e293b" },
];

const DEFAULT_CATEGORIES = [
  "Millet",
  "Instant Products",
  "Noodles",
  "Semiya",
  "Flour Items",
  "Maida",
  "Rava Sooji",
  "Pickles",
  "Thokku",
  "Traditional Mix",
  "Appalam",
];

const LEGACY_CATEGORY_MAP = {
  flour: "Flour Items",
  "flour items": "Flour Items",
  maida: "Maida",
  miada: "Maida",
  atta: "Flour Items",
  noodles: "Noodles",
  "millet noodles": "Noodles",
  semiya: "Semiya",
  vermicelli: "Semiya",
  semia: "Semiya",
  millet: "Millet",
  millets: "Millet",
  "millet products": "Millet",
  "instant products": "Instant Products",
  instant: "Instant Products",
  rava: "Rava Sooji",
  sooji: "Rava Sooji",
  "rava sooji": "Rava Sooji",
  pickles: "Pickles",
  pickle: "Pickles",
  thokku: "Thokku",
  "traditional mix": "Traditional Mix",
  spices: "Traditional Mix",
  appalam: "Appalam",
  puppet: "Appalam",
  papad: "Appalam",
};

const normalizeCategoryList = (rawList) => {
  const seen = new Set();
  const result = [];
  (rawList || []).forEach((item) => {
    if (!item || typeof item !== "string") return;
    const trimmed = item.trim();
    if (!trimmed) return;
    const normalized = LEGACY_CATEGORY_MAP[trimmed.toLowerCase()] || trimmed;
    const lower = normalized.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(normalized);
    }
  });
  return result;
};

const ProductModal = ({ isOpen, onClose, onSave, editingProduct, availableCategories = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    mrp: "",
    category: "",
    categories: [],
    description: "",
    image: "",
    stock: "25",
    lowStockThreshold: "10",
    inStock: true,
    label: "",
    quote: "",
    tamilName: "",
    tamilSlogan: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Category Management states
  const [categories, setCategories] = useState(() =>
    normalizeCategoryList([...DEFAULT_CATEGORIES, ...availableCategories.filter(Boolean)])
  );
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [targetCategoryForMove, setTargetCategoryForMove] = useState("General");
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  const fetchCategoriesList = async () => {
    setLoadingCategories(true);
    try {
      const data = await getAllCategories();
      const list = Array.isArray(data) ? data : [];
      const base =
        list.length > 0
          ? list
          : [...DEFAULT_CATEGORIES, ...availableCategories.filter(Boolean)];
      setCategories(normalizeCategoryList(base));
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories((prev) => normalizeCategoryList(prev));
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategoriesList();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingProduct) {
      const rawCats = Array.isArray(editingProduct.categories) && editingProduct.categories.length > 0
        ? editingProduct.categories
        : (editingProduct.category ? [editingProduct.category] : []);
      const primaryCat = editingProduct.category || rawCats[0] || "";

      setFormData({
        name: editingProduct.name || "",
        price: editingProduct.price !== undefined && editingProduct.price !== null ? String(editingProduct.price) : "",
        mrp:
          editingProduct.mrp !== undefined && editingProduct.mrp !== null
            ? String(editingProduct.mrp)
            : editingProduct.price !== undefined && editingProduct.price !== null
            ? String(editingProduct.price)
            : "",
        category: primaryCat,
        categories: rawCats,
        description: editingProduct.description || "",
        image: editingProduct.image || "",
        stock: editingProduct.stock !== undefined ? String(editingProduct.stock) : "25",
        lowStockThreshold:
          editingProduct.lowStockThreshold !== undefined
            ? String(editingProduct.lowStockThreshold)
            : "10",
        inStock: editingProduct.inStock !== false,
        label: editingProduct.label || "",
        badgeColor: editingProduct.badgeColor || "",
        quote: editingProduct.quote || editingProduct.quotes || "",
        tamilName: editingProduct.tamilName || "",
        tamilSlogan: editingProduct.tamilSlogan || "",
      });
      setImagePreview(editingProduct.image || "");
      setImageFile(null);
      setIsCustomCategory(false);
      setCustomCategory("");
    } else {
      const firstCat = categories[0] || "Millet";
      setFormData({
        name: "",
        price: "",
        mrp: "",
        category: firstCat,
        categories: [firstCat],
        description: "",
        image: "",
        stock: "25",
        lowStockThreshold: "10",
        inStock: true,
        label: "",
        badgeColor: "",
        quote: "",
        tamilName: "",
        tamilSlogan: "",
      });
      setImagePreview("");
      setImageFile(null);
      setIsCustomCategory(false);
      setCustomCategory("");
    }
  }, [editingProduct, isOpen]);

  // Toggle category inclusion in multi-category list
  const toggleCategory = (catName) => {
    setFormData((prev) => {
      const currentList = Array.isArray(prev.categories) && prev.categories.length > 0
        ? [...prev.categories]
        : (prev.category ? [prev.category] : []);
      
      const isSelected = currentList.includes(catName);
      let updated;
      if (isSelected) {
        updated = currentList.filter((c) => c !== catName);
      } else {
        updated = [...currentList, catName];
      }

      const currentPrimary = prev.category;
      const newPrimary = updated.includes(currentPrimary)
        ? currentPrimary
        : (updated[0] || "");

      return {
        ...prev,
        categories: updated,
        category: newPrimary,
      };
    });
  };

  // Set category as primary
  const setPrimaryCategory = (catName) => {
    setFormData((prev) => {
      const currentList = Array.isArray(prev.categories) ? [...prev.categories] : [];
      if (!currentList.includes(catName)) {
        currentList.unshift(catName);
      }
      return {
        ...prev,
        category: catName,
        categories: currentList,
      };
    });
  };

  // Handle creating a new category
  const handleAddNewCategory = async (nameToAdd) => {
    const trimmed = (nameToAdd || "").trim();
    if (!trimmed) {
      toast.error("Please enter a category name");
      return;
    }
    setIsCreatingCategory(true);
    try {
      await createCategory(trimmed);
      toast.success(`Category "${trimmed}" added successfully`);
      setCategories((prev) => Array.from(new Set([...prev, trimmed])));
      setFormData((prev) => {
        const existing = Array.isArray(prev.categories) ? [...prev.categories] : [];
        if (!existing.includes(trimmed)) existing.push(trimmed);
        return {
          ...prev,
          category: prev.category || trimmed,
          categories: existing,
        };
      });
      setIsCustomCategory(false);
      setCustomCategory("");
      setNewCategoryName("");
      window.dispatchEvent(new CustomEvent("categoriesUpdated"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Open delete category dialog
  const initiateCategoryDelete = (cat) => {
    setCategoryToDelete(cat);
    const others = categories.filter((c) => c.toLowerCase() !== cat.toLowerCase());
    setTargetCategoryForMove(others[0] || "General");
  };

  // Handle confirming category delete
  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeletingCategory(true);
    try {
      const moveTarget = targetCategoryForMove || "General";
      const res = await deleteCategory(categoryToDelete, moveTarget);
      toast.success(res.message || `Category "${categoryToDelete}" deleted successfully`);
      setCategories((prev) =>
        prev.filter((c) => c.toLowerCase() !== categoryToDelete.toLowerCase())
      );
      setFormData((prev) => {
        if (prev.category?.toLowerCase() === categoryToDelete.toLowerCase()) {
          return { ...prev, category: moveTarget };
        }
        return prev;
      });
      setCategoryToDelete(null);
      window.dispatchEvent(new CustomEvent("categoriesUpdated"));
      window.dispatchEvent(new CustomEvent("inventoryUpdated"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    } finally {
      setIsDeletingCategory(false);
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid selling price greater than 0");
      return;
    }

    const mrpNum = formData.mrp !== "" ? parseFloat(formData.mrp) : priceNum;
    if (isNaN(mrpNum) || mrpNum <= 0) {
      toast.error("Please enter a valid MRP greater than 0");
      return;
    }

    const selectedCategoryList = Array.isArray(formData.categories) && formData.categories.length > 0
      ? formData.categories
      : (isCustomCategory && customCategory.trim() ? [customCategory.trim()] : (formData.category ? [formData.category] : []));

    if (selectedCategoryList.length === 0 || !selectedCategoryList[0]) {
      toast.error("Please select or enter at least one category");
      return;
    }

    const primaryCategory = formData.category && selectedCategoryList.includes(formData.category)
      ? formData.category
      : selectedCategoryList[0];

    if (!selectedCategoryList.includes(primaryCategory)) {
      selectedCategoryList.unshift(primaryCategory);
    }

    setSubmitting(true);
    try {
      const stockNum = formData.stock !== "" ? Math.max(0, parseInt(formData.stock, 10)) : 0;
      const thresholdNum = formData.lowStockThreshold !== "" ? Math.max(1, parseInt(formData.lowStockThreshold, 10)) : 10;

      const payload = {
        name: formData.name.trim(),
        price: priceNum,
        mrp: mrpNum,
        category: primaryCategory,
        categories: selectedCategoryList,
        description: formData.description.trim(),
        image: formData.image || imagePreview || "",
        stock: isNaN(stockNum) ? 0 : stockNum,
        lowStockThreshold: isNaN(thresholdNum) ? 10 : thresholdNum,
        inStock: Boolean(formData.inStock),
        label: (formData.label || "").trim(),
        badgeColor: (formData.badgeColor || "").trim(),
        quote: (formData.quote || "").trim(),
        tamilName: (formData.tamilName || "").trim(),
        tamilSlogan: (formData.tamilSlogan || "").trim(),
      };

      await onSave(payload, editingProduct?._id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingProduct
                  ? "Update product pricing, stock quantity, and category details"
                  : "Fill in product specifications, stock levels, and upload images"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Traditional Idli Podi 250g"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent transition font-semibold"
              />
            </div>

            {/* Categories & Multi-Category Selection */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#e8703b]" />
                    <span>Product Categories <span className="text-rose-500">*</span></span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Assign this product to one or multiple store categories (e.g. Millet & Noodles)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsManagingCategories((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e8703b] hover:text-[#d65f29] hover:underline transition cursor-pointer"
                >
                  <FolderTree className="w-3 h-3" />
                  <span>{isManagingCategories ? "Close Manager" : "Manage / Delete Categories"}</span>
                </button>
              </div>

              {/* Multi-category tags */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Select Categories (Click to toggle):
                  </span>
                  <span className="text-[11px] font-bold text-[#e8703b]">
                    {formData.categories?.length || 0} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-2.5 bg-white rounded-xl border border-slate-200/90 max-h-48 overflow-y-auto">
                  {categories.map((cat) => {
                    const isSelected = formData.categories?.includes(cat);
                    const isPrimary = formData.category === cat;
                    return (
                      <div
                        key={cat}
                        className={`inline-flex items-center rounded-xl border transition-all text-xs font-semibold select-none ${
                          isSelected
                            ? "bg-orange-50 border-[#e8703b] text-[#e8703b] shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 cursor-pointer"
                          title={`Click to ${isSelected ? "remove from" : "add to"} ${cat}`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isSelected ? "bg-[#e8703b] text-white" : "border border-slate-300 text-transparent"
                            }`}
                          >
                            {isSelected ? "✓" : ""}
                          </span>
                          <span>{cat}</span>
                        </button>

                        {isSelected && (
                          <button
                            type="button"
                            onClick={() => setPrimaryCategory(cat)}
                            title={isPrimary ? "Primary Category" : "Click to set as Primary Category"}
                            className={`px-2 py-1.5 border-l border-orange-200 text-[10px] font-extrabold cursor-pointer transition ${
                              isPrimary
                                ? "bg-[#e8703b] text-white"
                                : "text-slate-400 hover:text-amber-600 hover:bg-orange-100/50"
                            }`}
                          >
                            {isPrimary ? "★ Primary" : "Make Primary"}
                          </button>
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-orange-300 text-xs font-bold text-[#e8703b] hover:bg-orange-50/50 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Custom Category</span>
                  </button>
                </div>

                {/* Custom Category Input Inline */}
                {isCustomCategory && (
                  <div className="flex gap-2 mt-2 p-2 bg-orange-50/70 border border-orange-200 rounded-xl">
                    <input
                      type="text"
                      placeholder="Type new category name..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddNewCategory(customCategory);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e8703b]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddNewCategory(customCategory)}
                      disabled={isCreatingCategory || !customCategory.trim()}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] rounded-lg shadow-2xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isCreatingCategory ? "Saving..." : "Add & Select"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Categories Summary Line */}
                {formData.categories?.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                    <span className="font-bold text-slate-700">Appears in:</span>
                    {formData.categories.map((c) => (
                      <span
                        key={c}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-xs ${
                          formData.category === c
                            ? "bg-[#e8703b] text-white"
                            : "bg-slate-200/90 text-slate-700"
                        }`}
                      >
                        {c}
                        {formData.category === c && <Star className="w-2.5 h-2.5 fill-white text-white" />}
                      </span>
                    ))}
                    {formData.category && (
                      <span className="text-slate-400 ml-auto">
                        Primary: <strong className="text-slate-700">{formData.category}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Section: MRP and Selling Price (Entered Manually) */}
            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#e8703b]" />
                    <span>Pricing Configuration</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Enter both MRP and Selling Price manually
                  </p>
                </div>

                {/* Dynamic Discount Pill */}
                {(() => {
                  const m = parseFloat(formData.mrp);
                  const p = parseFloat(formData.price);
                  if (!isNaN(m) && !isNaN(p) && m > p && p > 0) {
                    const discountPercent = Math.round(((m - p) / m) * 100);
                    const savings = (m - p).toFixed(2);
                    return (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span>{discountPercent}% OFF</span>
                        <span className="text-[10.5px] text-emerald-700 font-semibold">
                          (Save ₹{savings})
                        </span>
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* MRP (Manual Input) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    MRP (Printed / Original ₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      placeholder="e.g. 120.00"
                      className="w-full pl-8 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent transition font-semibold text-slate-900"
                    />
                  </div>
                  <span className="text-[10.5px] text-slate-400 mt-1 block">
                    Maximum Retail Price shown with strikethrough
                  </span>
                </div>

                {/* Selling Price (Manual Input) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Selling Price (Sell / Offer ₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 99.00"
                      className="w-full pl-8 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent transition font-semibold text-slate-900"
                    />
                  </div>
                  <span className="text-[10.5px] text-slate-400 mt-1 block">
                    Actual selling price customer pays
                  </span>
                </div>
              </div>

              {/* Informative notice if price > mrp */}
              {(() => {
                const m = parseFloat(formData.mrp);
                const p = parseFloat(formData.price);
                if (!isNaN(m) && !isNaN(p) && m > 0 && p > m) {
                  return (
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Notice: Selling price (₹{p}) is higher than MRP (₹{m}). Please verify.
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Category Manager Dropdown Card */}
            {isManagingCategories && (
              <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-200/70 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Tag className="w-3.5 h-3.5 text-[#e8703b]" />
                    <span>Manage Categories ({categories.length})</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Click trash icon to delete category
                  </span>
                </div>

                {/* Search & Quick Add */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter categories..."
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e8703b]"
                    />
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="+ New category name..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddNewCategory(newCategoryName);
                        }
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e8703b]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddNewCategory(newCategoryName)}
                      disabled={isCreatingCategory || !newCategoryName.trim()}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] rounded-lg shadow-2xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isCreatingCategory ? "Adding..." : "Add"}
                    </button>
                  </div>
                </div>

                {/* Categories badges with delete button */}
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200/80">
                  {categories
                    .filter((cat) =>
                      !categorySearchQuery.trim() ||
                      cat.toLowerCase().includes(categorySearchQuery.toLowerCase().trim())
                    )
                    .map((cat) => {
                      const isSelected = formData.category === cat;
                      return (
                        <div
                          key={cat}
                          className={`inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg text-xs font-semibold border transition ${
                            isSelected
                              ? "bg-orange-50 border-orange-300 text-[#e8703b] shadow-2xs font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className="cursor-pointer hover:underline inline-flex items-center gap-1"
                            title={isSelected ? "Selected (Click to remove)" : "Click to add to product"}
                          >
                            <span>{isSelected ? "✓" : "+"}</span>
                            <span>{cat}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => initiateCategoryDelete(cat)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title={`Delete category "${cat}"`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  {categories.length === 0 && (
                    <span className="text-xs text-slate-400 p-2">No categories found.</span>
                  )}
                </div>
              </div>
            )}

            {/* Product Label (Badge) & Quotes / Tagline Section */}
            <div className="p-4 bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-2xl border border-amber-200/80 space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#e8703b]" />
                    <span>Product Label & Quotes / Highlights</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add promotional badge pills and featured quotes to make this product stand out
                  </p>
                </div>
                {/* Live Badge Preview */}
                {formData.label && (
                  <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Badge:</span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs transition-all"
                      style={{ backgroundColor: formData.badgeColor || "#e8703b" }}
                    >
                      {formData.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Label / Badge Field & Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Badge Label
                  </label>
                  <span className="text-[10.5px] text-slate-400 font-medium">Click preset or type custom</span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {LABEL_PRESETS.map((preset) => {
                    const isSelected = formData.label?.toLowerCase() === preset.toLowerCase();
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormData({ ...formData, label: isSelected ? "" : preset })}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                          isSelected
                            ? "bg-[#e8703b] text-white border-[#e8703b] shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50"
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                  {formData.label && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, label: "" })}
                      className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g. Bestseller, 20% OFF, Limited Batch, Pure Millet..."
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] transition font-semibold text-slate-800"
                  />
                </div>
                <span className="text-[10.5px] text-slate-400 mt-1 block">
                  Displayed on product cards across the store and at top of product detail page
                </span>

                {/* Badge Color Customization Section */}
                <div className="mt-3 pt-3 border-t border-amber-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#e8703b]" />
                      <span>Customize Badge Color</span>
                    </label>
                    <span className="text-[10.5px] text-slate-400 font-medium">Select theme or custom color</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {BADGE_COLOR_PALETTES.map((palette) => {
                      const isSelected = (formData.badgeColor || "#e8703b").toLowerCase() === palette.value.toLowerCase();
                      return (
                        <button
                          key={palette.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, badgeColor: palette.value })}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            isSelected
                              ? "border-slate-800 shadow-xs ring-2 ring-orange-400/50 text-slate-900 bg-white font-bold"
                              : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white/70"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: palette.value }}
                          />
                          <span>{palette.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Color Input */}
                  <div className="flex items-center gap-2 mt-2 bg-white/70 p-2 rounded-xl border border-slate-200">
                    <label className="text-[11px] font-bold text-slate-600">Custom Color:</label>
                    <input
                      type="color"
                      value={formData.badgeColor || "#e8703b"}
                      onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                      className="w-7 h-7 p-0 border border-slate-300 rounded-lg cursor-pointer bg-white"
                      title="Choose custom badge color"
                    />
                    <input
                      type="text"
                      value={formData.badgeColor || ""}
                      onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                      placeholder="#e8703b"
                      className="w-24 px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg uppercase text-slate-800"
                    />
                    {formData.badgeColor && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, badgeColor: "" })}
                        className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer ml-auto"
                      >
                        Reset Default
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quotes / Promotional Tagline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Quotes / Catchy Tagline
                </label>
                <div className="relative">
                  <Quote className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    placeholder='e.g. "100% Traditional Stone-Ground Goodness with Authentic Aroma"'
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] transition font-medium text-slate-800 italic"
                  />
                </div>
                <span className="text-[10.5px] text-slate-400 mt-1 block">
                  Appears as a prominent quote/tagline banner in product details and highlights
                </span>
              </div>
            </div>

            {/* Inventory & Stock Section */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Inventory & Stock Management
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Track available warehouse quantity and configure low-stock triggers
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4 text-[#e8703b] rounded border-slate-300 focus:ring-[#e8703b]"
                  />
                  <span className="text-xs font-bold text-slate-700">In Stock</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Available Quantity */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Available Stock (Units)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="25"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] font-bold text-slate-900"
                  />
                </div>

                {/* Low Stock Alert Threshold */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Low-Stock Alert Trigger (≤ Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description / Highlights
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe grain purity, nutrition benefits, package sizes..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent transition"
              />
            </div>

            {/* Regional Branding (Tamil Name & Slogan) Section */}
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Regional Branding (Tamil Name & Slogan)</span>
                  <span className="text-[10px] font-semibold text-slate-400 normal-case ml-auto bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Optional
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Provide custom Tamil product title & subtitle (defaults to automated Tamil translations if left blank)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tamil Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.tamilName}
                    onChange={(e) => setFormData({ ...formData, tamilName: e.target.value })}
                    placeholder="e.g. சிறுதானிய நூடுல்ஸ்"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tamil Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tamilSlogan}
                    onChange={(e) => setFormData({ ...formData, tamilSlogan: e.target.value })}
                    placeholder="e.g. சத்தான சிறுதானியம். 100% Pure."
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload & Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Image (Upload or URL)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                {/* Image Preview Box */}
                <div className="sm:col-span-1 h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative group">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-contain p-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setImageFile(null);
                          setFormData({ ...formData, image: "" });
                        }}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition shadow"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-[11px] block">No image selected</span>
                    </div>
                  )}
                </div>

                {/* Upload inputs */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer border border-slate-200 transition">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>Choose Image File (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Or</span>
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={formData.image && !formData.image.startsWith("data:") ? formData.image : ""}
                      onChange={(e) => {
                        const url = e.target.value;
                        setFormData({ ...formData, image: url });
                        setImagePreview(url);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e8703b]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] rounded-xl shadow-md shadow-orange-500/20 transition cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Product...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{editingProduct ? "Update Product" : "Create Product"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category Delete Confirmation Modal with Product Move Option */}
      {categoryToDelete && (() => {
        const otherCategories = categories.filter(
          (c) => c.toLowerCase() !== categoryToDelete.toLowerCase()
        );

        return (
          <div className="fixed inset-0 z-60 overflow-y-auto">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
              onClick={() => setCategoryToDelete(null)}
            />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 z-10 animate-in fade-in zoom-in-95 duration-150 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-base font-black text-slate-900">
                      Delete "{categoryToDelete}"?
                    </h4>
                    <p className="text-xs text-slate-500">
                      Move existing products to another category
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2 text-left">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Move products to:
                  </label>
                  <select
                    value={targetCategoryForMove}
                    onChange={(e) => setTargetCategoryForMove(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b]"
                  >
                    {otherCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    {!otherCategories.includes("General") && (
                      <option value="General">General (Default)</option>
                    )}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(null)}
                    disabled={isDeletingCategory}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteCategory}
                    disabled={isDeletingCategory}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition cursor-pointer disabled:opacity-60"
                  >
                    {isDeletingCategory ? "Deleting..." : "Move & Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ProductModal;
