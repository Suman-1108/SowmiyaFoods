import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  Boxes,
  BellRing,
  UploadCloud,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStock,
  getLowStockAlerts,
} from "../../api/productApi";
import ProductModal from "../../components/admin/ProductModal";
import BulkImportModal from "../../components/admin/BulkImportModal";
import TableSortControl from "../../components/admin/TableSortControl";

const PRODUCT_SORT_OPTIONS = [
  { value: "newest", label: "Recent First (Newest)" },
  { value: "oldest", label: "Oldest First" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
  { value: "price_desc", label: "Highest Price First" },
  { value: "price_asc", label: "Lowest Price First" },
  { value: "stock_desc", label: "Highest Stock First" },
  { value: "stock_asc", label: "Lowest Stock First" },
];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [customerAlerts, setCustomerAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Delete Confirmation State
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const token = localStorage.getItem("token");

  const fetchProductsList = async () => {
    setLoading(true);
    try {
      const [dataRes, alertsRes] = await Promise.allSettled([
        getAllProducts(),
        getLowStockAlerts(),
      ]);
      const data = dataRes.status === "fulfilled" ? dataRes.value : [];
      const list = Array.isArray(data) ? data : data?.products || [];
      setProducts(list);

      if (alertsRes.status === "fulfilled" && alertsRes.value?.customerAlerts) {
        setCustomerAlerts(alertsRes.value.customerAlerts);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();

    const handleUpdate = () => fetchProductsList();
    window.addEventListener("inventoryUpdated", handleUpdate);
    return () => window.removeEventListener("inventoryUpdated", handleUpdate);
  }, []);

  // Collect available unique categories
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Map customer waitlist requests by product ID
  const customerWaitlistByProduct = useMemo(() => {
    const map = {};
    customerAlerts.forEach((a) => {
      const pid = typeof a.product === "object" ? a.product?._id : a.product;
      if (pid) {
        map[pid] = (map[pid] || 0) + 1;
      }
    });
    return map;
  }, [customerAlerts]);

  // Filtered and sorted products list
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || p.category === selectedCategory;

      const matchesStock =
        stockFilter === "ALL" ||
        (stockFilter === "IN_STOCK" && p.inStock !== false) ||
        (stockFilter === "OUT_OF_STOCK" && p.inStock === false);

      return matchesSearch && matchesCategory && matchesStock;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "name_desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (sortBy === "price_desc") {
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      }
      if (sortBy === "price_asc") {
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      }
      if (sortBy === "stock_desc") {
        return (Number(b.stock) || 0) - (Number(a.stock) || 0);
      }
      if (sortBy === "stock_asc") {
        return (Number(a.stock) || 0) - (Number(b.stock) || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      // default: newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy]);

  // Handle Save (Add or Update)
  const handleSaveProduct = async (payload, id) => {
    try {
      if (id) {
        await updateProduct(id, payload);
        toast.success("Product updated successfully");
      } else {
        await createProduct(payload);
        toast.success("Product created successfully");
      }
      fetchProductsList();
      window.dispatchEvent(new CustomEvent("inventoryUpdated"));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save product";
      toast.error(msg);
      throw err;
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deletingProduct._id);
      toast.success("Product deleted successfully");
      setDeletingProduct(null);
      fetchProductsList();
      window.dispatchEvent(new CustomEvent("inventoryUpdated"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Stock Status
  const handleToggleStock = async (product) => {
    const newStock = product.inStock === false ? true : false;
    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, inStock: newStock } : p))
      );
      await toggleProductStock(product._id, newStock, token);
      toast.success(`Marked as ${newStock ? "In Stock" : "Out of Stock"}`);
      window.dispatchEvent(new CustomEvent("inventoryUpdated"));
    } catch (err) {
      toast.error("Failed to update stock status");
      fetchProductsList();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Products Catalog ({products.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your store items, grain flours, pricing, and live inventory
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProductsList}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh product list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#e8703b]" : ""}`} />
          </button>
          <Link
            to="/portal/inventory"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
          >
            <Boxes className="w-4 h-4 text-[#e8703b]" />
            <span>Manage Inventory</span>
          </Link>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition cursor-pointer"
            title="Import products in bulk from Excel/CSV"
          >
            <UploadCloud className="w-4 h-4 text-[#e8703b]" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] shadow-md shadow-orange-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by product name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] font-medium"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] font-medium text-slate-700"
          >
            <option value="ALL">All Stock Status</option>
            <option value="IN_STOCK">In Stock Only</option>
            <option value="OUT_OF_STOCK">Out of Stock Only</option>
          </select>

          {/* Sort Dropdown */}
          <TableSortControl
            value={sortBy}
            onChange={setSortBy}
            options={PRODUCT_SORT_OPTIONS}
            label="Sort products"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock & Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#e8703b]" />
                    <span>Loading products catalog...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-600">No products found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your search or category filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isInStock = product.inStock !== false;
                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-slate-50/60 transition group"
                    >
                      {/* Product details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#e8703b] transition-colors truncate max-w-xs sm:max-w-md">
                              {product.name}
                            </h4>
                            {product.description && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md mt-0.5">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {product.category || "General"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 text-sm">
                          ₹{Number(product.price).toFixed(2)}
                        </span>
                      </td>

                      {/* Stock Status & Units */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {product.stock === 0 || !isInStock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>0 units (Out)</span>
                              </span>
                            ) : product.stock <= (product.lowStockThreshold || 10) ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>{product.stock} units (Low)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{product.stock} in stock</span>
                              </span>
                            )}

                            {customerWaitlistByProduct[product._id] > 0 && (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200 animate-pulse"
                                title={`${customerWaitlistByProduct[product._id]} customer(s) waiting for restock`}
                              >
                                <BellRing className="w-2.5 h-2.5 text-orange-600" />
                                <span>{customerWaitlistByProduct[product._id]} Waiting</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStock(product)}
                              className={`text-[10px] font-semibold underline transition cursor-pointer ${
                                isInStock
                                  ? "text-slate-400 hover:text-rose-600"
                                  : "text-emerald-600 hover:text-emerald-800 font-bold"
                              }`}
                              title="Click to toggle availability"
                            >
                              {isInStock ? "Toggle Out" : "Mark In Stock"}
                            </button>
                            <span className="text-[10px] text-slate-300">|</span>
                            <span className="text-[10px] text-slate-400">
                              Alert: ≤{product.lowStockThreshold || 10}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#e8703b] hover:bg-orange-50 transition cursor-pointer"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        availableCategories={categories}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImportSuccess={fetchProductsList}
        availableCategories={categories}
      />

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setDeletingProduct(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Product?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-slate-800">
                  "{deletingProduct.name}"
                </span>
                ? This action cannot be undone.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeletingProduct(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition cursor-pointer disabled:opacity-60"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
