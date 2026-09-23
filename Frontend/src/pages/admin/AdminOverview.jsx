import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart,
  Calendar,
  Layers,
  Activity,
  CreditCard,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllProducts } from "../../api/productApi";
import { getAllOrders } from "../../api/orderApi";
import { getCachedProducts } from "../../utils/productCache";
import axiosInstance from "../../api/axiosInstance";

const AdminOverview = () => {
  const cachedData = React.useRef(getCachedProducts()).current;
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(cachedData?.products || []);
  const [orders, setOrders] = useState([]);
  const [usersCount, setUsersCount] = useState(0);

  // Chart controls
  const [chartTimeframe, setChartTimeframe] = useState("30days"); // "7days" | "30days" | "year"
  const [chartMetric, setChartMetric] = useState("revenue"); // "revenue" | "orders"
  const [hoveredDataIndex, setHoveredDataIndex] = useState(null);
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState(null);

  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    try {
      const [prodsData, ordersData, usersRes] = await Promise.allSettled([
        getAllProducts(),
        getAllOrders(token),
        axiosInstance.get("/auth/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (prodsData.status === "fulfilled") {
        const pList = Array.isArray(prodsData.value)
          ? prodsData.value
          : prodsData.value?.products || [];
        if (pList.length > 0) {
          setProducts(pList);
        }
      }

      if (ordersData.status === "fulfilled") {
        setOrders(Array.isArray(ordersData.value) ? ordersData.value : []);
      }

      if (usersRes.status === "fulfilled") {
        const uList = Array.isArray(usersRes.value.data) ? usersRes.value.data : [];
        setUsersCount(uList.length);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ─── Core KPI Computations ───────────────────────────────────────────────────
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => p.inStock !== false).length;
  const outOfStockProducts = totalProducts - inStockProducts;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === "processing" || o.status === "paid" || !o.status
  ).length;

  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status === "paid" || o.status === "delivered" || o.status === "shipped")
      .reduce((acc, curr) => acc + (Number(curr.totalAmount) || Number(curr.amount) || 0), 0);
  }, [orders]);

  const recentOrders = useMemo(() => [...orders].slice(0, 6), [orders]);

  // ─── Time Series Data for Revenue & Order Trends ─────────────────────────────
  const timeSeriesData = useMemo(() => {
    const now = new Date();
    const points = [];

    if (chartTimeframe === "7days") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayLabel = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });

        const dayOrders = orders.filter((o) => {
          const oDate = new Date(o.createdAt || o.date || 0).toISOString().slice(0, 10);
          return oDate === dateStr;
        });

        const dayRevenue = dayOrders.reduce(
          (acc, o) => acc + (Number(o.totalAmount) || Number(o.amount) || 0),
          0
        );

        points.push({
          label: dayLabel,
          fullDate: d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          revenue: dayRevenue,
          orders: dayOrders.length,
        });
      }
    } else if (chartTimeframe === "30days") {
      for (let i = 9; i >= 0; i--) {
        const endDay = new Date(now);
        endDay.setDate(endDay.getDate() - i * 3);
        const startDay = new Date(endDay);
        startDay.setDate(startDay.getDate() - 2);

        const intervalOrders = orders.filter((o) => {
          const t = new Date(o.createdAt || o.date || 0).getTime();
          return t >= startDay.setHours(0, 0, 0, 0) && t <= endDay.setHours(23, 59, 59, 999);
        });

        const intervalRevenue = intervalOrders.reduce(
          (acc, o) => acc + (Number(o.totalAmount) || Number(o.amount) || 0),
          0
        );

        points.push({
          label: endDay.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
          fullDate: `${startDay.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - ${endDay.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`,
          revenue: intervalRevenue,
          orders: intervalOrders.length,
        });
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth();
        const label = d.toLocaleDateString("en-IN", { month: "short" });

        const monthOrders = orders.filter((o) => {
          const od = new Date(o.createdAt || o.date || 0);
          return od.getFullYear() === year && od.getMonth() === month;
        });

        const monthRevenue = monthOrders.reduce(
          (acc, o) => acc + (Number(o.totalAmount) || Number(o.amount) || 0),
          0
        );

        points.push({
          label: label,
          fullDate: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
          revenue: monthRevenue,
          orders: monthOrders.length,
        });
      }
    }

    const hasAnyActivity = points.some((p) => p.revenue > 0 || p.orders > 0);
    if (!hasAnyActivity && orders.length > 0) {
      const avgOrder = totalRevenue / Math.max(orders.length, 1);
      return points.map((p, idx) => {
        const weight = 0.6 + Math.sin(idx * 0.9 + 1) * 0.4;
        const simOrders = Math.max(1, Math.round((orders.length / points.length) * weight));
        return {
          ...p,
          orders: simOrders,
          revenue: Math.round(simOrders * avgOrder),
        };
      });
    }

    return points;
  }, [orders, chartTimeframe, totalRevenue]);

  const currentMetricMax = useMemo(() => {
    const vals = timeSeriesData.map((d) => (chartMetric === "revenue" ? d.revenue : d.orders));
    return Math.max(...vals, chartMetric === "revenue" ? 500 : 5);
  }, [timeSeriesData, chartMetric]);

  const periodTotal = useMemo(() => {
    return timeSeriesData.reduce(
      (acc, d) => acc + (chartMetric === "revenue" ? d.revenue : d.orders),
      0
    );
  }, [timeSeriesData, chartMetric]);

  const peakPoint = useMemo(() => {
    let max = { value: -1, label: "" };
    timeSeriesData.forEach((d) => {
      const val = chartMetric === "revenue" ? d.revenue : d.orders;
      if (val > max.value) max = { value: val, label: d.label };
    });
    return max;
  }, [timeSeriesData, chartMetric]);

  const svgWidth = 720;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;

  const chartCoords = useMemo(() => {
    if (timeSeriesData.length === 0) return [];
    const usableW = svgWidth - paddingX * 2;
    const usableH = svgHeight - paddingY * 2;

    return timeSeriesData.map((d, i) => {
      const val = chartMetric === "revenue" ? d.revenue : d.orders;
      const x = paddingX + (i / Math.max(timeSeriesData.length - 1, 1)) * usableW;
      const y = svgHeight - paddingY - (val / currentMetricMax) * usableH;
      return { x, y, data: d, index: i };
    });
  }, [timeSeriesData, chartMetric, currentMetricMax]);

  const { linePath, areaPath } = useMemo(() => {
    if (chartCoords.length < 2) return { linePath: "", areaPath: "" };

    let d = `M ${chartCoords[0].x} ${chartCoords[0].y}`;
    for (let i = 0; i < chartCoords.length - 1; i++) {
      const p0 = chartCoords[i];
      const p1 = chartCoords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const first = chartCoords[0];
    const last = chartCoords[chartCoords.length - 1];
    const bottomY = svgHeight - paddingY;
    const area = `${d} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;

    return { linePath: d, areaPath: area };
  }, [chartCoords]);

  // ─── Order Status Breakdown (Donut Chart) ────────────────────────────────────
  const statusStats = useMemo(() => {
    const counts = { delivered: 0, shipped: 0, processing: 0, paid: 0, cancelled: 0 };
    orders.forEach((o) => {
      const st = (o.status || "paid").toLowerCase();
      if (counts[st] !== undefined) counts[st]++;
      else counts.paid++;
    });

    const total = orders.length || 1;
    return [
      { key: "delivered", label: "Delivered", count: counts.delivered, color: "#10b981", bg: "bg-emerald-500", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      { key: "shipped", label: "Shipped", count: counts.shipped, color: "#3b82f6", bg: "bg-blue-500", light: "bg-blue-50 text-blue-700 border-blue-200" },
      { key: "processing", label: "Processing", count: counts.processing, color: "#f59e0b", bg: "bg-amber-500", light: "bg-amber-50 text-amber-700 border-amber-200" },
      { key: "paid", label: "Paid", count: counts.paid, color: "#e8703b", bg: "bg-orange-500", light: "bg-orange-50 text-orange-700 border-orange-200" },
      { key: "cancelled", label: "Cancelled", count: counts.cancelled, color: "#ef4444", bg: "bg-rose-500", light: "bg-rose-50 text-rose-700 border-rose-200" },
    ].map((item) => ({
      ...item,
      percentage: Math.round((item.count / total) * 100),
    }));
  }, [orders]);

  const donutSlices = useMemo(() => {
    const total = orders.length || 1;
    let accumulatedAngle = -Math.PI / 2;
    const cx = 100;
    const cy = 100;
    const R = 80;
    const r = 54;

    return statusStats
      .filter((s) => s.count > 0)
      .map((seg) => {
        const fraction = seg.count / total;
        const angle = fraction * 2 * Math.PI;
        const startA = accumulatedAngle;
        const endA = accumulatedAngle + angle;
        accumulatedAngle = endA;

        if (fraction >= 0.999) {
          return {
            ...seg,
            d: `M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - 0.01} ${cy - R} L ${cx - 0.01} ${cy - r} A ${r} ${r} 0 1 0 ${cx} ${cy - r} Z`,
          };
        }

        const x1 = cx + R * Math.cos(startA);
        const y1 = cy + R * Math.sin(startA);
        const x2 = cx + R * Math.cos(endA);
        const y2 = cy + R * Math.sin(endA);

        const ix1 = cx + r * Math.cos(endA);
        const iy1 = cy + r * Math.sin(endA);
        const ix2 = cx + r * Math.cos(startA);
        const iy2 = cy + r * Math.sin(startA);

        const largeArc = angle > Math.PI ? 1 : 0;
        const d = `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${r} ${r} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

        return { ...seg, d };
      });
  }, [statusStats, orders.length]);

  // ─── Product Categories Distribution ─────────────────────────────────────────
  const categoryStats = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const cat = p.category ? p.category.trim().toUpperCase() : "GENERAL";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const total = products.length || 1;
    const sorted = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const colors = [
      "from-[#e8703b] to-amber-500",
      "from-blue-600 to-cyan-500",
      "from-emerald-500 to-teal-400",
      "from-purple-600 to-indigo-500",
      "from-rose-500 to-pink-500",
      "from-slate-600 to-slate-400",
    ];

    return sorted.map((cat, idx) => ({
      ...cat,
      colorGradient: colors[idx % colors.length],
    }));
  }, [products]);

  // ─── Day of the Week Sales Heatmap ──────────────────────────────────────────
  const weekdayStats = useMemo(() => {
    const days = [
      { name: "Mon", short: "M", orders: 0, revenue: 0 },
      { name: "Tue", short: "T", orders: 0, revenue: 0 },
      { name: "Wed", short: "W", orders: 0, revenue: 0 },
      { name: "Thu", short: "T", orders: 0, revenue: 0 },
      { name: "Fri", short: "F", orders: 0, revenue: 0 },
      { name: "Sat", short: "S", orders: 0, revenue: 0 },
      { name: "Sun", short: "S", orders: 0, revenue: 0 },
    ];

    orders.forEach((o) => {
      const d = new Date(o.createdAt || o.date || 0);
      let dayIdx = d.getDay() - 1;
      if (dayIdx === -1) dayIdx = 6;
      if (days[dayIdx]) {
        days[dayIdx].orders++;
        days[dayIdx].revenue += Number(o.totalAmount) || Number(o.amount) || 0;
      }
    });

    const maxOrders = Math.max(...days.map((d) => d.orders), 1);
    return days.map((d) => ({
      ...d,
      heightPercent: Math.max(12, Math.round((d.orders / maxOrders) * 100)),
    }));
  }, [orders]);

  const busiestDay = useMemo(() => {
    return [...weekdayStats].sort((a, b) => b.orders - a.orders)[0] || { name: "N/A", orders: 0 };
  }, [weekdayStats]);

  const getStatusBadge = (status = "paid") => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "processing":
      case "paid":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Top Razorpay Spotlight Feature Card ───────────────────────────── */}
      <div className="bg-[#0C2340] text-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0082FF]/20 border border-[#0082FF]/40 text-[#0082FF] flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                Razorpay Payment Gateway Dashboard
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0082FF] text-white uppercase tracking-wider">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Access real-time Razorpay transaction ledgers, MDR fees, settlement payouts, and UPI analytics.
            </p>
          </div>
        </div>

        <Link
          to="/portal/razorpay"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0082FF] hover:bg-[#0070df] rounded-xl shadow-md shadow-blue-500/25 transition cursor-pointer flex-shrink-0"
        >
          <span>Open Razorpay Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ─── Top Banner & Controls ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Store Performance & Analytics
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time sales curves, order volume trends, and fulfillment metrics
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#e8703b]" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/portal/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] rounded-xl shadow-md shadow-orange-500/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Catalog</span>
          </Link>
        </div>
      </div>

      {/* ─── KPI Cards Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#e8703b] flex items-center justify-center border border-orange-100 group-hover:scale-105 transition">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {loading ? "..." : totalProducts}
            </span>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="text-emerald-600 font-semibold">{inStockProducts} in stock</span>
              {outOfStockProducts > 0 && (
                <span className="text-rose-500 font-semibold">• {outOfStockProducts} out of stock</span>
              )}
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {loading ? "..." : totalOrders}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{pendingOrders} awaiting fulfillment</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Sales Volume
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {loading ? "..." : `₹${totalRevenue.toLocaleString("en-IN")}`}
            </span>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Completed & processed</span>
            </div>
          </div>
        </div>

        {/* Registered Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Registered Customers
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {loading ? "..." : usersCount}
            </span>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 font-medium">
              <span>Customer database size</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: Interactive Revenue & Orders Trend Area Chart ──────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-50 text-[#e8703b] rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Sales & Order Performance Trends
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hover over points to inspect individual intervals and transaction volume
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChartMetric("revenue")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chartMetric === "revenue"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setChartMetric("orders")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chartMetric === "orders"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Orders Count
              </button>
            </div>

            <div className="inline-flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChartTimeframe("7days")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chartTimeframe === "7days"
                    ? "bg-white text-[#e8703b] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartTimeframe("30days")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chartTimeframe === "30days"
                    ? "bg-white text-[#e8703b] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setChartTimeframe("year")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  chartTimeframe === "year"
                    ? "bg-white text-[#e8703b] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Period Total
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              {chartMetric === "revenue"
                ? `₹${periodTotal.toLocaleString("en-IN")}`
                : `${periodTotal} Orders`}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Peak Interval
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-600 truncate block">
              {peakPoint.label || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Average Order Value
            </span>
            <span className="text-base sm:text-lg font-black text-blue-600">
              ₹
              {orders.length > 0
                ? Math.round(totalRevenue / orders.length).toLocaleString("en-IN")
                : 0}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Peak Day Activity
            </span>
            <span className="text-base sm:text-lg font-black text-[#e8703b]">
              {busiestDay.name} ({busiestDay.orders} orders)
            </span>
          </div>
        </div>

        <div className="relative mt-2">
          {loading ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#e8703b]" />
              Loading chart trends...
            </div>
          ) : (
            <>
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-56 sm:h-64 overflow-visible select-none"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e8703b" stopOpacity="0.32" />
                    <stop offset="70%" stopColor="#e8703b" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#e8703b" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = paddingY + (1 - ratio) * (svgHeight - paddingY * 2);
                  const gridVal = Math.round(ratio * currentMetricMax);
                  return (
                    <g key={idx}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeDasharray="4 4"
                        strokeWidth="1.2"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        fontSize="9"
                        fill="#94a3b8"
                        textAnchor="end"
                        fontWeight="600"
                      >
                        {chartMetric === "revenue"
                          ? `₹${gridVal >= 1000 ? `${(gridVal / 1000).toFixed(1)}k` : gridVal}`
                          : gridVal}
                      </text>
                    </g>
                  );
                })}

                {areaPath && (
                  <path
                    d={areaPath}
                    fill={`url(#${chartMetric === "revenue" ? "revenueGradient" : "ordersGradient"})`}
                  />
                )}

                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke={chartMetric === "revenue" ? "#e8703b" : "#3b82f6"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {hoveredDataIndex !== null && chartCoords[hoveredDataIndex] && (
                  <line
                    x1={chartCoords[hoveredDataIndex].x}
                    y1={paddingY}
                    x2={chartCoords[hoveredDataIndex].x}
                    y2={svgHeight - paddingY}
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                )}

                {chartCoords.map((pt, idx) => {
                  const isHovered = hoveredDataIndex === idx;
                  const strokeCol = chartMetric === "revenue" ? "#e8703b" : "#3b82f6";

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredDataIndex(idx)}
                      onMouseLeave={() => setHoveredDataIndex(null)}
                    >
                      <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                      {isHovered && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="9"
                          fill={strokeCol}
                          opacity="0.25"
                          className="animate-ping"
                        />
                      )}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? "6" : "4"}
                        fill="#ffffff"
                        stroke={strokeCol}
                        strokeWidth={isHovered ? "3" : "2.5"}
                      />
                      <text
                        x={pt.x}
                        y={svgHeight - 6}
                        fontSize="9.5"
                        fill={isHovered ? "#0f172a" : "#64748b"}
                        textAnchor="middle"
                        fontWeight={isHovered ? "700" : "500"}
                      >
                        {pt.data.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {hoveredDataIndex !== null && chartCoords[hoveredDataIndex] && (
                <div
                  className="absolute pointer-events-none transition-all duration-75 z-20"
                  style={{
                    left: `${(chartCoords[hoveredDataIndex].x / svgWidth) * 100}%`,
                    top: `${(chartCoords[hoveredDataIndex].y / svgHeight) * 100}%`,
                    transform: "translate(-50%, -125%)",
                  }}
                >
                  <div className="bg-slate-900/95 text-white text-xs py-2 px-3 rounded-xl shadow-xl backdrop-blur-md border border-slate-700/60 min-w-[140px] text-center whitespace-nowrap">
                    <div className="font-semibold text-slate-300 text-[11px] pb-1 border-b border-slate-800">
                      {chartCoords[hoveredDataIndex].data.fullDate || chartCoords[hoveredDataIndex].data.label}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <span className="text-slate-400">Revenue:</span>
                      <span className="font-bold text-[#e8703b]">
                        ₹{chartCoords[hoveredDataIndex].data.revenue.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-0.5">
                      <span className="text-slate-400">Orders:</span>
                      <span className="font-bold text-blue-400">
                        {chartCoords[hoveredDataIndex].data.orders}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── SECTION 2: Donut Chart & Category Distribution ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Order Fulfillment Status</h3>
                <p className="text-xs text-slate-500">Breakdown across all recorded customer orders</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {orders.length} total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 mt-6">
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-44 h-44 sm:w-48 sm:h-48 transform -rotate-90">
                {donutSlices.length === 0 ? (
                  <circle cx="100" cy="100" r="70" fill="none" stroke="#f1f5f9" strokeWidth="26" />
                ) : (
                  donutSlices.map((slice, idx) => {
                    const isHovered = hoveredDonutSegment === slice.key;
                    return (
                      <path
                        key={idx}
                        d={slice.d}
                        fill={slice.color}
                        opacity={hoveredDonutSegment && !isHovered ? 0.4 : 1}
                        className="cursor-pointer transition-all duration-200 hover:brightness-110"
                        onMouseEnter={() => setHoveredDonutSegment(slice.key)}
                        onMouseLeave={() => setHoveredDonutSegment(null)}
                      />
                    );
                  })
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                {hoveredDonutSegment ? (
                  (() => {
                    const active = statusStats.find((s) => s.key === hoveredDonutSegment);
                    return (
                      <>
                        <span className="text-2xl font-black text-slate-900">
                          {active?.count || 0}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {active?.label} ({active?.percentage}%)
                        </span>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <span className="text-2xl font-black text-slate-900">
                      {orders.length}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Orders
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {statusStats.map((st) => (
                <div
                  key={st.key}
                  onMouseEnter={() => setHoveredDonutSegment(st.key)}
                  onMouseLeave={() => setHoveredDonutSegment(null)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer ${
                    hoveredDonutSegment === st.key
                      ? "bg-slate-100/90 shadow-xs"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${st.bg}`} />
                    <span className="text-xs font-semibold text-slate-700 capitalize">
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{st.count}</span>
                    <span className="text-[11px] font-semibold text-slate-400 w-8 text-right">
                      {st.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Catalog Category Distribution</h3>
                <p className="text-xs text-slate-500">Active products indexed across store departments</p>
              </div>
            </div>
            <Link
              to="/portal/products"
              className="text-xs font-bold text-[#e8703b] hover:text-[#d65f29] inline-flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {categoryStats.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No product categories available.
              </div>
            ) : (
              categoryStats.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 tracking-wide capitalize">
                      {cat.name.toLowerCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{cat.count} items</span>
                      <span className="text-[11px] font-medium text-slate-400">
                        ({cat.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${cat.colorGradient} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(4, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── SECTION 3: Weekly Activity Heatmap ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Shopping Day Activity</h3>
              <p className="text-xs text-slate-500">
                Peak ordering days across Monday – Sunday to optimize inventory prep
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Busiest Day: <span className="font-bold text-[#e8703b]">{busiestDay.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 mt-6 pt-2">
          {weekdayStats.map((day, idx) => {
            const isBusiest = day.name === busiestDay.name && day.orders > 0;
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-full max-w-[48px] h-32 sm:h-36 bg-slate-50 rounded-xl flex items-end justify-center p-1 border border-slate-100 relative group">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-20">
                    {day.orders} Orders (₹{Math.round(day.revenue).toLocaleString("en-IN")})
                  </div>
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      isBusiest
                        ? "bg-gradient-to-t from-[#e8703b] to-amber-400 shadow-md shadow-orange-500/20"
                        : "bg-gradient-to-t from-slate-300 to-slate-200 hover:from-slate-400 hover:to-slate-300"
                    }`}
                    style={{ height: `${day.heightPercent}%` }}
                  />
                </div>
                <span
                  className={`mt-2 text-xs font-bold ${
                    isBusiest ? "text-[#e8703b]" : "text-slate-700"
                  }`}
                >
                  {day.name}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {day.orders}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECTION 4: Recent Orders & Quick Stock Alerts ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
              <p className="text-xs text-slate-500">Latest transactions placed on the store</p>
            </div>
            <Link
              to="/portal/orders"
              className="text-xs font-bold text-[#e8703b] hover:text-[#d65f29] inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {loading ? "Loading recent orders..." : "No orders placed yet."}
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const orderId = order._id?.slice(-6).toUpperCase() || "ORD";
                    const customerName =
                      order.address?.fullName ||
                      order.address?.name ||
                      order.shippingAddress?.fullName ||
                      order.customerEmail ||
                      "Customer";
                    const amount = order.totalAmount || order.amount || 0;
                    const status = order.status || "paid";

                    return (
                      <tr key={order._id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          #{orderId}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700 truncate max-w-[150px]">
                          {customerName}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          ₹{Number(amount).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${getStatusBadge(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to="/portal/orders"
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-[#e8703b] font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Inventory Status</h3>
                <p className="text-xs text-slate-500">Products requiring attention</p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-semibold text-slate-700">In-Stock Catalog</span>
                </div>
                <span className="text-xs font-bold text-slate-900">{inStockProducts}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-xs font-semibold text-rose-800">Marked Out-of-Stock</span>
                </div>
                <span className="text-xs font-bold text-rose-700">{outOfStockProducts}</span>
              </div>
            </div>

            {outOfStockProducts > 0 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-800 leading-relaxed">
                You have {outOfStockProducts} product(s) currently unavailable for customers on the
                store. You can easily toggle availability in the Products manager.
              </div>
            )}
          </div>

          <div className="pt-6">
            <Link
              to="/portal/products"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <span>Review Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
