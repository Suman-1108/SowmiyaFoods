import React, { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  User,
  ShoppingBag,
  ChevronRight,
  Edit3,
  Plus,
  Trash2,
  Check,
  X,
  Phone,
  Mail,
  Home,
  Briefcase,
  Star,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Loader2,
  Sparkles,
} from "lucide-react";

const STATUS_STEPS = ["paid", "processing", "shipped", "delivered"];

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

const INDIAN_STATES = [
  "Tamil Nadu",
  "Karnataka",
  "Kerala",
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Delhi",
  "Gujarat",
  "Goa",
  "Puducherry",
  "Other",
];

const MyAccount = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const tabParam = searchParams.get("tab") || location.state?.tab;
  const [activeTab, setActiveTab] = useState(
    tabParam === "profile" ? "profile" : "orders"
  );
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    const currentTab = searchParams.get("tab") || location.state?.tab;
    if (currentTab === "profile" || currentTab === "orders") {
      setActiveTab(currentTab);
    }
  }, [searchParams, location.state]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const { user: authUser, updateUser } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const user = authUser || storedUser;
  const userId = user?.id || user?._id || localStorage.getItem("guestUserId");

  // ================= PROFILE STATE =================
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Sync profile form when user updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // ================= ADDRESSES STATE =================
  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [deletingAddressId, setDeletingAddressId] = useState(null);

  const initialAddressForm = {
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "Tamil Nadu",
    pincode: "",
    landmark: "",
    type: "Home",
    isDefault: false,
  };
  const [addressForm, setAddressForm] = useState(initialAddressForm);

  // ================= API FETCHERS =================
  const fetchOrders = async () => {
    if (!userId) return;
    setIsLoadingOrders(true);
    try {
      const { data } = await axiosInstance.get(`/orders/${userId}`);
      const sortedOrders = (data.orders || []).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    if (!userId) return;
    setIsLoadingAddresses(true);
    try {
      const { data } = await axiosInstance.get(`/address/${userId}`);
      setAddresses(data || []);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAddresses();
  }, [userId]);

  const getStatusIndex = (status) => STATUS_STEPS.indexOf(status);

  // ================= PROFILE HANDLERS =================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");

    if (!profileForm.name.trim()) {
      return setProfileError("Full Name is required");
    }
    if (profileForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
      return setProfileError("Please enter a valid email address");
    }
    if (profileForm.phone && !/^\d{10}$/.test(profileForm.phone.trim())) {
      return setProfileError("Mobile number must be exactly 10 digits");
    }

    setIsSavingProfile(true);
    try {
      const res = await axiosInstance.put(`/auth/profile/${userId}`, {
        name: profileForm.name.trim(),
        email: profileForm.email.trim() || undefined,
        phone: profileForm.phone.trim() || undefined,
      });

      const { user: updatedUser, token: newToken, message } = res.data;
      if (updateUser) {
        updateUser(updatedUser, newToken);
      } else {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        if (newToken) localStorage.setItem("token", newToken);
      }

      toast.success(message || "Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to update profile";
      setProfileError(msg);
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ================= ADDRESS HANDLERS =================
  const resetAddressForm = () => {
    setAddressForm({
      fullName: user?.name || "",
      phone: user?.phone || "",
      address: "",
      city: "",
      state: "Tamil Nadu",
      pincode: "",
      landmark: "",
      type: "Home",
      isDefault: addresses.length === 0,
    });
    setAddressError("");
    setEditingAddressId(null);
  };

  const handleOpenAddAddress = () => {
    resetAddressForm();
    setIsAddressFormOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "Tamil Nadu",
      pincode: addr.pincode || "",
      landmark: addr.landmark || "",
      type: addr.type || "Home",
      isDefault: addr.isDefault || false,
    });
    setAddressError("");
    setIsAddressFormOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressError("");

    if (!addressForm.fullName.trim()) return setAddressError("Recipient full name is required");
    if (!/^\d{10}$/.test(addressForm.phone.trim())) return setAddressError("Please enter a valid 10-digit mobile number");
    if (!/^\d{6}$/.test(addressForm.pincode.trim())) return setAddressError("Please enter a valid 6-digit PIN code");
    if (!addressForm.address.trim()) return setAddressError("Street address is required");
    if (!addressForm.city.trim()) return setAddressError("City / District is required");
    if (!addressForm.state.trim()) return setAddressError("State is required");

    setIsSavingAddress(true);
    try {
      if (editingAddressId) {
        await axiosInstance.put(`/address/${editingAddressId}`, {
          ...addressForm,
          userId,
        });
        toast.success("Address updated successfully!");
      } else {
        await axiosInstance.post(`/address`, {
          ...addressForm,
          userId,
        });
        toast.success("New delivery address saved!");
      }

      setIsAddressFormOpen(false);
      resetAddressForm();
      await fetchAddresses();
    } catch (err) {
      console.error(err);
      setAddressError(err.response?.data?.message || "Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to remove this delivery address?")) return;
    setDeletingAddressId(id);
    try {
      await axiosInstance.delete(`/address/${id}`);
      toast.success("Address removed successfully");
      await fetchAddresses();
    } catch (err) {
      toast.error("Failed to delete address");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await axiosInstance.put(`/address/${id}/default`);
      toast.success("Default delivery address updated");
      await fetchAddresses();
    } catch (err) {
      toast.error("Failed to set default address");
    }
  };

  const tabs = [
    { id: "orders", label: "My Orders", icon: ShoppingBag },
    { id: "profile", label: "My Profile", icon: User },
  ];

  return (
    <section className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 md:py-12 flex-grow max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f]">My Account</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, <span className="font-semibold text-gray-800">{user?.name || "Guest"}</span>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-8 border-b border-gray-200 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20"
                    : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ================= ORDERS TAB ================= */}
        {activeTab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1e3a5f]">Order History</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {orders.length > 0
                    ? `You have placed ${orders.length} order${orders.length > 1 ? "s" : ""}`
                    : "Track and manage your past orders"}
                </p>
              </div>
            </div>

            {isLoadingOrders ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Loader2 className="mx-auto h-10 w-10 text-amber-500 animate-spin" />
                <p className="text-gray-500 text-sm mt-3">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Package className="mx-auto h-16 w-16 text-gray-300" />
                <p className="text-gray-600 text-lg font-medium mt-4">No orders placed yet.</p>
                <p className="text-gray-400 text-sm mt-1">
                  When you place an order, it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const status = order.status || "paid";
                  const config = statusConfig[status] || statusConfig.paid;
                  const StatusIcon = config.icon;
                  const statusIdx = getStatusIndex(status);
                  const isCancelled = status === "cancelled";

                  return (
                    <div
                      key={order._id}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300"
                    >
                      {/* Order Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${config.bgColor}`}>
                              <StatusIcon className={`h-5 w-5 ${config.textColor}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-800 text-sm">
                                  Order #{order._id?.slice(-8).toUpperCase()}
                                </span>
                                <span
                                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${config.bgColor} ${config.textColor}`}
                                >
                                  {config.label}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Placed on{" "}
                                {new Date(order.date || order.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-[#1e3a5f]">
                              ₹{order.totalAmount}
                            </span>
                            <p className="text-xs text-gray-400">
                              {order.items?.length || 0} item
                              {(order.items?.length || 0) > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-6">
                        <div className="divide-y divide-gray-100">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                            >
                              <div className="flex items-center gap-3">
                                {item.product?.image ? (
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                                    <Package className="h-5 w-5 text-amber-500" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-gray-800 text-sm">
                                    {item.product?.name || item.name || "Product"}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Qty: {item.quantity} × ₹{item.price}
                                  </p>
                                </div>
                              </div>
                              <span className="font-semibold text-gray-700 text-sm">
                                ₹{item.quantity * item.price}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Address Snapshot */}
                        {order.address && (
                          <div className="mt-5 pt-4 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-500 bg-gray-50/50 p-3 rounded-xl">
                            <MapPin className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-gray-700">
                                Delivery To: {order.address.fullName} (📞 {order.address.phone})
                              </span>
                              <p className="text-gray-500 mt-0.5">
                                {order.address.address}, {order.address.city}, {order.address.state} - {order.address.pincode}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= PROFILE TAB ================= */}
        {activeTab === "profile" && (
          <div className="space-y-8">
            {/* 1. PERSONAL INFORMATION / EDIT PROFILE CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50/40 via-orange-50/30 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                    <p className="text-xs text-gray-500">Manage your name, email, and mobile number</p>
                  </div>
                </div>

                {!isEditingProfile && (
                  <button
                    onClick={() => {
                      setProfileError("");
                      setIsEditingProfile(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors shadow-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6">
                {profileError && (
                  <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                {isEditingProfile ? (
                  /* Edit Form */
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, name: e.target.value })
                          }
                          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                          placeholder="e.g. Suman Ramesh"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, email: e.target.value })
                            }
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                            placeholder="name@example.com"
                          />
                          <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-sm text-gray-500 font-medium">
                            +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            value={profileForm.phone}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                              })
                            }
                            className="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
                            placeholder="9876543210"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileError("");
                          setProfileForm({
                            name: user?.name || "",
                            email: user?.email || "",
                            phone: user?.phone || "",
                          });
                        }}
                        className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/20 transition disabled:opacity-50"
                      >
                        {isSavingProfile ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* View Mode */
                  <div className="space-y-6">
                    {/* User Hero Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50/50 via-orange-50/20 to-transparent border border-amber-100/60">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-sm shadow-amber-500/30 flex-shrink-0">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900">{user?.name || "Customer"}</h3>
                          {user?.isAdmin ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              <ShieldCheck className="h-3 w-3" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              <Sparkles className="h-3 w-3" /> Verified Member
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                          {user?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5 text-gray-400" />
                              {user.email}
                            </span>
                          )}
                          {user?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              +91 {user.phone}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Full Name
                        </span>
                        <p className="text-gray-900 font-semibold text-sm">{user?.name || "Not set"}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Email Address
                        </span>
                        <p className="text-gray-900 font-semibold text-sm truncate">
                          {user?.email || (
                            <span className="text-gray-400 font-normal italic">No email linked</span>
                          )}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Mobile Number
                        </span>
                        <p className="text-gray-900 font-semibold text-sm">
                          {user?.phone ? (
                            `+91 ${user.phone}`
                          ) : (
                            <span className="text-gray-400 font-normal italic">No phone linked</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. SAVED DELIVERY ADDRESSES SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Addresses Header */}
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50/40 via-orange-50/30 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">Manage Addresses</h2>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {addresses.length} Saved
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Add or edit delivery addresses for quick checkout</p>
                  </div>
                </div>

                {!isAddressFormOpen && (
                  <button
                    onClick={handleOpenAddAddress}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:from-amber-600 hover:to-orange-600 shadow-sm transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Address
                  </button>
                )}
              </div>

              {/* Addresses Content */}
              <div className="p-6">
                {/* Add / Edit Form Modal/Inline */}
                {isAddressFormOpen && (
                  <div className="mb-8 p-6 rounded-2xl bg-amber-50/30 border border-amber-200">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-200/60">
                      <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-amber-600" />
                        {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                      </h3>
                      <button
                        onClick={() => {
                          setIsAddressFormOpen(false);
                          resetAddressForm();
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {addressError && (
                      <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{addressError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveAddress} className="space-y-4">
                      {/* Name & Phone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Recipient Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.fullName}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, fullName: e.target.value })
                            }
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                            placeholder="e.g. Suman Ramesh"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            10-Digit Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-2.5 text-sm text-gray-500 font-medium">
                              +91
                            </span>
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              value={addressForm.phone}
                              onChange={(e) =>
                                setAddressForm({
                                  ...addressForm,
                                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                                })
                              }
                              className="w-full pl-12 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                              placeholder="9876543210"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Street Address */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Flat, House No, Building, Street, Area <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.address}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, address: e.target.value })
                          }
                          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                          placeholder="e.g. No. 14, 2nd Cross, Gandhi Nagar"
                        />
                      </div>

                      {/* City, State, Pincode */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            City / District <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.city}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, city: e.target.value })
                            }
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                            placeholder="e.g. Madurai"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            State <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={addressForm.state}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, state: e.target.value })
                            }
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                          >
                            {INDIAN_STATES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            6-Digit Pincode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={addressForm.pincode}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                              })
                            }
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                            placeholder="625001"
                          />
                        </div>
                      </div>

                      {/* Landmark */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          value={addressForm.landmark}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, landmark: e.target.value })
                          }
                          className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                          placeholder="e.g. Near Meenakshi Amman Temple / Opposite Bus Stop"
                        />
                      </div>

                      {/* Address Type & Default */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="block text-xs font-semibold text-gray-700 mb-2">
                            Address Type
                          </span>
                          <div className="flex gap-2">
                            {["Home", "Work", "Other"].map((typeOption) => {
                              const isSelected = addressForm.type === typeOption;
                              return (
                                <button
                                  type="button"
                                  key={typeOption}
                                  onClick={() =>
                                    setAddressForm({ ...addressForm, type: typeOption })
                                  }
                                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                                    isSelected
                                      ? "bg-amber-600 text-white shadow-xs"
                                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  {typeOption === "Home" && <Home className="h-3.5 w-3.5" />}
                                  {typeOption === "Work" && <Briefcase className="h-3.5 w-3.5" />}
                                  {typeOption === "Other" && <MapPin className="h-3.5 w-3.5" />}
                                  {typeOption}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 mt-2 sm:mt-5">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, isDefault: e.target.checked })
                            }
                            className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                          />
                          <span>Set as default address</span>
                        </label>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-200/60">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddressFormOpen(false);
                            resetAddressForm();
                          }}
                          className="px-5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingAddress}
                          className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:from-amber-600 hover:to-orange-600 shadow-md transition disabled:opacity-50"
                        >
                          {isSavingAddress ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              {editingAddressId ? "Update Address" : "Save Address"}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Address Cards Grid */}
                {isLoadingAddresses ? (
                  <div className="py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 text-amber-500 animate-spin" />
                    <p className="text-gray-400 text-xs mt-2">Loading saved addresses...</p>
                  </div>
                ) : addresses.length === 0 && !isAddressFormOpen ? (
                  <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <MapPin className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="text-base font-bold text-gray-800 mt-3">No Delivery Addresses Saved</h3>
                    <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto">
                      Save your shipping address now for effortless one-click checkout.
                    </p>
                    <button
                      onClick={handleOpenAddAddress}
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:from-amber-600 hover:to-orange-600 shadow-sm transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => {
                      const isDefault = addr.isDefault;
                      return (
                        <div
                          key={addr._id}
                          className={`relative p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                            isDefault
                              ? "border-amber-400 bg-amber-50/20 shadow-xs"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs"
                          }`}
                        >
                          <div>
                            {/* Card Badges */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                {addr.type === "Work" ? (
                                  <Briefcase className="h-3 w-3" />
                                ) : addr.type === "Home" ? (
                                  <Home className="h-3 w-3" />
                                ) : (
                                  <MapPin className="h-3 w-3" />
                                )}
                                {addr.type || "Home"}
                              </span>

                              {isDefault && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                  <Check className="h-3 w-3" /> Default
                                </span>
                              )}
                            </div>

                            {/* Recipient info */}
                            <div className="flex items-baseline gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 text-sm">{addr.fullName}</h4>
                              <span className="text-xs text-gray-500 font-medium">
                                📞 +91 {addr.phone}
                              </span>
                            </div>

                            {/* Full Address */}
                            <p className="text-xs text-gray-600 leading-relaxed mt-1">
                              {addr.address}
                              {addr.landmark ? `, Landmark: ${addr.landmark}` : ""}
                              <br />
                              {addr.city}, {addr.state} -{" "}
                              <span className="font-semibold text-gray-800">{addr.pincode}</span>
                            </p>
                          </div>

                          {/* Card Actions Footer */}
                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                            <div>
                              {!isDefault && (
                                <button
                                  onClick={() => handleSetDefaultAddress(addr._id)}
                                  className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                                >
                                  <Star className="h-3 w-3" /> Set Default
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditAddress(addr)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium transition"
                              >
                                <Edit3 className="h-3 w-3 text-gray-500" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr._id)}
                                disabled={deletingAddressId === addr._id}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 font-medium transition disabled:opacity-50"
                              >
                                {deletingAddressId === addr._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </section>
  );
};

export default MyAccount;