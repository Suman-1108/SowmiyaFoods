import React, { useState, useEffect, useMemo } from "react";
import {
  Boxes,
  Package,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Minus,
  Save,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  Check,
  Edit2,
  Image as ImageIcon,
  ExternalLink,
  BellRing,
  Users,
  Mail,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  getAllProducts,
  updateProductStock,
  toggleProductStock,
  createProduct,
  updateProduct,
  getLowStockAlerts,
} from "../../api/productApi";
import ProductModal from "../../components/admin/ProductModal";
import TableSortControl from "../../components/admin/TableSortControl";

const INVENTORY_SORT_OPTIONS = [
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
  { value: "stock_desc", label: "Highest Stock First" },
  { value: "stock_asc", label: "Lowest Stock First" },
  { value: "price_desc", label: "Highest Price First" },
  { value: "price_asc", label: "Lowest Price First" },
  { value: "newest", label: "Recent First (Newest)" },
  { value: "oldest", label: "Oldest First" },
];

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [customerAlerts, setCustomerAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, LOW_STOCK, OUT_OF_STOCK, IN_STOCK, WAITLIST
  const [sortBy, setSortBy] = useState("name_asc");

  // Modal State for full product edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Local draft stock state for inline editing: { [productId]: { stock: number, threshold: number, isEditing: boolean, saving: boolean } }
  const [stockDrafts, setStockDrafts] = useState({});

  const token = localStorage.getItem("token");

  // Fetch products & customer restock alerts
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [dataResult, alertsResult] = await Promise.allSettled([
        getAllProducts(),
        getLowStockAlerts(),
      ]);

      const data = dataResult.status === "fulfilled" ? dataResult.value : [];
      const list = Array.isArray(data) ? data : data?.products || [];
      setProducts(list);

      if (alertsResult.status === "fulfilled" && alertsResult.value?.customerAlerts) {
        setCustomerAlerts(alertsResult.value.customerAlerts);
      }

      // Initialize drafts
      const drafts = {};
      list.forEach((p) => {
        drafts[p._id] = {
          stock: p.stock ?? 0,
          lowStockThreshold: p.lowStockThreshold ?? 10,
          isSaving: false,
        };
      });
      setStockDrafts(drafts);
    } catch (err) {
      console.error("Failed to load inventory", err);
      toast.error("Failed to load inventory items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    const handleExternalUpdate = () => {
      fetchInventory();
    };
    window.addEventListener("inventoryUpdated", handleExternalUpdate);
    return () => window.removeEventListener("inventoryUpdated", handleExternalUpdate);
  }, []);

  // Compute categories
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
        if (!map[pid]) map[pid] = { count: 0, customers: [] };
        map[pid].count += 1;
        map[pid].customers.push(a);
      }
    });
    return map;
  }, [customerAlerts]);

  // Inventory metrics
  const metrics = useMemo(() => {
    let totalUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let healthyStockCount = 0;
    let totalValuation = 0;

    products.forEach((p) => {
      const stock = Number(p.stock ?? 0);
      const threshold = Number(p.lowStockThreshold ?? 10);
      const price = Number(p.price ?? 0);

      totalUnits += stock;
      totalValuation += stock * price;

      if (stock === 0 || p.inStock === false) {
        outOfStockCount++;
      } else if (stock <= threshold) {
        lowStockCount++;
      } else {
        healthyStockCount++;
      }
    });

    const waitlistProductsCount = Object.keys(customerWaitlistByProduct).length;
    const totalCustomerWaitlist = customerAlerts.length;

    return {
      totalProducts: products.length,
      totalUnits,
      lowStockCount,
      outOfStockCount,
      healthyStockCount,
      totalValuation,
      waitlistProductsCount,
      totalCustomerWaitlist,
    };
  }, [products, customerWaitlistByProduct, customerAlerts]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const stock = Number(p.stock ?? 0);
      const threshold = Number(p.lowStockThreshold ?? 10);
      const isInStock = p.inStock !== false && stock > 0;
      const isLowStock = isInStock && stock <= threshold;
      const isOutOfStock = stock === 0 || p.inStock === false;

      // Status filter
      if (statusFilter === "LOW_STOCK" && !isLowStock) return false;
      if (statusFilter === "OUT_OF_STOCK" && !isOutOfStock) return false;
      if (statusFilter === "IN_STOCK" && (!isInStock || isLowStock)) return false;
      if (statusFilter === "WAITLIST" && !(customerWaitlistByProduct[p._id]?.count > 0)) return false;

      // Category filter
      if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchCat = p.category?.toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      const stockA = Number(a.stock ?? 0);
      const stockB = Number(b.stock ?? 0);
      const priceA = Number(a.price ?? 0);
      const priceB = Number(b.price ?? 0);

      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "name_desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (sortBy === "stock_desc") {
        return stockB - stockA;
      }
      if (sortBy === "stock_asc") {
        return stockA - stockB;
      }
      if (sortBy === "price_desc") {
        return priceB - priceA;
      }
      if (sortBy === "price_asc") {
        return priceA - priceB;
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      // default: newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [products, statusFilter, selectedCategory, searchQuery, customerWaitlistByProduct, sortBy]);

  // Handle draft stock input changes
  const handleStockChange = (productId, field, value) => {
    setStockDrafts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: Number(value),
      },
    }));
  };

  // Quick increment / decrement
  const handleQuickAdjust = (productId, delta) => {
    setStockDrafts((prev) => {
      const current = prev[productId]?.stock ?? 0;
      const next = Math.max(0, current + delta);
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          stock: next,
        },
      };
    });
  };

  // Save inline stock changes
  const handleSaveStock = async (product) => {
    const draft = stockDrafts[product._id];
    if (!draft) return;

    const newStock = Math.max(0, Number(draft.stock) || 0);
    const newThreshold = Math.max(1, Number(draft.lowStockThreshold) || 10);
    const newInStock = newStock > 0 ? (product.inStock !== false) : false;

    // Set saving state
    setStockDrafts((prev) => ({
      ...prev,
      [product._id]: { ...prev[product._id], isSaving: true },
    }));

    try {
      await updateProductStock(product._id, {
        stock: newStock,
        lowStockThreshold: newThreshold,
        inStock: newInStock,
      });

      // Update in products list
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? { ...p, stock: newStock, lowStockThreshold: newThreshold, inStock: newInStock }
            : p
        )
      );

      toast.success(`Stock updated for ${product.name} (${newStock} units)`);

      // Notify other components (Header notification bell, sidebar, etc.)
      window.dispatchEvent(new CustomEvent("inventoryUpdated"));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update stock");
    } finally {
      setStockDrafts((prev) => ({
        ...prev,
        [product._id]: { ...prev[product._id], isSaving: false },
      }));
    }
  };

  // Quick Restock helper (+10, +25, +50)
  const handleQuickAddAndSave = async (product, addAmount) => {
    const currentStock = Number(product.stock ?? 0);
    const newStock = currentStock + addAmount;
    const threshold = Number(product.lowStockThreshold ?? 10);

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p._id === product._id ? { ...p, stock: newStock, inStock: true } : p
      )
    );
    setStockDrafts((prev) => ({
      ...prev,
      [product._id]: { ...prev[product._id], stock: newStock },
    }));

    try {
      await updateProductStock(product._id, {
        stock: newStock,
        lowStockThreshold: threshold,
        inStock: true,
      });
      toast.success(`Restocked +${addAmount} units for ${product.name}`);
      window.dispatchEvent(new CustomEvent("inventoryUpdated"));
    } catch (err) {
      toast.error("Failed to restock");
      fetchInventory();
    }
  };

  // Toggle inStock flag
  const handleToggleStockStatus = async (product) => {
    const nextInStock = product.inStock === false ? true : false;
    try {
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, inStock: nextInStock } : p))
      );
      await toggleProductStock(product._id, nextInStock, token);
      toast.success(`Product is now ${nextInStock ? "Active / In Stock" : "Disabled / Out of Stock"}`);
      window.dispatchEvent(new CustomEvent("inventoryUpdated"));
    } catch (err) {
      toast.error("Failed to toggle status");
      fetchInventory();
    }
  };

  // Save product from full modal
  const handleSaveModalProduct = async (payload, id) => {
    if (id) {
      await updateProduct(id, payload);
      toast.success("Product updated successfully");
    } else {
      await createProduct(payload);
      toast.success("Product created successfully");
    }
    fetchInventory();
    window.dispatchEvent(new CustomEvent("inventoryUpdated"));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#e8703b] border border-orange-200/80 flex items-center justify-center shadow-xs">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Inventory & Stock Management
                {metrics.lowStockCount + metrics.outOfStockCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {metrics.lowStockCount + metrics.outOfStockCount} Alerts
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time stock counts, low-stock threshold triggers, and quick restock controls
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchInventory}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2 text-xs font-semibold"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#e8703b]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/portal/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
          >
            <Package className="w-4 h-4 text-slate-500" />
            <span>Product Catalog</span>
          </Link>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] shadow-md shadow-orange-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Available Units */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-orange-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Units in Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#e8703b] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {metrics.totalUnits.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400">units available</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">{metrics.totalProducts}</span> total catalog products
          </div>
        </div>

        {/* Metric 2: Healthy Stock Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Healthy Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {metrics.healthyStockCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">products optimal</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
            <span>Above warning thresholds</span>
          </div>
        </div>

        {/* Metric 3: Low Stock Warnings */}
        <div
          onClick={() => setStatusFilter(statusFilter === "LOW_STOCK" ? "ALL" : "LOW_STOCK")}
          className={`p-5 rounded-2xl border shadow-xs relative overflow-hidden group transition cursor-pointer ${
            statusFilter === "LOW_STOCK"
              ? "bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/40"
              : "bg-white border-amber-200 hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Low Stock Alert
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {metrics.lowStockCount}
            </span>
            <span className="text-xs font-semibold text-amber-700">products low</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <span>≤ low-stock alert threshold</span>
            <span className="text-amber-500 underline ml-auto">Click to filter</span>
          </div>
        </div>

        {/* Metric 4: Out of Stock */}
        <div
          onClick={() => setStatusFilter(statusFilter === "OUT_OF_STOCK" ? "ALL" : "OUT_OF_STOCK")}
          className={`p-5 rounded-2xl border shadow-xs relative overflow-hidden group transition cursor-pointer ${
            statusFilter === "OUT_OF_STOCK"
              ? "bg-rose-50/70 border-rose-400 ring-2 ring-rose-400/40"
              : "bg-white border-rose-200 hover:border-rose-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Out of Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">
              {metrics.outOfStockCount}
            </span>
            <span className="text-xs font-semibold text-rose-700">products empty</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-700 font-semibold flex items-center gap-1">
            <span>Unavailable to shoppers</span>
            <span className="text-rose-500 underline ml-auto">Click to filter</span>
          </div>
        </div>
      </div>

      {/* Low Stock Urgent Notification Bar if alerts exist */}
      {metrics.lowStockCount + metrics.outOfStockCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Action Required: {metrics.lowStockCount + metrics.outOfStockCount} items need stock replenishment!
              </p>
              <p className="text-[11px] text-slate-600">
                {metrics.outOfStockCount > 0 && `${metrics.outOfStockCount} out-of-stock items `}
                {metrics.outOfStockCount > 0 && metrics.lowStockCount > 0 && "and "}
                {metrics.lowStockCount > 0 && `${metrics.lowStockCount} items below their alert threshold`}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {statusFilter !== "LOW_STOCK" && metrics.lowStockCount > 0 && (
              <button
                onClick={() => setStatusFilter("LOW_STOCK")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition cursor-pointer shadow-xs"
              >
                Show Low Stock ({metrics.lowStockCount})
              </button>
            )}
            {statusFilter !== "OUT_OF_STOCK" && metrics.outOfStockCount > 0 && (
              <button
                onClick={() => setStatusFilter("OUT_OF_STOCK")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer shadow-xs"
              >
                Show Out of Stock ({metrics.outOfStockCount})
              </button>
            )}
            {statusFilter !== "WAITLIST" && metrics.totalCustomerWaitlist > 0 && (
              <button
                onClick={() => setStatusFilter("WAITLIST")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 transition cursor-pointer shadow-xs flex items-center gap-1"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Waitlist ({metrics.totalCustomerWaitlist})</span>
              </button>
            )}
            {statusFilter !== "ALL" && (
              <button
                onClick={() => setStatusFilter("ALL")}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-[#0f172a] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter("LOW_STOCK")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "LOW_STOCK"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock ({metrics.lowStockCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter("OUT_OF_STOCK")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "OUT_OF_STOCK"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Out of Stock ({metrics.outOfStockCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter("WAITLIST")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "WAITLIST"
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100"
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Customer Waitlist ({metrics.totalCustomerWaitlist || 0})</span>
          </button>
          <button
            onClick={() => setStatusFilter("IN_STOCK")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "IN_STOCK"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Healthy Stock ({metrics.healthyStockCount})</span>
          </button>
        </div>

        {/* Search & Category Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by product name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] transition"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
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

            <TableSortControl
              value={sortBy}
              onChange={setSortBy}
              options={INVENTORY_SORT_OPTIONS}
              label="Sort inventory items"
            />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-4 min-w-[220px]">Product & SKU</th>
                <th className="py-3.5 px-4 min-w-[100px]">Price</th>
                <th className="py-3.5 px-4 min-w-[140px]">Stock Status</th>
                <th className="py-3.5 px-4 min-w-[220px]">Inline Stock Control</th>
                <th className="py-3.5 px-4 min-w-[140px]">Alert Trigger</th>
                <th className="py-3.5 px-4 min-w-[160px]">Quick Restock</th>
                <th className="py-3.5 px-4 text-right min-w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-[#e8703b]" />
                    <span className="text-sm font-semibold">Loading live inventory...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-700">No inventory items match filter</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing filters or changing search keywords
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const draft = stockDrafts[product._id] || {
                    stock: product.stock ?? 0,
                    lowStockThreshold: product.lowStockThreshold ?? 10,
                    isSaving: false,
                  };

                  const currentStock = Number(product.stock ?? 0);
                  const threshold = Number(product.lowStockThreshold ?? 10);
                  const isOutOfStock = currentStock === 0 || product.inStock === false;
                  const isLowStock = !isOutOfStock && currentStock <= threshold;
                  const isHealthy = !isOutOfStock && !isLowStock;

                  const hasUnsavedChanges =
                    draft.stock !== currentStock || draft.lowStockThreshold !== threshold;

                  return (
                    <tr
                      key={product._id}
                      className={`hover:bg-slate-50/70 transition group ${
                        isOutOfStock
                          ? "bg-rose-50/20"
                          : isLowStock
                          ? "bg-amber-50/20"
                          : ""
                      }`}
                    >
                      {/* Product Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-300" />
                            )}
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-rose-900/60 flex items-center justify-center">
                                <span className="text-[9px] text-white font-bold uppercase tracking-wider">Empty</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#e8703b] transition-colors truncate max-w-[200px] sm:max-w-xs">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                {product.category || "General"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {product._id?.slice(-6)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          ₹{Number(product.price).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Val: ₹{(currentStock * Number(product.price || 0)).toFixed(0)}
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Out of Stock (0)</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Low: {currentStock} left</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{currentStock} units in stock</span>
                          </span>
                        )}

                        {customerWaitlistByProduct[product._id]?.count > 0 && (
                          <div className="mt-1">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200 animate-pulse"
                              title={`${customerWaitlistByProduct[product._id].count} customer(s) waiting for restock notification`}
                            >
                              <BellRing className="w-2.5 h-2.5 text-orange-600" />
                              <span>
                                {customerWaitlistByProduct[product._id].count} Waiting
                              </span>
                            </span>
                          </div>
                        )}

                        <div className="mt-1">
                          <button
                            onClick={() => handleToggleStockStatus(product)}
                            className={`text-[10px] font-semibold underline transition cursor-pointer ${
                              product.inStock !== false
                                ? "text-slate-400 hover:text-rose-600"
                                : "text-emerald-600 hover:text-emerald-800 font-bold"
                            }`}
                          >
                            {product.inStock !== false ? "Disable item" : "Enable item"}
                          </button>
                        </div>
                      </td>

                      {/* Inline Stock Quantity Control */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {/* Decrement */}
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product._id, -1)}
                            disabled={draft.stock <= 0}
                            className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                            title="Decrement 1 unit"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          {/* Numeric input */}
                          <input
                            type="number"
                            min="0"
                            value={draft.stock}
                            onChange={(e) =>
                              handleStockChange(product._id, "stock", e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveStock(product);
                            }}
                            className={`w-20 px-2 py-1 text-center font-bold text-xs sm:text-sm rounded-lg border transition ${
                              hasUnsavedChanges
                                ? "bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/20"
                                : isOutOfStock
                                ? "bg-rose-50 border-rose-200 text-rose-900"
                                : isLowStock
                                ? "bg-amber-50 border-amber-200 text-amber-900"
                                : "bg-slate-50 border-slate-200 text-slate-800"
                            } focus:outline-none focus:ring-2 focus:ring-[#e8703b]`}
                          />

                          {/* Increment */}
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product._id, +1)}
                            className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
                            title="Increment 1 unit"
                          >
                            <Plus className="w-3 h-3" />
                          </button>

                          {/* Save Button */}
                          <button
                            type="button"
                            onClick={() => handleSaveStock(product)}
                            disabled={draft.isSaving}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              hasUnsavedChanges
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                            }`}
                            title={hasUnsavedChanges ? "Save changes" : "Saved"}
                          >
                            {draft.isSaving ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">
                              {hasUnsavedChanges ? "Save" : ""}
                            </span>
                          </button>
                        </div>
                        {hasUnsavedChanges && (
                          <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                            ● Unsaved changes (press Save or Enter)
                          </span>
                        )}
                      </td>

                      {/* Low Stock Alert Threshold */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-[11px]">≤</span>
                          <input
                            type="number"
                            min="1"
                            value={draft.lowStockThreshold}
                            onChange={(e) =>
                              handleStockChange(product._id, "lowStockThreshold", e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveStock(product);
                            }}
                            className="w-14 px-1.5 py-1 text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e8703b]"
                            title="Alert triggers when stock reaches or drops below this number"
                          />
                          <span className="text-slate-400 text-[10px]">units</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Alert threshold
                        </span>
                      </td>

                      {/* Quick Restock Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickAddAndSave(product, 10)}
                            className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-orange-50 hover:text-[#e8703b] border border-slate-200 transition cursor-pointer"
                            title="Quickly add +10 units"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleQuickAddAndSave(product, 25)}
                            className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-orange-50 hover:text-[#e8703b] border border-slate-200 transition cursor-pointer"
                            title="Quickly add +25 units"
                          >
                            +25
                          </button>
                          <button
                            onClick={() => handleQuickAddAndSave(product, 50)}
                            className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-orange-50 hover:text-[#e8703b] border border-slate-200 transition cursor-pointer"
                            title="Quickly add +50 units"
                          >
                            +50
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#e8703b] hover:bg-orange-50 transition cursor-pointer"
                          title="Full Edit in Product Modal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModalProduct}
        product={editingProduct}
      />
    </div>
  );
};

export default AdminInventory;
