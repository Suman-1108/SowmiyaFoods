// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axiosInstance from "../api/axiosInstance";
import { getAllProducts, createProduct, updateProduct, deleteProduct, toggleProductStock } from "../api/productApi";
import { getAllOrders, updateOrderStatus } from "../api/orderApi";
import { getMetaPixelId, updateMetaPixelId, getCustomMetaScript, updateCustomMetaScript, getDiwaliPopupBanner, updateDiwaliPopupBanner } from "../api/settingApi";
import { getWhatsappStatus, saveWhatsappOnboarding } from "../api/whatsappApi";
import useWhatsappEmbeddedSignup from "../hooks/useWhatsappEmbeddedSignup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Users, Package, ShoppingBag, Plus, Edit, Trash2, ChevronDown, X, Check, Truck, Clock, CheckCircle, XCircle, Settings, MessageCircle, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

const Dashboard = () => {
  const [view, setView] = useState("users");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [trackingUpdates, setTrackingUpdates] = useState({});
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    description: "",
    image: null,
    imageUrl: "",
    inStock: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  
  // Settings state
  const [pixelId, setPixelId] = useState("");
  const [pixelInput, setPixelInput] = useState("");
  const [pixelJustUpdated, setPixelJustUpdated] = useState(false);
  const [pixelSaving, setPixelSaving] = useState(false);
  const [customScript, setCustomScript] = useState("");
  const [customScriptInput, setCustomScriptInput] = useState("");
  const [customScriptJustUpdated, setCustomScriptJustUpdated] = useState(false);
  const [customScriptSaving, setCustomScriptSaving] = useState(false);
  
  // Diwali Popup Banner state
  const [diwaliBannerUrl, setDiwaliBannerUrl] = useState("");
  const [diwaliBannerInput, setDiwaliBannerInput] = useState("");
  const [diwaliBannerFile, setDiwaliBannerFile] = useState(null);
  const [diwaliBannerJustUpdated, setDiwaliBannerJustUpdated] = useState(false);
  const [diwaliBannerSaving, setDiwaliBannerSaving] = useState(false);
  const [diwaliBannerPreview, setDiwaliBannerPreview] = useState(null);

  // WhatsApp Embedded Signup & Coexistence state
  const {
    isSdkLoaded: isWaSdkLoaded,
    loading: waSignupLoading,
    error: waSignupError,
    cancelled: waSignupCancelled,
    launchEmbeddedSignup,
  } = useWhatsappEmbeddedSignup();
  const [waStatus, setWaStatus] = useState(null);
  const [waStatusLoading, setWaStatusLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/auth/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    }
  };
  
  const handleUpdateOrder = async (id) => {
    const payload = {};
    if (statusUpdates[id]) payload.status = statusUpdates[id];
    if (trackingUpdates[id] !== undefined && trackingUpdates[id] !== "") payload.trackingNumber = trackingUpdates[id];

    if (!payload.status && !payload.trackingNumber) {
      toast.error("No changes to update");
      return;
    }

    try {
      await updateOrderStatus(id, payload, token);
      toast.success("Order updated successfully");
      fetchOrders();
      setStatusUpdates((prev) => ({ ...prev, [id]: "" }));
      setTrackingUpdates((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      toast.error("Failed to update order");
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await axiosInstance.delete(`/orders/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order deleted");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to delete order");
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders(token);
      setOrders(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch orders");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axiosInstance.delete(`/auth/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await axiosInstance.delete(`/auth/admin/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Address deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts(token);
      setProducts(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch products");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id, token);
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleStock = async (id, currentStock) => {
    try {
      await toggleProductStock(id, !currentStock, token);
      toast.success("Stock status updated");
      fetchProducts();
    } catch {
      toast.error("Failed to update stock status");
    }
  };

  // Product Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file, imageUrl: "" });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, imageUrl: url, image: null });
    setImagePreview(url);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      originalPrice: "",
      category: "",
      description: "",
      image: null,
      imageUrl: "",
      inStock: true,
    });
    setImagePreview(null);
    setEditingProduct(null);
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    let imageValue = formData.imageUrl || "";
    
    if (formData.image) {
      try {
        imageValue = await readFileAsBase64(formData.image);
      } catch (err) {
        toast.error("Failed to read image file");
        return;
      }
    }

    const payload = {
      name: formData.name,
      price: formData.price,
      category: formData.category,
      description: formData.description,
      inStock: formData.inStock,
    };
    
    if (formData.originalPrice) payload.originalPrice = formData.originalPrice;
    if (imageValue) payload.image = imageValue;

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);
        toast.success("Product updated successfully");
      } else {
        await createProduct(payload);
        toast.success("Product added successfully");
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save product");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || "",
      category: product.category || "",
      description: product.description || "",
      image: null,
      imageUrl: product.image || "",
      inStock: product.inStock !== false,
    });
    setImagePreview(product.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================= SETTINGS HANDLERS =================
  const fetchPixelId = async () => {
    try {
      const id = await getMetaPixelId();
      setPixelId(id);
      setPixelInput(id);
    } catch (err) {
      console.warn("Failed to fetch pixel ID");
    }
  };

  const handleSavePixelId = async () => {
    if (!token) return;
    setPixelSaving(true);
    setPixelJustUpdated(false);
    try {
      const savedId = await updateMetaPixelId(pixelInput, token);
      setPixelId(savedId);
      setPixelJustUpdated(true);
      setTimeout(() => setPixelJustUpdated(false), 3000);
      toast.success("Meta Pixel ID saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save Meta Pixel ID");
    } finally {
      setPixelSaving(false);
    }
  };

  const fetchCustomScript = async () => {
    try {
      const script = await getCustomMetaScript();
      setCustomScript(script);
      setCustomScriptInput(script);
    } catch (err) {
      console.warn("Failed to fetch custom meta script");
    }
  };

  const handleSaveCustomScript = async () => {
    if (!token) return;
    setCustomScriptSaving(true);
    setCustomScriptJustUpdated(false);
    try {
      const savedScript = await updateCustomMetaScript(customScriptInput, token);
      setCustomScript(savedScript);
      setCustomScriptJustUpdated(true);
      setTimeout(() => setCustomScriptJustUpdated(false), 3000);
      toast.success("Custom meta script saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save custom meta script");
    } finally {
      setCustomScriptSaving(false);
    }
  };

  // Diwali Popup Banner Handlers
  const fetchDiwaliBanner = async () => {
    try {
      const bannerUrl = await getDiwaliPopupBanner();
      setDiwaliBannerUrl(bannerUrl);
      setDiwaliBannerInput(bannerUrl);
      if (bannerUrl) {
        setDiwaliBannerPreview(bannerUrl);
      }
    } catch (err) {
      console.warn("Failed to fetch Diwali popup banner");
    }
  };

  const handleDiwaliBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDiwaliBannerFile(file);
      setDiwaliBannerInput("");
      setDiwaliBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleDiwaliBannerUrlChange = (e) => {
    const url = e.target.value;
    setDiwaliBannerInput(url);
    setDiwaliBannerFile(null);
    setDiwaliBannerPreview(url);
  };

  const handleSaveDiwaliBanner = async () => {
    if (!token) return;
    setDiwaliBannerSaving(true);
    setDiwaliBannerJustUpdated(false);
    try {
      let imageValue = diwaliBannerInput;
      
      if (diwaliBannerFile) {
        try {
          imageValue = await readFileAsBase64(diwaliBannerFile);
        } catch (err) {
          toast.error("Failed to read image file");
          setDiwaliBannerSaving(false);
          return;
        }
      }
      
      if (!imageValue) {
        toast.error("Please upload an image or enter a URL");
        setDiwaliBannerSaving(false);
        return;
      }
      
      const savedUrl = await updateDiwaliPopupBanner(imageValue, token);
      setDiwaliBannerUrl(savedUrl);
      setDiwaliBannerJustUpdated(true);
      setTimeout(() => setDiwaliBannerJustUpdated(false), 3000);
      toast.success("Diwali popup banner saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save Diwali popup banner");
    } finally {
      setDiwaliBannerSaving(false);
    }
  };

  // WhatsApp Status and Embedded Signup Handlers
  const fetchWhatsappStatusData = async () => {
    setWaStatusLoading(true);
    try {
      const data = await getWhatsappStatus(token);
      setWaStatus(data);
    } catch (err) {
      console.warn("Failed to fetch WhatsApp status");
    } finally {
      setWaStatusLoading(false);
    }
  };

  const handleConnectWhatsapp = () => {
    launchEmbeddedSignup(async (payload) => {
      try {
        const res = await saveWhatsappOnboarding(payload, token);
        setWaStatus(res);
        toast.success("WhatsApp Business connected successfully!");
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || "Failed to complete WhatsApp onboarding";
        toast.error(errMsg);
        throw err;
      }
    });
  };

  useEffect(() => {
    if (!token) {
      toast.error("You must be logged in as admin!");
      navigate("/admin-login");
      return;
    }
    setLoading(true);
    if (view === "users") fetchUsers();
    else if (view === "orders") fetchOrders();
    else if (view === "products") fetchProducts();
    else if (view === "settings") {
      fetchPixelId();
      fetchCustomScript();
      fetchDiwaliBanner();
      fetchWhatsappStatusData();
    }
    setLoading(false);
  }, [view]);

  const statusBadge = (status) => {
    const styles = {
      paid: "bg-yellow-100 text-yellow-700 border-yellow-300",
      processing: "bg-blue-100 text-blue-700 border-blue-300",
      shipped: "bg-purple-100 text-purple-700 border-purple-300",
      delivered: "bg-green-100 text-green-700 border-green-300",
      cancelled: "bg-red-100 text-red-700 border-red-300",
    };
    return `px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.paid}`;
  };

  const NavButton = ({ label, icon: Icon, value }) => (
    <button
      onClick={() => setView(value)}
      className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
        view === value
          ? "bg-[#1e3a5f] text-white shadow-lg"
          : "bg-white text-gray-600 border border-gray-200 hover:border-[#1e3a5f] hover:text-[#1e3a5f] shadow-sm"
      }`}
    >
      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
      {label}
    </button>
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a5f] mx-auto" />
          <p className="text-gray-500 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-4 md:py-8">
        <div className="container mx-auto px-3 md:px-4">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Manage your store — users, orders, and products</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8 overflow-x-auto pb-1 scrollbar-hide">
            <NavButton label="Users" icon={Users} value="users" />
            <NavButton label="Orders" icon={ShoppingBag} value="orders" />
            <NavButton label="Products" icon={Package} value="products" />
            <NavButton label="Settings" icon={Settings} value="settings" />
          </div>

          {/* ================= USERS TABLE ================= */}
          {view === "users" && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#1e3a5f]" />
                  Registered Users
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Addresses</th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6 font-medium text-gray-800">{u.name}</td>
                        <td className="py-3 px-6 text-gray-600">{u.email}</td>
                        <td className="py-3 px-6">
                          {u.isAdmin ? (
                            <span className="bg-[#1e3a5f]/10 text-[#1e3a5f] px-2.5 py-0.5 rounded-full text-xs font-semibold">Admin</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">User</span>
                          )}
                        </td>
                        <td className="py-3 px-6">
                          {u.addresses?.length ? (
                            <div className="space-y-1">
                              {u.addresses.map((a) => (
                                <div key={a._id} className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-2 py-1 text-sm">
                                  <span className="text-gray-600 truncate">{a.fullName}, {a.city}</span>
                                  <button
                                    onClick={() => handleDeleteAddress(a._id)}
                                    className="text-red-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No addresses</span>
                          )}
                        </td>
                        <td className="py-3 px-6">
                          {!u.isAdmin && (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= ORDERS TABLE ================= */}
          {view === "orders" && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-[#1e3a5f]" />
                  All Orders
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking #</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length ? (
                      orders.map((o) => (
                        <tr key={o._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors align-top">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <p className="font-mono font-semibold text-gray-800 text-sm">{o.orderId || o._id}</p>
                            <p className="text-xs text-gray-400 mt-0.5">ID: {o.paymentId?.slice(-8) || "N/A"}</p>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <p className="font-medium text-gray-800 text-sm">{o.address?.fullName || "N/A"}</p>
                            <p className="text-xs text-gray-400">{o.address?.phone || "-"}</p>
                          </td>
                          <td className="py-3 px-4 max-w-[200px]">
                            <p className="text-sm text-gray-600">
                              {o.address ? `${o.address.address}, ${o.address.city}` : "N/A"}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {o.products?.map((p, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  {p.img && (
                                    <img src={p.img} alt="" className="w-7 h-7 rounded object-cover border" />
                                  )}
                                  <span className="text-gray-600">
                                    {p.name} ×{p.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-800 whitespace-nowrap">
                            ₹{o.totalAmount}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                            {o.date
                              ? new Date(o.date).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                })
                              : "N/A"}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <select
                              value={statusUpdates[o._id] ?? o.status}
                              onChange={(e) =>
                                setStatusUpdates((prev) => ({ ...prev, [o._id]: e.target.value }))
                              }
                              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                            >
                              <option value="paid">Paid</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <span className={`ml-2 ${statusBadge(o.status)}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <input
                              type="text"
                              placeholder={o.trackingNumber || "Add tracking #"}
                              value={trackingUpdates[o._id] ?? o.trackingNumber ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTrackingUpdates((prev) => ({ ...prev, [o._id]: val }));
                              }}
                              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-32 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none"
                            />
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => handleUpdateOrder(o._id)}
                                className="bg-[#1e3a5f] text-white px-3 py-1.5 rounded-lg hover:bg-[#2a4a7a] transition-colors text-xs font-medium flex items-center gap-1"
                              >
                                <Check className="h-3 w-3" />
                                Update
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(o._id)}
                                className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-8 text-gray-400">
                          <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= PRODUCTS SECTION ================= */}
          {view === "products" && (
            <div className="space-y-6">
              {/* Add/Edit Product Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    {editingProduct ? (
                      <>
                        <Edit className="h-5 w-5 text-[#1e3a5f]" />
                        Edit Product
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 text-[#1e3a5f]" />
                        Add New Product
                      </>
                    )}
                  </h2>
                </div>
                <div className="p-6">
                  <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹, optional)</label>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all"
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="Millet">Millet</option>
                        <option value="Instant Products">Instant Products</option>
                        <option value="Noodles">Noodles</option>
                        <option value="Semiya">Semiya</option>
                        <option value="Flour Items">Flour Items</option>
                        <option value="Rava Sooji">Rava Sooji</option>
                        <option value="Pickles">Pickles</option>
                        <option value="Thokku">Thokku</option>
                        <option value="Traditional Mix">Traditional Mix</option>
                        <option value="Appalam">Appalam</option>
                        <option disabled>──────────</option>
                        <option value="VERMICELLI">VERMICELLI (Legacy)</option>
                        <option value="RAVA">RAVA (Legacy)</option>
                        <option value="FLOUR">FLOUR (Legacy)</option>
                        <option value="NOODLES">NOODLES (Legacy)</option>
                        <option value="INSTANT PRODUCTS">INSTANT PRODUCTS (Legacy)</option>
                        <option value="Millet Products">Millet Products (Legacy)</option>
                        <option value="Sooji">Sooji (Legacy)</option>
                        <option value="Maida">Maida (Legacy)</option>
                        <option value="puppet">Puppet (Legacy)</option>
                        <option value="snacks">Snacks (Legacy)</option>
                        <option value="pickles">Pickles (Legacy)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image <span className="text-gray-400 font-normal">(upload or paste URL)</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg cursor-pointer hover:bg-[#2a4a7a] transition-colors text-sm w-fit">
                          <Plus className="h-4 w-4" />
                          Upload
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                        <input
                          type="text"
                          placeholder="Or paste image URL..."
                          value={formData.imageUrl}
                          onChange={handleImageUrlChange}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all text-sm"
                        />
                      </div>
                      {imagePreview && (
                        <div className="mt-2">
                          <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.inStock}
                          onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                        />
                        <span className="text-sm font-medium text-gray-700">In Stock</span>
                      </label>
                    </div>
                    <div className="md:col-span-2 flex gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2a4a7a] transition-colors font-medium text-sm"
                      >
                        {editingProduct ? "Update Product" : "Add Product"}
                      </button>
                      {editingProduct && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#1e3a5f]" />
                    All Products ({products.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length ? (
                        products.map((p) => (
                          <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <img src={p.image || "/placeholder.png"} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                            </td>
                            <td className="py-3 px-4 font-medium text-gray-800 text-sm">{p.name}</td>
                            <td className="py-3 px-4">
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">{p.category || "N/A"}</span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {p.originalPrice && (
                                <span className="line-through text-gray-400 text-xs mr-1">₹{p.originalPrice}</span>
                              )}
                              <span className="font-bold text-gray-800">₹{p.price}</span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleStock(p._id, p.inStock)}
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  p.inStock
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {p.inStock ? "In Stock" : "Out of Stock"}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditProduct(p)}
                                  className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium flex items-center gap-1"
                                >
                                  <Edit className="h-3 w-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p._id)}
                                  className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium flex items-center gap-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-gray-400">
                            <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            No products found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= SETTINGS SECTION ================= */}
          {view === "settings" && (
            <div className="space-y-6">
              {/* <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#1e3a5f]" />
                    Meta Ads Pixel Settings
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-4">
                    Enter your Meta (Facebook) Pixel ID below to enable conversion tracking on your website. 
                    The pixel script will be automatically loaded on all pages.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <div className="w-full sm:flex-1 relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Pixel ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. 123456789012345"
                          value={pixelInput}
                          onChange={(e) => setPixelInput(e.target.value)}
                          className={`w-full border rounded-lg px-3 py-2.5 pr-10 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none transition-all ${
                            pixelJustUpdated
                              ? "border-green-400 bg-green-50"
                              : "border-gray-200"
                          }`}
                        />
                        {pixelJustUpdated && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      {pixelJustUpdated && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Saved successfully
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSavePixelId}
                      disabled={pixelSaving}
                      className={`px-6 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                        pixelSaving
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-[#1e3a5f] text-white hover:bg-[#2a4a7a]"
                      }`}
                    >
                      {pixelSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                  {pixelId && !pixelJustUpdated && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        Saved Pixel ID: <span className="font-mono font-semibold text-gray-800">{pixelId}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div> */}

              {/* Custom Meta Script Section */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#1e3a5f]" />
                    Custom Meta Script Settings
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-4">
                    Add custom scripts (like Google Analytics, verification codes, or other tracking scripts) that will be injected into the head tag of all pages.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="w-full relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Script
                      </label>
                      <textarea
                        placeholder="Paste your script code here... (e.g., <script>...</script> or any JavaScript code)"
                        value={customScriptInput}
                        onChange={(e) => setCustomScriptInput(e.target.value)}
                        rows={6}
                        className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none transition-all font-mono text-sm ${
                          customScriptJustUpdated
                            ? "border-green-400 bg-green-50"
                            : "border-gray-200"
                        }`}
                      />
                      {customScriptJustUpdated && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Saved successfully
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSaveCustomScript}
                      disabled={customScriptSaving}
                      className={`px-6 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors w-fit ${
                        customScriptSaving
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-[#1e3a5f] text-white hover:bg-[#2a4a7a]"
                      }`}
                    >
                      {customScriptSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Save Script
                        </>
                      )}
                    </button>
                  </div>
                  {customScript && !customScriptJustUpdated && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        Custom script is active and will be injected into all pages.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Diwali Popup Banner Section */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-[#1e3a5f]" />
                    Diwali Popup Banner Settings
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-4">
                    Upload or paste a URL for the Diwali popup banner image. This image will be displayed at the top of the Diwali popup on the homepage.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Banner Image
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg cursor-pointer hover:bg-[#2a4a7a] transition-colors text-sm w-fit">
                          <Plus className="h-4 w-4" />
                          Upload Image
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleDiwaliBannerFileChange} 
                            className="hidden" 
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="Or paste image URL..."
                          value={diwaliBannerInput}
                          onChange={handleDiwaliBannerUrlChange}
                          className={`flex-1 border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#1e3a5f]/20 focus:outline-none transition-all text-sm ${
                            diwaliBannerJustUpdated
                              ? "border-green-400 bg-green-50"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      {diwaliBannerJustUpdated && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Saved successfully
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSaveDiwaliBanner}
                      disabled={diwaliBannerSaving}
                      className={`px-6 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors w-fit ${
                        diwaliBannerSaving
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-[#1e3a5f] text-white hover:bg-[#2a4a7a]"
                      }`}
                    >
                      {diwaliBannerSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Save Banner
                        </>
                      )}
                    </button>
                  </div>
                  {diwaliBannerPreview && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Current Banner Preview:</p>
                      <img 
                        src={diwaliBannerPreview} 
                        alt="Diwali Popup Banner Preview" 
                        className="w-full max-w-md h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {diwaliBannerUrl && !diwaliBannerJustUpdated && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        Banner is active and will be displayed in the Diwali popup.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Business App Coexistence & Embedded Signup Section */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    WhatsApp Business App Coexistence
                  </h2>
                  {waStatus?.onboarded ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      Connected (Coexistence Active)
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                      Not Connected
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Connect your existing WhatsApp Business mobile app number to the WhatsApp Business Platform via Meta Embedded Signup (v4) with Business App Coexistence enabled. This enables automated catalog browsing, cart management, and messaging for Sowmiya Foods while keeping your mobile WhatsApp app active.
                  </p>

                  {waSignupError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                      <span>{waSignupError}</span>
                    </div>
                  )}

                  {waSignupCancelled && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Embedded Signup was cancelled. Click the button below to retry.</span>
                    </div>
                  )}

                  {waStatus?.onboarded && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-sm text-gray-700">
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <span>{waStatus.businessName}</span>
                        {waStatus.displayPhoneNumber && (
                          <span className="text-gray-500 font-normal">({waStatus.displayPhoneNumber})</span>
                        )}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-200 text-xs font-mono text-gray-600">
                        <div>
                          <span className="font-sans font-medium text-gray-500">WABA ID:</span> {waStatus.wabaId || "N/A"}
                        </div>
                        <div>
                          <span className="font-sans font-medium text-gray-500">Phone Number ID:</span> {waStatus.phoneNumberId || "N/A"}
                        </div>
                        <div>
                          <span className="font-sans font-medium text-gray-500">Webhook Status:</span>{" "}
                          <span className="text-green-600 font-semibold">{waStatus.webhookStatus || "Active"}</span>
                        </div>
                        {waStatus.onboardedAt && (
                          <div>
                            <span className="font-sans font-medium text-gray-500">Onboarded:</span>{" "}
                            {new Date(waStatus.onboardedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleConnectWhatsapp}
                      disabled={waSignupLoading || waStatusLoading}
                      className={`px-6 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                        waSignupLoading || waStatusLoading
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
                      }`}
                    >
                      {waSignupLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Connecting WhatsApp...
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4" />
                          {waStatus?.onboarded ? "Reconnect / Update WhatsApp Business" : "Connect WhatsApp Business"}
                        </>
                      )}
                    </button>

                    {waStatus?.onboarded && (
                      <button
                        onClick={fetchWhatsappStatusData}
                        disabled={waStatusLoading}
                        className="px-4 py-2.5 rounded-lg border border-gray-300 font-medium text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <RefreshCw className={`h-4 w-4 text-gray-500 ${waStatusLoading ? "animate-spin" : ""}`} />
                        Refresh Status
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;