import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  RefreshCw,
  Truck,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  X,
  Send,
  Save,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Package,
  Tag,
  CreditCard,
  Calendar,
  User,
  Hash,
  ArrowRight,
  Download,
  AlertCircle,
  FileText,
  Boxes,
  TrendingUp,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllOrders, updateOrderStatus, deleteOrder } from "../../api/orderApi";
import TableSortControl from "../../components/admin/TableSortControl";

const ORDER_SORT_OPTIONS = [
  { value: "newest", label: "Recent First (Newest Order)" },
  { value: "oldest", label: "Oldest Order First" },
  { value: "name_asc", label: "Customer Name: A to Z" },
  { value: "name_desc", label: "Customer Name: Z to A" },
  { value: "amount_desc", label: "Highest Order Amount First" },
  { value: "amount_asc", label: "Lowest Order Amount First" },
];

const STATUS_OPTIONS = [
  { value: "paid", label: "Paid / Confirmed", color: "bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20" },
  { value: "processing", label: "Processing", color: "bg-blue-50 text-blue-800 border-blue-200 ring-blue-500/20" },
  { value: "shipped", label: "Shipped", color: "bg-purple-50 text-purple-800 border-purple-200 ring-purple-500/20" },
  { value: "delivered", label: "Delivered", color: "bg-emerald-50 text-emerald-800 border-emerald-200 ring-emerald-500/20" },
  { value: "cancelled", label: "Cancelled", color: "bg-rose-50 text-rose-800 border-rose-200 ring-rose-500/20" },
];

const CATEGORY_COLORS = {
  FLOUR: "bg-amber-100 text-amber-900 border-amber-200",
  "Millet Products": "bg-emerald-100 text-emerald-900 border-emerald-200",
  VERMICELLI: "bg-indigo-100 text-indigo-900 border-indigo-200",
  Sooji: "bg-orange-100 text-orange-900 border-orange-200",
  "INSTANT PRODUCTS": "bg-cyan-100 text-cyan-900 border-cyan-200",
  pickles: "bg-rose-100 text-rose-900 border-rose-200",
};

