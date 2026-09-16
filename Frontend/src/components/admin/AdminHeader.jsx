import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  ExternalLink,
  Crown,
  ShieldCheck,
  User,
  Bell,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Boxes,
  ArrowRight,
  Package,
  Mail,
  Phone,
  Clock,
  Trash2,
  BellRing,
  Star,
  MessageSquare,
} from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getLowStockAlerts,
  dismissCustomerNotification,
  dismissReviewAlert,
  deleteProductReview,
} from "../../api/productApi";

const ROLE_LABELS = {
  admin: { label: "Primary Admin", color: "text-purple-600 bg-purple-50 border-purple-200", Icon: Crown },
  manager: { label: "Ops Manager", color: "text-blue-600 bg-blue-50 border-blue-200", Icon: ShieldCheck },
  order_manager: { label: "Order Specialist", color: "text-amber-600 bg-amber-50 border-amber-200", Icon: ShieldCheck },
  catalog_specialist: { label: "Catalog Specialist", color: "text-emerald-600 bg-emerald-50 border-emerald-200", Icon: ShieldCheck },
  viewer: { label: "Viewer", color: "text-slate-600 bg-slate-50 border-slate-200", Icon: User },
  custom: { label: "Custom Role", color: "text-indigo-600 bg-indigo-50 border-indigo-200", Icon: ShieldCheck },
};

