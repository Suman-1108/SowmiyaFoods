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
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
} from "../../api/productApi";

const DEFAULT_CATEGORIES = [
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

const LEGACY_CATEGORY_MAP = {
  flour: "Flour Items",
  "flour items": "Flour Items",
  maida: "Flour Items",
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
    category: "",
    description: "",
    image: "",
    stock: "25",
    lowStockThreshold: "10",
    inStock: true,
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
      setFormData({
        name: editingProduct.name || "",
        price: editingProduct.price !== undefined ? String(editingProduct.price) : "",
        category: editingProduct.category || "",
        description: editingProduct.description || "",
        image: editingProduct.image || "",
        stock: editingProduct.stock !== undefined ? String(editingProduct.stock) : "25",
        lowStockThreshold:
          editingProduct.lowStockThreshold !== undefined
            ? String(editingProduct.lowStockThreshold)
            : "10",
        inStock: editingProduct.inStock !== false,
      });
      setImagePreview(editingProduct.image || "");
      setImageFile(null);

      if (editingProduct.category && !categories.includes(editingProduct.category)) {
        setIsCustomCategory(true);
        setCustomCategory(editingProduct.category);
      } else {
        setIsCustomCategory(false);
        setCustomCategory("");
      }
    } else {
      setFormData({
        name: "",
        price: "",
        category: categories[0] || "FLOUR",
        description: "",
        image: "",
        stock: "25",
        lowStockThreshold: "10",
        inStock: true,
      });
      setImagePreview("");
      setImageFile(null);
      setIsCustomCategory(false);
      setCustomCategory("");
    }
  }, [editingProduct, isOpen]);

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
      setFormData((prev) => ({ ...prev, category: trimmed }));
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
      toast.error("Please enter a valid price greater than 0");
      return;
    }

    const selectedCategory = isCustomCategory ? customCategory.trim() : formData.category;
    if (!selectedCategory) {
      toast.error("Please select or enter a category");
      return;
    }

    setSubmitting(true);
    try {
      const stockNum = formData.stock !== "" ? Math.max(0, parseInt(formData.stock, 10)) : 0;
      const thresholdNum = formData.lowStockThreshold !== "" ? Math.max(1, parseInt(formData.lowStockThreshold, 10)) : 10;

      const payload = {
        name: formData.name.trim(),
        price: priceNum,
        category: selectedCategory,
        description: formData.description.trim(),
        image: formData.image || imagePreview || "",
        stock: isNaN(stockNum) ? 0 : stockNum,
        lowStockThreshold: isNaN(thresholdNum) ? 10 : thresholdNum,
        inStock: Boolean(formData.inStock),
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

            {/* Category & Price Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsManagingCategories((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e8703b] hover:text-[#d65f29] hover:underline transition cursor-pointer"
                  >
                    <FolderTree className="w-3 h-3" />
                    <span>{isManagingCategories ? "Close Manager" : "Manage / Delete"}</span>
                  </button>
                </div>

                {!isCustomCategory ? (
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === "__NEW__") {
                          setIsCustomCategory(true);
                          setCustomCategory("");
                        } else {
                          setFormData({ ...formData, category: e.target.value });
                        }
                      }}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent transition"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__NEW__">+ Add Custom Category...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter new category name"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddNewCategory(customCategory);
                        }
                      }}
                      className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddNewCategory(customCategory)}
                      disabled={isCreatingCategory || !customCategory.trim()}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60"
                    >
                      {isCreatingCategory ? "Saving..." : "Add & Select"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Selling Price (₹) <span className="text-rose-500">*</span>
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
                    placeholder="99.00"
                    className="w-full pl-8 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent transition font-semibold"
                  />
                </div>
              </div>
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
                              ? "bg-orange-50 border-orange-200 text-[#e8703b]"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat })}
                            className="cursor-pointer hover:underline"
                            title="Select this category"
                          >
                            {cat}
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