const getCustomerInfo = (order) => {
  const addr = order?.address || order?.shippingAddress || {};
  const name = addr.fullName || addr.name || order?.user?.name || "Customer";
  const phone = addr.phone || order?.user?.phone || "N/A";
  const email = order?.customerEmail || addr.email || order?.user?.email || "N/A";
  const street = addr.address || addr.street || addr.addressLine1 || "";
  const city = addr.city || "";
  const state = addr.state || "";
  const pincode = addr.pincode || addr.postalCode || "";

  const fullAddress = [street, city, state, pincode].filter(Boolean).join(", ") || "No address specified";

  return { name, phone, email, street, city, state, pincode, fullAddress };
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  // Status & Tracking update states per order
  const [statusUpdates, setStatusUpdates] = useState({});
  const [trackingUpdates, setTrackingUpdates] = useState({});
  const [savingOrderId, setSavingOrderId] = useState(null);

  // Selected Order for Detail Modal
  const [viewingOrder, setViewingOrder] = useState(null);

  // Delete Order Confirmation State
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  // Copy helper feedback state
  const [copiedKey, setCopiedKey] = useState(null);

  const printRef = useRef(null);
  const token = localStorage.getItem("token");

  const handleConfirmDeleteOrder = async () => {
    if (!deletingOrder) return;
    setIsDeletingOrder(true);
    try {
      await deleteOrder(deletingOrder._id, token);
      const displayId = deletingOrder.orderId || `#ORD-${deletingOrder._id?.slice(-6).toUpperCase()}`;
      toast.success(`Order ${displayId} deleted successfully`);
      setOrders((prev) => prev.filter((o) => o._id !== deletingOrder._id));
      if (viewingOrder?._id === deletingOrder._id) {
        setViewingOrder(null);
      }
      setDeletingOrder(null);
    } catch (err) {
      console.error("Delete order failed:", err);
      toast.error(err.response?.data?.message || "Failed to delete order");
    } finally {
      setIsDeletingOrder(false);
    }
  };

  const fetchOrdersList = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders(token);
      const list = Array.isArray(data) ? data : [];
      setOrders(list);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to fetch customer orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersList();
  }, []);

  const handleCopy = (text, keyName, label = "Text") => {
    if (!text || text === "N/A") return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Collect all unique baking/packaging categories across all orders
  const availableCategories = useMemo(() => {
    const set = new Set();
    orders.forEach((o) => {
      (o.products || o.items || []).forEach((p) => {
        if (p.category) set.add(p.category);
      });
    });
    return Array.from(set);
  }, [orders]);

  // Executive summary metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let pendingCount = 0;
    let deliveredCount = 0;
    let processingCount = 0;

    orders.forEach((o) => {
      const amt = Number(o.totalAmount || o.amount || 0);
      totalRevenue += amt;
      const st = (o.status || "paid").toLowerCase();
      if (st === "delivered") deliveredCount++;
      else if (st === "processing" || st === "shipped") processingCount++;
      else if (st === "paid") pendingCount++;
    });

    return {
      totalOrders: orders.length,
      totalRevenue,
      pendingCount,
      processingCount,
      deliveredCount,
    };
  }, [orders]);

  // Filtered and sorted orders list
  const filteredOrders = useMemo(() => {
    const list = orders.filter((order) => {
      const orderId = (order.orderId || order._id || "").toLowerCase();
      const paymentId = (order.paymentId || "").toLowerCase();
      const customer = getCustomerInfo(order);
      const customerName = customer.name.toLowerCase();
      const phone = customer.phone.toLowerCase();
      const email = customer.email.toLowerCase();
      const city = customer.city.toLowerCase();

      // Collect product names and categories
      const prods = order.products || order.items || [];
      const productNames = prods.map((p) => (p.name || "").toLowerCase()).join(" ");
      const productCategories = prods.map((p) => (p.category || "").toLowerCase()).join(" ");

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        orderId.includes(q) ||
        paymentId.includes(q) ||
        customerName.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        city.includes(q) ||
        productNames.includes(q) ||
        productCategories.includes(q);

      const status = (order.status || "paid").toLowerCase();
      const matchesStatus =
        selectedStatus === "ALL" || status === selectedStatus.toLowerCase();

      const matchesCategory =
        selectedCategory === "ALL" ||
        prods.some((p) => p.category === selectedCategory);

      return matchesSearch && matchesStatus && matchesCategory;
    });

    return [...list].sort((a, b) => {
      const custA = getCustomerInfo(a);
      const custB = getCustomerInfo(b);
      const amtA = Number(a.totalAmount || a.amount || 0);
      const amtB = Number(b.totalAmount || b.amount || 0);
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);

      if (sortBy === "name_asc") {
        return (custA.name || "").localeCompare(custB.name || "");
      }
      if (sortBy === "name_desc") {
        return (custB.name || "").localeCompare(custA.name || "");
      }
      if (sortBy === "amount_desc") {
        return amtB - amtA;
      }
      if (sortBy === "amount_asc") {
        return amtA - amtB;
      }
      if (sortBy === "oldest") {
        return dateA - dateB;
      }
      // default: newest
      return dateB - dateA;
    });
  }, [orders, searchQuery, selectedStatus, selectedCategory, sortBy]);

  const handleSaveOrder = async (orderId) => {
    const newStatus = statusUpdates[orderId];
    const newTracking = trackingUpdates[orderId];

    if (!newStatus && (newTracking === undefined || newTracking === "")) {
      toast.error("No changes made to save");
      return;
    }

    setSavingOrderId(orderId);
    try {
      const payload = {};
      if (newStatus) payload.status = newStatus;
      if (newTracking !== undefined) payload.trackingNumber = newTracking;

      await updateOrderStatus(orderId, payload, token);
      toast.success("Order updated successfully!");
      fetchOrdersList();

      if (viewingOrder && viewingOrder._id === orderId) {
        setViewingOrder((prev) => ({
          ...prev,
          ...(newStatus ? { status: newStatus } : {}),
          ...(newTracking !== undefined ? { trackingNumber: newTracking } : {}),
        }));
      }

      setStatusUpdates((prev) => ({ ...prev, [orderId]: undefined }));
      setTrackingUpdates((prev) => ({ ...prev, [orderId]: undefined }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setSavingOrderId(null);
    }
  };

  const getStatusBadgeClass = (status = "paid") => {
    const found = STATUS_OPTIONS.find((s) => s.value === status.toLowerCase());
    return found ? found.color : "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Export filtered orders to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error("No orders to export");
      return;
    }

    const headers = [
      "Order ID",
      "Razorpay Order ID",
      "Transaction / Payment ID",
      "Payment Method",
      "Customer Name",
      "Customer Phone",
      "Customer Email",
      "Shipping Address",
      "City",
      "State",
      "Pincode",
      "Ordered Items (Qty - Category - Price)",
      "Total Amount (INR)",
      "Order Status",
      "Courier Tracking ID",
      "Order Date",
    ];

    const rows = filteredOrders.map((o) => {
      const customer = getCustomerInfo(o);
      const itemsDetail = (o.products || o.items || [])
        .map(
          (p) =>
            `${p.name} (Qty: ${p.quantity || 1}, Cat: ${p.category || "General"}, Price: ₹${p.price || 0})`
        )
        .join("; ");

      return [
        o._id,
        o.orderId || "N/A",
        o.paymentId || "N/A",
        o.paymentMethod || "Razorpay",
        `"${customer.name}"`,
        `"${customer.phone}"`,
        `"${customer.email}"`,
        `"${customer.fullAddress.replace(/"/g, '""')}"`,
        `"${customer.city}"`,
        `"${customer.state}"`,
        `"${customer.pincode}"`,
        `"${itemsDetail.replace(/"/g, '""')}"`,
        Number(o.totalAmount || o.amount || 0).toFixed(2),
        (o.status || "paid").toUpperCase(),
        o.trackingNumber || "N/A",
        new Date(o.createdAt || o.date || Date.now()).toLocaleDateString("en-IN"),
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SowmiyaFoods_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders exported to CSV successfully!");
  };

  // Print invoice helper
  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#e8703b] border border-orange-200/80 flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Orders Management
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {orders.length} Total
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Complete order registry, customer contact info, baking categories, transaction IDs, and delivery status
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchOrdersList}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            title="Refresh order list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#e8703b]" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition cursor-pointer shadow-xs"
            title="Export orders as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Orders */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#e8703b] flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.totalOrders}</span>
            <span className="text-xs font-semibold text-slate-400">placed orders</span>
          </div>
        </div>

        {/* Metric 2: Total Revenue */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">
              ₹{metrics.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Metric 3: Active Fulfillment */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Processing & Shipped
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">
              {metrics.processingCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">orders in transit</span>
          </div>
        </div>

        {/* Metric 4: Successfully Delivered */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Delivered
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600">{metrics.deliveredCount}</span>
            <span className="text-xs font-semibold text-slate-400">completed</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedStatus("ALL")}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              selectedStatus === "ALL"
                ? "bg-[#0f172a] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({orders.length})
          </button>
          {STATUS_OPTIONS.map((st) => {
            const count = orders.filter((o) => (o.status || "paid").toLowerCase() === st.value).length;
            return (
              <button
                key={st.value}
                onClick={() => setSelectedStatus(st.value)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === st.value
                    ? "bg-[#e8703b] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{st.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    selectedStatus === st.value
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Order ID, Transaction/Payment ID, Customer, Phone, Email, or Baking Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] transition"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] font-medium"
                title="Filter by Baking / Packaging Category"
              >
                <option value="ALL">All Categories</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <TableSortControl
              value={sortBy}
              onChange={setSortBy}
              options={ORDER_SORT_OPTIONS}
              label="Sort orders"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-4 min-w-[200px]">Order & Payment ID</th>
                <th className="py-3.5 px-4 min-w-[190px]">Customer Details</th>
                <th className="py-3.5 px-4 min-w-[260px]">Products & Baking Category</th>
                <th className="py-3.5 px-4 min-w-[130px]">Total Amount</th>
                <th className="py-3.5 px-4 min-w-[150px]">Order Status</th>
                <th className="py-3.5 px-4 min-w-[180px]">Courier Tracking</th>
                <th className="py-3.5 px-4 text-right min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-[#e8703b]" />
                    <span className="text-sm font-semibold">Loading orders data...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-700">No matching orders found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try changing your search query, status, or category filters
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const customer = getCustomerInfo(order);
                  const amount = order.totalAmount || order.amount || 0;
                  const currentStatus = order.status || "paid";

                  const activeStatusChoice = statusUpdates[order._id] || currentStatus;
                  const activeTrackingChoice =
                    trackingUpdates[order._id] !== undefined
                      ? trackingUpdates[order._id]
                      : order.trackingNumber || "";

                  const hasChanges =
                    (statusUpdates[order._id] && statusUpdates[order._id] !== currentStatus) ||
                    (trackingUpdates[order._id] !== undefined &&
                      trackingUpdates[order._id] !== (order.trackingNumber || ""));

                  const prods = order.products || order.items || [];
                  const orderDate = new Date(order.createdAt || order.date || Date.now());

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/70 transition group">
                      {/* Column 1: Order ID & Transaction / Payment ID */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {/* Order ID */}
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {order.orderId || `#ORD-${order._id?.slice(-6).toUpperCase()}`}
                            </span>
                            <button
                              onClick={() => handleCopy(order.orderId || order._id, `order_${order._id}`, "Order ID")}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                              title="Copy Order ID"
                            >
                              {copiedKey === `order_${order._id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          {/* Payment / Transaction ID */}
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-slate-400 font-semibold">Txn:</span>
                            <span className="font-mono text-slate-600 truncate max-w-[130px]" title={order.paymentId}>
                              {order.paymentId || "N/A"}
                            </span>
                            {order.paymentId && (
                              <button
                                onClick={() => handleCopy(order.paymentId, `pay_${order._id}`, "Transaction ID")}
                                className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                title="Copy Payment / Transaction ID"
                              >
                                {copiedKey === `pay_${order._id}` ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Date & Time */}
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="w-2.5 h-2.5" />
                            <span>
                              {orderDate.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}{" "}
                              • {orderDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Customer Detail */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate max-w-[160px]">{customer.name}</span>
                          </div>

                          {customer.phone && customer.phone !== "N/A" && (
                            <div className="flex items-center gap-1 text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <a
                                href={`tel:${customer.phone}`}
                                className="text-slate-600 hover:text-[#e8703b] font-mono truncate"
                              >
                                {customer.phone}
                              </a>
                            </div>
                          )}

                          {customer.email && customer.email !== "N/A" && (
                            <div className="flex items-center gap-1 text-[11px]">
                              <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <a
                                href={`mailto:${customer.email}`}
                                className="text-blue-600 hover:underline truncate max-w-[150px]"
                                title={customer.email}
                              >
                                {customer.email}
                              </a>
                            </div>
                          )}

                          {customer.city && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="truncate max-w-[150px]">
                                {customer.city}, {customer.state}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Ordered Products, Quantity & Baking Category */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          {prods.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                {item.img || item.image ? (
                                  <img
                                    src={item.img || item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-800 text-xs truncate max-w-[140px]">
                                    {item.name}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                                    x{item.quantity || 1}
                                  </span>
                                </div>
                                <div className="mt-0.5">
                                  <span
                                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                      CATEGORY_COLORS[item.category] || "bg-slate-100 text-slate-700 border-slate-200"
                                    }`}
                                  >
                                    <Tag className="w-2 h-2" />
                                    <span>{item.category || "General / Baking"}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}

                          {prods.length > 2 && (
                            <div className="text-[10px] text-slate-500 font-semibold pl-1">
                              +{prods.length - 2} more item{prods.length - 2 > 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Total Amount */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-black text-slate-900 text-sm">
                            ₹{Number(amount).toFixed(2)}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {order.paymentMethod || "Razorpay"}
                            </span>
                          </div>
                          {order.deliveryCharge > 0 && (
                            <div className="text-[10px] text-slate-400">
                              Del: ₹{order.deliveryCharge}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 5: Order Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <select
                            value={activeStatusChoice}
                            onChange={(e) =>
                              setStatusUpdates((prev) => ({
                                ...prev,
                                [order._id]: e.target.value,
                              }))
                            }
                            className={`px-2.5 py-1 text-xs font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#e8703b] ${getStatusBadgeClass(
                              activeStatusChoice
                            )}`}
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st.value} value={st.value}>
                                {st.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Column 6: Courier Tracking */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 max-w-[170px]">
                            <Truck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <input
                              type="text"
                              placeholder="Courier AWB / Tracking"
                              value={activeTrackingChoice}
                              onChange={(e) =>
                                setTrackingUpdates((prev) => ({
                                  ...prev,
                                  [order._id]: e.target.value,
                                }))
                              }
                              className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e8703b]"
                            />
                          </div>

                          {hasChanges && (
                            <button
                              onClick={() => handleSaveOrder(order._id)}
                              disabled={savingOrderId === order._id}
                              className="inline-flex items-center gap-1 px-2 py-0.8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold shadow-2xs transition cursor-pointer"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save Changes</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-[#e8703b] hover:text-white transition cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => setDeletingOrder(order)}
                            className="inline-flex items-center gap-1 p-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Comprehensive Order Detail & Invoice Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setViewingOrder(null)}
          />
          <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
            <div
              ref={printRef}
              className="relative bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200"
            >
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#e8703b] border border-orange-200/80 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900">
                        Order Details
                      </h3>
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {viewingOrder.orderId || `#ORD-${viewingOrder._id?.slice(-8).toUpperCase()}`}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(
                          viewingOrder.status || "paid"
                        )}`}
                      >
                        {(viewingOrder.status || "paid").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Placed on {new Date(viewingOrder.createdAt || viewingOrder.date || Date.now()).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintInvoice}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                    title="Print Invoice / Packing Slip"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>

                  <button
                    onClick={() => setDeletingOrder(viewingOrder)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                    title="Delete this order"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => setViewingOrder(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Order Fulfillment Status Workflow Tracker */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Fulfillment Workflow
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Change Status:</span>
                    <select
                      value={statusUpdates[viewingOrder._id] || viewingOrder.status || "paid"}
                      onChange={(e) => {
                        const nextSt = e.target.value;
                        setStatusUpdates((prev) => ({ ...prev, [viewingOrder._id]: nextSt }));
                      }}
                      className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e8703b]"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>

                    {(statusUpdates[viewingOrder._id] || trackingUpdates[viewingOrder._id] !== undefined) && (
                      <button
                        onClick={() => handleSaveOrder(viewingOrder._id)}
                        disabled={savingOrderId === viewingOrder._id}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Update Order</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Step Progress */}
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold pt-1">
                  {[
                    { step: "paid", title: "1. Confirmed" },
                    { step: "processing", title: "2. Packing" },
                    { step: "shipped", title: "3. Dispatched" },
                    { step: "delivered", title: "4. Delivered" },
                  ].map((s, idx) => {
                    const statusSeq = ["paid", "processing", "shipped", "delivered"];
                    const currentIdx = statusSeq.indexOf((viewingOrder.status || "paid").toLowerCase());
                    const isPassed = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div
                        key={s.step}
                        className={`p-2 rounded-xl border transition ${
                          isPassed
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-white text-slate-400 border-slate-200"
                        } ${isCurrent ? "ring-2 ring-emerald-500/40 font-black" : ""}`}
                      >
                        <span>{s.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2-Column Details: Transaction / Payment & Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1: Payment & Transaction Details */}
                <div className="p-4.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Transaction & Payment Info</span>
                  </h4>

                  <div className="space-y-2 pt-1">
                    {/* Razorpay Order ID */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Order ID:</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                        <span>{viewingOrder.orderId || `#ORD-${viewingOrder._id?.slice(-8)}`}</span>
                        <button
                          onClick={() => handleCopy(viewingOrder.orderId || viewingOrder._id, "modal_order", "Order ID")}
                          className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copy"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Razorpay Payment ID / Transaction ID */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Transaction / Payment ID:</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                        <span className="truncate max-w-[150px]">{viewingOrder.paymentId || "N/A"}</span>
                        {viewingOrder.paymentId && (
                          <button
                            onClick={() => handleCopy(viewingOrder.paymentId, "modal_txn", "Transaction ID")}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Copy"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Payment Gateway */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Payment Gateway:</span>
                      <span className="font-bold text-slate-800">{viewingOrder.paymentMethod || "Razorpay"}</span>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Payment Status:</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Captured & Verified
                      </span>
                    </div>

                    {/* Courier Tracking */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Courier Tracking ID:</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{viewingOrder.trackingNumber || "Not assigned yet"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Customer Details & Shipping Address */}
                {(() => {
                  const customer = getCustomerInfo(viewingOrder);
                  return (
                    <div className="p-4.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3 text-xs">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Customer & Shipping Details</span>
                      </h4>

                      <div className="space-y-2 pt-1">
                        {/* Customer Full Name */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Customer Name:</span>
                          <span className="font-bold text-slate-900">{customer.name}</span>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Phone Number:</span>
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${customer.phone}`}
                              className="font-mono font-bold text-slate-800 hover:text-[#e8703b]"
                            >
                              {customer.phone}
                            </a>
                            <button
                              onClick={() => handleCopy(customer.phone, "modal_phone", "Phone number")}
                              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copy"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Email:</span>
                          <div className="flex items-center gap-1">
                            <a
                              href={`mailto:${customer.email}`}
                              className="font-bold text-blue-600 hover:underline truncate max-w-[160px]"
                            >
                              {customer.email}
                            </a>
                            <button
                              onClick={() => handleCopy(customer.email, "modal_email", "Email")}
                              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copy"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="pt-2 border-t border-slate-200 space-y-1">
                          <span className="text-slate-500 font-medium block">Delivery Address:</span>
                          <p className="text-slate-800 leading-relaxed font-medium">
                            {customer.fullAddress}
                          </p>
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(customer.fullAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e8703b] hover:underline pt-0.5"
                          >
                            <span>Open in Google Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Ordered Products Table with Baking Categories & Quantities */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-slate-500" />
                    <span>Ordered Products & Baking Categories</span>
                  </h4>
                  <span className="text-xs text-slate-500 font-semibold">
                    {(viewingOrder.products || viewingOrder.items || []).length} unique item(s)
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3">Baking Category</th>
                        <th className="py-2.5 px-3 text-center">Unit Price</th>
                        <th className="py-2.5 px-3 text-center">Quantity</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(viewingOrder.products || viewingOrder.items || []).map((item, idx) => {
                        const unitPrice = Number(item.price || 0);
                        const qty = Number(item.quantity || 1);
                        const subtotal = Number(item.subtotal || unitPrice * qty);

                        return (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                  {item.img || item.image ? (
                                    <img
                                      src={item.img || item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                                    {item.name}
                                  </div>
                                  {item.productId && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      ID: {item.productId.slice(-6)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Baking Category */}
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                                  CATEGORY_COLORS[item.category] ||
                                  "bg-slate-100 text-slate-700 border-slate-200"
                                }`}
                              >
                                <Tag className="w-2.5 h-2.5" />
                                <span>{item.category || "General / Baking"}</span>
                              </span>
                            </td>

                            {/* Unit Price */}
                            <td className="py-2.5 px-3 text-center font-semibold text-slate-800">
                              ₹{unitPrice.toFixed(2)}
                            </td>

                            {/* Quantity */}
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-900">
                                {qty}
                              </span>
                            </td>

                            {/* Subtotal */}
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              ₹{subtotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Price Breakdown Footer */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold">
                      ₹
                      {(
                        viewingOrder.products ||
                        viewingOrder.items ||
                        []
                      )
                        .reduce((acc, p) => acc + Number(p.subtotal || (p.price || 0) * (p.quantity || 1)), 0)
                        .toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Delivery Charges:</span>
                    <span className="font-semibold">
                      {Number(viewingOrder.deliveryCharge || 0) === 0
                        ? "FREE Delivery"
                        : `₹${Number(viewingOrder.deliveryCharge).toFixed(2)}`}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-900">Total Order Amount:</span>
                    <span className="font-black text-lg text-emerald-600">
                      ₹{Number(viewingOrder.totalAmount || viewingOrder.amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handlePrintInvoice}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Packing Slip</span>
                </button>

                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition cursor-pointer shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setDeletingOrder(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center z-10 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Delete Order?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete order{" "}
                <span className="font-bold font-mono text-slate-800">
                  {deletingOrder.orderId || `#ORD-${deletingOrder._id?.slice(-6).toUpperCase()}`}
                </span>
                ? Customer:{" "}
                <span className="font-semibold text-slate-800">
                  {getCustomerInfo(deletingOrder).name}
                </span>{" "}
                (₹{Number(deletingOrder.totalAmount || deletingOrder.amount || 0).toFixed(2)}).
              </p>
              <p className="text-[11px] text-rose-600 font-semibold mt-2">
                This action is permanent and cannot be undone.
              </p>

              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingOrder(null)}
                  disabled={isDeletingOrder}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteOrder}
                  disabled={isDeletingOrder}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition cursor-pointer disabled:opacity-60"
                >
                  {isDeletingOrder ? "Deleting..." : "Yes, Delete Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