const getStoredUser = () => {
  try {
    const str = localStorage.getItem("user");
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
};

const AdminHeader = ({ setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();

  // Notification Alerts State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeAlertTab, setActiveAlertTab] = useState("reviews"); // "reviews" | "customers" | "stock"
  const [dismissingId, setDismissingId] = useState(null);
  const [alertsData, setAlertsData] = useState({
    totalAlerts: 0,
    stockAlertsCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    customerRequestsCount: 0,
    reviewsCount: 0,
    alerts: [],
    customerAlerts: [],
    reviewAlerts: [],
  });
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const dropdownRef = useRef(null);

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const res = await getLowStockAlerts();
      if (res?.success) {
        setAlertsData({
          totalAlerts: res.totalAlerts || 0,
          stockAlertsCount: res.stockAlertsCount || (res.alerts ? res.alerts.length : 0),
          lowStockCount: res.lowStockCount || 0,
          outOfStockCount: res.outOfStockCount || 0,
          customerRequestsCount: res.customerRequestsCount || (res.customerAlerts ? res.customerAlerts.length : 0),
          reviewsCount: res.reviewsCount || (res.reviewAlerts ? res.reviewAlerts.length : 0),
          alerts: res.alerts || [],
          customerAlerts: res.customerAlerts || [],
          reviewAlerts: res.reviewAlerts || [],
        });
      }
    } catch (err) {
      console.error("Failed to load inventory alerts", err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleDismissCustomerAlert = async (e, id) => {
    e.stopPropagation();
    setDismissingId(id);
    try {
      await dismissCustomerNotification(id);
      toast.success("Restock notification dismissed");
      fetchAlerts();
      window.dispatchEvent(new CustomEvent("inventoryUpdated"));
    } catch (err) {
      toast.error("Failed to dismiss alert");
    } finally {
      setDismissingId(null);
    }
  };

  const handleDismissReview = async (e, id) => {
    e.stopPropagation();
    setDismissingId(id);
    try {
      await dismissReviewAlert(id);
      toast.success("Review notification marked as seen");
      fetchAlerts();
      window.dispatchEvent(new CustomEvent("inventoryUpdated"));
    } catch (err) {
      toast.error("Failed to dismiss review alert");
    } finally {
      setDismissingId(null);
    }
  };

  const handleDeleteReview = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this customer review?")) return;
    setDismissingId(id);
    try {
      await deleteProductReview(id);
      toast.success("Review deleted");
      fetchAlerts();
      window.dispatchEvent(new CustomEvent("inventoryUpdated"));
    } catch (err) {
      toast.error("Failed to delete review");
    } finally {
      setDismissingId(null);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const handleInventoryUpdated = () => {
      fetchAlerts();
    };
    window.addEventListener("inventoryUpdated", handleInventoryUpdated);

    // Click outside to close notification dropdown
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("inventoryUpdated", handleInventoryUpdated);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getPageTitle = (pathname) => {
    if (pathname.includes("/portal/products") || pathname.includes("/admin/products")) return "Products Catalog";
    if (pathname.includes("/portal/inventory") || pathname.includes("/admin/inventory")) return "Inventory & Stock Management";
    if (pathname.includes("/portal/orders") || pathname.includes("/admin/orders")) return "Orders Management";
    if (pathname.includes("/portal/razorpay") || pathname.includes("/portal/payments") || pathname.includes("/admin/razorpay")) return "Razorpay Payment Gateway";
    if (pathname.includes("/portal/users") || pathname.includes("/admin/users")) return "Customers & Users";
    if (pathname.includes("/portal/settings") || pathname.includes("/admin/settings")) return "Store Settings";
    if (pathname.includes("/portal/team")) return "Team & Roles";
    return "Dashboard Overview";
  };

  const userRole = user?.role || (user?.isAdmin ? "admin" : "viewer");
  const roleMeta = ROLE_LABELS[userRole] || ROLE_LABELS.viewer;
  const RoleIcon = roleMeta.Icon;

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
            {getPageTitle(location.pathname)}
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
            Sowmiya Foods Admin Console
          </p>
        </div>
      </div>

      {/* Right: Notification Bell + Live Store + Role badge + profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className={`relative p-2 rounded-xl border transition cursor-pointer ${
              notificationsOpen
                ? "bg-orange-50 border-orange-300 text-[#e8703b]"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            title="Stock & Inventory Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {alertsData.totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-sm animate-pulse">
                {alertsData.totalAlerts > 99 ? "99+" : alertsData.totalAlerts}
              </span>
            )}
          </button>

          {/* Notifications Popover Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 sm:right-0 mt-2 w-[340px] sm:w-[440px] bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Dropdown Header */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-[#e8703b] border border-orange-500/30 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Store Notifications</h3>
                    <p className="text-[11px] text-slate-400">
                      {alertsData.totalAlerts === 0
                        ? "All products healthy & up to date"
                        : `${alertsData.reviewsCount} review${alertsData.reviewsCount === 1 ? "" : "s"} • ${alertsData.customerRequestsCount} waitlist • ${alertsData.stockAlertsCount} stock`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={fetchAlerts}
                    disabled={loadingAlerts}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition cursor-pointer"
                    title="Refresh alerts"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingAlerts ? "animate-spin text-orange-400" : ""}`} />
                  </button>
                  {alertsData.totalAlerts > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
                      {alertsData.totalAlerts}
                    </span>
                  )}
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center bg-slate-100 border-b border-slate-200 p-1 gap-1 text-xs font-bold">
                <button
                  onClick={() => setActiveAlertTab("reviews")}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer text-[11px] sm:text-xs ${
                    activeAlertTab === "reviews"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <MessageSquare className={`w-3.5 h-3.5 ${alertsData.reviewsCount > 0 ? "text-amber-500" : ""}`} />
                  <span>Reviews</span>
                  {alertsData.reviewsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                      {alertsData.reviewsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveAlertTab("customers")}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer text-[11px] sm:text-xs ${
                    activeAlertTab === "customers"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <BellRing className={`w-3.5 h-3.5 ${alertsData.customerRequestsCount > 0 ? "text-orange-500" : ""}`} />
                  <span>Waitlist</span>
                  {alertsData.customerRequestsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-orange-500 text-white">
                      {alertsData.customerRequestsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveAlertTab("stock")}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer text-[11px] sm:text-xs ${
                    activeAlertTab === "stock"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <AlertTriangle className={`w-3.5 h-3.5 ${alertsData.stockAlertsCount > 0 ? "text-rose-500" : ""}`} />
                  <span>Stock</span>
                  {alertsData.stockAlertsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                      {alertsData.stockAlertsCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab Content 1: New Product Reviews */}
              {activeAlertTab === "reviews" && (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {loadingAlerts ? (
                    <div className="py-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1.5 text-orange-500" />
                      <span className="text-xs">Loading customer reviews...</span>
                    </div>
                  ) : alertsData.reviewsCount === 0 ? (
                    <div className="py-8 text-center px-4">
                      <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-2 border border-amber-200">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">No Unseen Reviews</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        New reviews submitted by customers with verified name and email will be notified here.
                      </p>
                    </div>
                  ) : (
                    alertsData.reviewAlerts.map((rev) => (
                      <div
                        key={rev._id}
                        className="p-3.5 hover:bg-amber-50/25 bg-amber-50/10 transition flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5">
                            {rev.productImage ? (
                              <img
                                src={rev.productImage}
                                alt={rev.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                {rev.rating} Star{rev.rating === 1 ? "" : "s"}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {rev.productName}
                              </h4>
                            </div>

                            {/* Customer Name & Email */}
                            <div className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                              <div className="flex items-center gap-1.5 font-medium">
                                <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="font-semibold text-slate-800 truncate">
                                  {rev.customerName}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <a
                                  href={`mailto:${rev.customerEmail}`}
                                  className="text-blue-600 hover:underline truncate"
                                >
                                  {rev.customerEmail}
                                </a>
                              </div>
                            </div>

                            {/* Review comment snippet */}
                            <p className="mt-1.5 text-xs text-slate-700 font-medium bg-white/80 p-2 rounded-lg border border-slate-100 italic line-clamp-2">
                              "{rev.comment}"
                            </p>

                            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{new Date(rev.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <button
                            onClick={(e) => handleDismissReview(e, rev._id)}
                            disabled={dismissingId === rev._id}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Mark as reviewed"
                          >
                            Mark Seen
                          </button>
                          <button
                            onClick={(e) => handleDeleteReview(e, rev._id)}
                            disabled={dismissingId === rev._id}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab Content 2: Customer Restock Requests */}
              {activeAlertTab === "customers" && (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {loadingAlerts ? (
                    <div className="py-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1.5 text-orange-500" />
                      <span className="text-xs">Loading customer requests...</span>
                    </div>
                  ) : alertsData.customerRequestsCount === 0 ? (
                    <div className="py-8 text-center px-4">
                      <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-2 border border-orange-200">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">No Pending Customer Requests</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        When customers request alerts for out-of-stock items, they will appear here with contact details.
                      </p>
                    </div>
                  ) : (
                    alertsData.customerAlerts.map((req) => (
                      <div
                        key={req._id}
                        className="p-3.5 hover:bg-orange-50/20 bg-amber-50/10 transition flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5">
                            {req.productImage ? (
                              <img
                                src={req.productImage}
                                alt={req.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                                Out of Stock
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {req.productName}
                              </h4>
                            </div>

                            <div className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                              <div className="flex items-center gap-1.5 font-medium">
                                <User className="w-3 h-3 text-slate-400" />
                                <span className="font-semibold text-slate-800">{req.customerName || "Customer"}</span>
                              </div>
                              {req.customerEmail && req.customerEmail !== "N/A" && (
                                <div className="flex items-center gap-1.5">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <a
                                    href={`mailto:${req.customerEmail}`}
                                    className="text-blue-600 hover:underline truncate"
                                  >
                                    {req.customerEmail}
                                  </a>
                                </div>
                              )}
                              {req.customerPhone && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <a
                                    href={`tel:${req.customerPhone}`}
                                    className="text-slate-700 hover:text-[#e8703b]"
                                  >
                                    {req.customerPhone}
                                  </a>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => {
                              setNotificationsOpen(false);
                              navigate("/portal/inventory");
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#e8703b] hover:bg-[#d65f29] text-white transition cursor-pointer shadow-2xs"
                          >
                            Restock
                          </button>
                          <button
                            onClick={(e) => handleDismissCustomerAlert(e, req._id)}
                            disabled={dismissingId === req._id}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Dismiss request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab Content 2: Stock Level Alerts */}
              {activeAlertTab === "stock" && (
                <>
                  {/* Status pills summary */}
                  {alertsData.stockAlertsCount > 0 && (
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-3 text-xs">
                      {alertsData.outOfStockCount > 0 && (
                        <span className="flex items-center gap-1 font-bold text-rose-700 text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          {alertsData.outOfStockCount} Out of Stock
                        </span>
                      )}
                      {alertsData.lowStockCount > 0 && (
                        <span className="flex items-center gap-1 font-bold text-amber-700 text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          {alertsData.lowStockCount} Low Stock Alert
                        </span>
                      )}
                    </div>
                  )}

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {loadingAlerts ? (
                      <div className="py-8 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1.5 text-orange-500" />
                        <span className="text-xs">Checking stock levels...</span>
                      </div>
                    ) : alertsData.stockAlertsCount === 0 ? (
                      <div className="py-8 text-center px-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">All Stock Healthy</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          No products are currently low in stock or depleted.
                        </p>
                      </div>
                    ) : (
                      alertsData.alerts.map((item) => {
                        const isZero = item.stock === 0 || item.inStock === false;
                        return (
                          <div
                            key={item._id}
                            className={`p-3.5 hover:bg-slate-50/80 transition flex items-center justify-between gap-3 ${
                              isZero ? "bg-rose-50/25" : "bg-amber-50/20"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-slate-900 truncate">
                                  {item.name}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  {isZero ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                      <XCircle className="w-2.5 h-2.5 text-rose-600" />
                                      Out of Stock (0 units)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                      <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                      {item.stock} left (Trigger ≤{item.lowStockThreshold})
                                    </span>
                                  )}

                                  {item.customerWaitlistCount > 0 && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200 animate-pulse">
                                      🔔 {item.customerWaitlistCount} waiting
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setNotificationsOpen(false);
                                navigate("/portal/inventory");
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 hover:bg-[#e8703b] text-white transition flex-shrink-0 cursor-pointer shadow-2xs"
                            >
                              Restock
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {/* Dropdown Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {alertsData.totalAlerts} items require attention
                </span>
                <Link
                  to="/portal/inventory"
                  onClick={() => setNotificationsOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e8703b] hover:text-[#d65f29] transition"
                >
                  <span>Open Inventory Management</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>Live Store</span>
        </Link>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Role Badge */}
        <div className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${roleMeta.color}`}>
          <RoleIcon className="w-3.5 h-3.5" />
          <span>{roleMeta.label}</span>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#e8703b]/10 text-[#e8703b] border border-[#e8703b]/20 flex items-center justify-center font-black text-xs">
            {(user?.name || "A")[0].toUpperCase()}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{user?.name || "Admin"}</div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active Session
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
