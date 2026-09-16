import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Calendar,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import ph from "../assets/image.png";

const STATUS_STEPS = ["paid", "processing", "shipped", "delivered"];

const stepDescriptions = {
  paid: "Order placed & payment verified",
  processing: "Preparing & packaging items",
  shipped: "In transit with courier",
  delivered: "Delivered to your address",
};

const statusConfig = {
  paid: {
    label: "Paid",
    icon: Clock,
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
  },
  processing: {
    label: "Processing",
    icon: Package,
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "bg-purple-500",
    textColor: "text-purple-700",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
  },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || localStorage.getItem("guestUserId");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchOrders = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axiosInstance.get(`/orders/${userId}`);
        const sortedOrders = (data.orders || []).sort(
          (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
        );
        setOrders(sortedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const getStatusIndex = (status) => STATUS_STEPS.indexOf(status);

  return (
    <section className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Navbar />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 flex-grow max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a5f] tracking-tight">
              My Orders
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {orders.length > 0
                ? `You have ${orders.length} order${orders.length > 1 ? "s" : ""}`
                : "Track and manage your orders"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-3 border-amber-500/20 border-t-[#e8703b] rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 text-sm font-medium">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-xs max-w-lg mx-auto">
            <Package className="mx-auto h-14 w-14 text-gray-300" />
            <h3 className="text-base font-bold text-gray-800 mt-4">No orders placed yet</h3>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 mb-5">
              When you place an order, it will appear here with live tracking.
            </p>
            <a
              href="/products"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#e8703b] hover:bg-[#d45f2a] text-white text-xs sm:text-sm font-bold shadow-xs transition"
            >
              Browse Products
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => {
              const status = order.status || "paid";
              const config = statusConfig[status] || statusConfig.paid;
              const StatusIcon = config.icon;
              const statusIdx = getStatusIndex(status);
              const isCancelled = status === "cancelled";

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-xs overflow-hidden border border-gray-200/90 hover:shadow-md transition-shadow duration-300"
                >
                  {/* ──────────────── Order Header ──────────────── */}
                  <div className="bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      {/* Left: Status Icon + Order ID */}
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className={`p-2 rounded-xl ${config.bgColor}`}>
                          <StatusIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${config.textColor}`} />
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                            Order ID
                          </p>
                          <p className="font-mono font-bold text-gray-800 text-xs sm:text-sm">
                            #{order.orderId || order._id}
                          </p>
                        </div>
                      </div>

                      {/* Right: Total + Status Badge */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <div className="sm:text-right">
                          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                            Total Amount
                          </p>
                          <p className="text-base sm:text-xl font-black text-[#1e3a5f]">
                            ₹{order.totalAmount}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${config.textColor} ${config.bgColor} border ${config.borderColor}`}
                        >
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ──────────────── Tracking Number Banner ──────────────── */}
                  {order.trackingNumber && (
                    <div className="mx-4 sm:mx-6 mt-3.5 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5">
                      <Truck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <div className="text-xs">
                        <span className="text-blue-600 font-medium">Tracking Number: </span>
                        <strong className="text-blue-950 font-mono tracking-wider ml-1">
                          {order.trackingNumber}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* ──────────────── Order Process / Stepper ──────────────── */}
                  {!isCancelled && (
                    <div className="px-4 sm:px-6 pt-4 pb-2">
                      {/* 📱 MOBILE VIEW: Vertical Process Timeline (Clean, non-squished) */}
                      <div className="sm:hidden bg-gray-50/80 rounded-xl p-3.5 border border-gray-100 mb-2">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                          Order Progress
                        </p>
                        <div className="space-y-3">
                          {STATUS_STEPS.map((step, idx) => {
                            const stepLabel = step.charAt(0).toUpperCase() + step.slice(1);
                            const isCompleted = statusIdx >= idx;
                            const isCurrent = statusIdx === idx;
                            const isLast = idx === STATUS_STEPS.length - 1;

                            return (
                              <div key={step} className="flex items-start gap-3 relative">
                                {/* Vertical line */}
                                {!isLast && (
                                  <div
                                    className={`absolute left-3.5 top-7 bottom-[-12px] w-0.5 ${
                                      statusIdx > idx ? "bg-green-500" : "bg-gray-200"
                                    }`}
                                  />
                                )}

                                {/* Step Bubble */}
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 flex-shrink-0 ${
                                    isCompleted
                                      ? "bg-green-500 shadow-2xs"
                                      : "bg-gray-200 text-gray-500"
                                  } ${isCurrent ? "ring-3 ring-green-200" : ""}`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle className="h-4 w-4 stroke-[2.5]" />
                                  ) : (
                                    idx + 1
                                  )}
                                </div>

                                {/* Step Label + Subtext */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <p
                                      className={`text-xs font-bold ${
                                        isCompleted ? "text-green-800" : "text-gray-500"
                                      }`}
                                    >
                                      {stepLabel}
                                    </p>
                                    {isCurrent && (
                                      <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    {stepDescriptions[step]}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 💻 DESKTOP VIEW: Horizontal Stepper */}
                      <div className="hidden sm:block">
                        <div className="flex items-center justify-between relative px-4">
                          {STATUS_STEPS.map((step, idx) => {
                            const stepLabel =
                              step.charAt(0).toUpperCase() + step.slice(1);
                            const isCompleted = statusIdx >= idx;
                            const isCurrent = statusIdx === idx;
                            return (
                              <div
                                key={step}
                                className="flex flex-col items-center z-10"
                              >
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all duration-300 ${
                                    isCompleted
                                      ? "bg-green-500 shadow-sm"
                                      : "bg-gray-200 text-gray-500"
                                  } ${isCurrent ? "ring-4 ring-green-200" : ""}`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle className="h-4 w-4 stroke-[2.5]" />
                                  ) : (
                                    idx + 1
                                  )}
                                </div>
                                <span
                                  className={`text-xs mt-1.5 font-semibold ${
                                    isCompleted
                                      ? "text-green-700"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {stepLabel}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {/* Progress Line */}
                        <div className="relative mt-[-28px] mb-4 px-4">
                          <div className="absolute top-0 left-[6%] right-[6%] h-1 bg-gray-200 rounded-full" />
                          <div
                            className="absolute top-0 left-[6%] h-1 bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                statusIdx >= 0
                                  ? (statusIdx / (STATUS_STEPS.length - 1)) * 88
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ──────────────── Cancelled Banner ──────────────── */}
                  {isCancelled && (
                    <div className="mx-4 sm:mx-6 mt-3.5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-red-700 font-bold text-xs sm:text-sm">
                          Order Cancelled
                        </p>
                        <p className="text-red-500 text-[11px] mt-0.5">
                          This order has been cancelled and will not be processed.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ──────────────── Order Date & Payment Info ──────────────── */}
                  <div className="px-4 sm:px-6 pt-2 pb-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Placed on{" "}
                      {order.date || order.createdAt
                        ? new Date(order.date || order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </span>
                    {order.paymentMethod && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <CreditCard className="h-3.5 w-3.5" />
                        {order.paymentMethod}
                      </span>
                    )}
                  </div>

                  {/* ──────────────── Products List (With Fixed Images) ──────────────── */}
                  <div className="px-4 sm:px-6 py-3.5">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                      Items Ordered ({order.products?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {order.products?.map((p, i) => {
                        const imgSrc = p.img || p.image || ph;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-2.5 sm:p-3 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors border border-gray-100"
                          >
                            {/* Product Image Box */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl border border-gray-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={imgSrc}
                                alt={p.name || "Product"}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = ph;
                                }}
                                className="max-h-full max-w-full object-contain mix-blend-multiply"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-bold text-gray-800 text-xs sm:text-sm truncate"
                                title={p.name}
                              >
                                {p.name}
                              </p>
                              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                                Qty: <strong className="text-gray-700">{p.quantity}</strong> × ₹{p.price}
                              </p>
                            </div>

                            {/* Subtotal */}
                            <p className="font-extrabold text-gray-900 text-xs sm:text-sm flex-shrink-0">
                              ₹{p.subtotal || (p.price * p.quantity)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ──────────────── Delivery Address ──────────────── */}
                  {order.address && (
                    <div className="px-4 sm:px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs leading-relaxed text-gray-600">
                          <span className="font-bold text-gray-800">
                            Delivery to: {order.address.fullName}
                          </span>{" "}
                          {order.address.phone && (
                            <span className="text-gray-500 font-medium">
                              (📞 {order.address.phone})
                            </span>
                          )}
                          <br />
                          {order.address.address}, {order.address.city},{" "}
                          {order.address.state} - {order.address.pincode}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </section>
  );
};

export default Orders;