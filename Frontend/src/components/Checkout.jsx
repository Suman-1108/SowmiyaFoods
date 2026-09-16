// src/pages/Checkout.jsx
import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  MapPin,
  Check,
  Plus,
  Home,
  Briefcase,
  Sparkles,
  User,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import gpay from "../assets/gpay.png";
import phonepe from "../assets/phonepe.png";
import paytm from "../assets/paytm.png";
import bhim from "../assets/bhim.png";

const INDIAN_STATES = [
  "Tamil Nadu",
  "Pondicherry",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Delhi",
  "Gujarat",
  "Goa",
  "Haryana",
  "Punjab",
  "Rajasthan",
  "Uttar Pradesh",
  "West Bengal",
  "Rest of India",
];

// Delivery charge logic based on courier chart
export const calculateDeliveryCharge = (state, totalWeight) => {
  if (!state) return 0;
  const weightKg = Number(totalWeight) || 0;
  const units = weightKg > 0 ? Math.ceil(weightKg) : 1;
  const s = state.trim().toLowerCase();

  if (s === "tamil nadu" || s === "pondicherry" || s === "puducherry") {
    return units * 50;
  }
  if (
    [
      "kerala",
      "andhra pradesh",
      "karnataka",
      "telangana",
    ].includes(s)
  ) {
    return units * 75;
  }
  // All other states / Rest of India
  return units * 300;
};

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

  // Retrieve user from context or localStorage
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const user = authUser || storedUser;
  const userId = user?.id || user?._id;

  // Receive total amount and total weight from Cart
  const { totalAmount = 0, totalWeight = 0 } = location.state || {};

  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [finalAmount, setFinalAmount] = useState(totalAmount);
  const [selectedPaymentMethod] = useState("razorpay");
  const [licenseInfo, setLicenseInfo] = useState({ fssaiLicense: "", gstin: "", gstRate: "5" });

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [saveToAccount, setSaveToAccount] = useState(true);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  // Fetch license info on mount
  useEffect(() => {
    axiosInstance
      .get("/settings/license-info")
      .then((res) => setLicenseInfo(res.data))
      .catch(() => {});
  }, []);

  // Apply a selected address into form & calculate delivery
  const applyAddress = useCallback(
    (addr, showToast = false) => {
      setSelectedAddressId(addr._id);
      const updatedForm = {
        fullName: addr.fullName || "",
        phone: addr.phone || "",
        email: user?.email || form.email || "",
        address: addr.address || "",
        city: addr.city || "",
        state: addr.state || "",
        pincode: addr.pincode || "",
        landmark: addr.landmark || "",
      };
      setForm(updatedForm);

      const charge = calculateDeliveryCharge(addr.state, totalWeight);
      setDeliveryCharge(charge);
      setFinalAmount(totalAmount + charge);

      if (showToast) {
        toast.success(`Autofilled with ${addr.type || "saved"} address!`);
      }
    },
    [totalAmount, totalWeight, user, form.email]
  );

  // Fetch saved addresses from My Account
  useEffect(() => {
    if (!userId) {
      return;
    }

    const fetchAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        const { data } = await axiosInstance.get(`/address/${userId}`);
        const addressesList = Array.isArray(data) ? data : [];
        setSavedAddresses(addressesList);

        if (addressesList.length > 0) {
          // Find default address or the first address
          const defaultAddr = addressesList.find((a) => a.isDefault) || addressesList[0];
          applyAddress(defaultAddr, false);
        } else if (user) {
          // No saved addresses yet, but prefill user's contact information
          setForm((prev) => ({
            ...prev,
            fullName: user.name || prev.fullName || "",
            phone: user.phone || prev.phone || "",
            email: user.email || prev.email || "",
          }));
        }
      } catch (err) {
        console.error("Error fetching user addresses:", err);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [userId, applyAddress]);

  // Handle switching to a new address
  const handleSelectNewAddress = () => {
    setSelectedAddressId("new");
    setForm({
      fullName: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || form.email || "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    });
    setDeliveryCharge(0);
    setFinalAmount(totalAmount);
    toast("Entered new address mode. Fill details below.", { icon: "📝" });
  };

  // Re-autofill default address
  const handleAutofillDefault = () => {
    if (savedAddresses.length === 0) return;
    const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
    if (defaultAddr) {
      applyAddress(defaultAddr, true);
    }
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    if (name === "state") {
      const charge = calculateDeliveryCharge(value, totalWeight);
      setDeliveryCharge(charge);
      setFinalAmount(totalAmount + charge);
    }
  };

  // Razorpay script loader
  const loadRazorpayScript = (src) =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // Handle Razorpay Payment
  const handleRazorpayPayment = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];

    for (const key of requiredFields) {
      if (!form[key]?.trim()) {
        return toast.error(`Please fill your ${key}`);
      }
    }

    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }

    if (form.pincode && form.pincode.replace(/\D/g, "").length !== 6) {
      return toast.error("Please enter a valid 6-digit pincode");
    }

    // Determine user ID
    const effectiveUserId =
      userId ||
      localStorage.getItem("guestUserId") ||
      `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!userId) {
      localStorage.setItem("guestUserId", effectiveUserId);
    }

    try {
      // Save address if user entered a new address and opted to save to account
      if (userId) {
        if ((selectedAddressId === "new" || savedAddresses.length === 0) && saveToAccount) {
          try {
            await axiosInstance.post("/address", {
              userId,
              ...form,
            });
          } catch (addrErr) {
            console.warn("Could not save new address to account:", addrErr);
          }
        }
      } else {
        // Guest user: save address for reference
        try {
          await axiosInstance.post("/address", {
            userId: effectiveUserId,
            ...form,
          });
        } catch {}
      }

      const sdkLoaded = await loadRazorpayScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      if (!sdkLoaded) return toast.error("Failed to load Razorpay SDK.");

      const { data: order } = await axiosInstance.post("/payment/orders", {
        amount: finalAmount,
      });

      const options = {
        key: order.key || import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Sowmiya Foods",
        description: "Order Payment",
        image: "https://api.dicebear.com/7.x/initials/svg?seed=SF&backgroundColor=1B3D2B",
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axiosInstance.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verifyRes.data.verified)
              return toast.error("Payment verification failed!");

            await axiosInstance.post("/orders", {
              userId: effectiveUserId,
              products: cart.products.map((p) => ({
                productId: p._id,
                name: p.name,
                category: p.category || "",
                quantity: p.quantity,
                price: p.price,
                subtotal: p.subtotal,
                img: p.image || p.img || "",
              })),
              totalAmount: finalAmount,
              deliveryCharge,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              paymentMethod: "Razorpay",
              address: form,
              customerEmail: form.email,
            });

            toast.success("Order placed successfully!");
            clearCart();
            navigate("/orders");
          } catch (err) {
            console.error(err);
            toast.error("Payment verification or order saving failed.");
          }
        },
        prefill: {
          name: form.fullName?.trim() || "",
          contact: form.phone ? form.phone.replace(/[^\d+]/g, "").trim() : "",
          ...(form.email && form.email.trim() ? { email: form.email.trim() } : {}),
        },
        notes: {
          address: `${form.address || ""}, ${form.city || ""}, ${form.state || ""} - ${form.pincode || ""}`.substring(0, 200),
        },
        theme: { color: "#1a1a2a" },
        modal: {
          ondismiss: () => {
            console.log("[Razorpay] Payment modal closed by user");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error("[Razorpay] Payment failed:", response.error);
        toast.error(response.error.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      const errMsg =
        err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errMsg);
    }
  };

  const handleSubmit = (e) => {
    handleRazorpayPayment(e);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back to cart link */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 mb-4 flex items-center gap-2 hover:text-gray-900 font-medium transition cursor-pointer"
        >
          ← Back to cart
        </button>

        {/* Checkout heading */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-2">Checkout</h1>
          <p className="text-gray-600 text-sm">
            Pay securely — your order is confirmed instantly after payment.
          </p>
        </div>

        {/* Guest Banner if not logged in */}
        {!userId && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-50 border border-amber-200/80 flex items-center justify-between gap-4 flex-wrap shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Have a Sowmiya Foods account?</p>
                <p className="text-xs text-gray-600">
                  Log in to autofill your saved addresses from My Account.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login", { state: { from: "/checkout" } })}
              className="px-4 py-2 text-xs font-bold text-white bg-[#1a1a2e] hover:bg-[#2a2a3e] rounded-xl transition shadow-xs cursor-pointer"
            >
              Log In to Autofill
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery details card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            {/* Header with Autofill CTA */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-[#1a1a2e] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  Delivery details
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter delivery address or select a saved one
                </p>
              </div>

              {userId && savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={handleAutofillDefault}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition shadow-2xs cursor-pointer"
                  title="Autofill default saved address"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Autofill Default
                </button>
              )}
            </div>

            {/* Saved Addresses Selector (for logged-in users) */}
            {userId && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Saved Addresses
                    </span>
                    {isLoadingAddresses ? (
                      <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {savedAddresses.length} available
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/my-account?tab=profile")}
                    className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    Manage in My Account
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {isLoadingAddresses ? (
                  <div className="py-4 text-center text-xs text-gray-400">
                    Loading saved addresses...
                  </div>
                ) : savedAddresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr._id;
                      return (
                        <div
                          key={addr._id}
                          onClick={() => applyAddress(addr, true)}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left ${
                            isSelected
                              ? "border-amber-600 bg-white shadow-sm ring-1 ring-amber-500/20"
                              : "border-gray-200 bg-white/90 hover:border-amber-300 hover:bg-white"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                {addr.type === "Work" ? (
                                  <Briefcase className="w-2.5 h-2.5" />
                                ) : (
                                  <Home className="w-2.5 h-2.5" />
                                )}
                                {addr.type || "Home"}
                              </span>

                              <div className="flex items-center gap-1">
                                {addr.isDefault && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                    Default
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                                    Active
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-xs font-bold text-gray-900">{addr.fullName}</p>
                            <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                              {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-1.5 font-medium">
                              📞 +91 {addr.phone}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* "+ Use a Different Address" Tile */}
                    <div
                      onClick={handleSelectNewAddress}
                      className={`p-3.5 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center min-h-[100px] ${
                        selectedAddressId === "new"
                          ? "border-amber-600 bg-white text-amber-900 shadow-sm"
                          : "border-gray-300 bg-white/70 text-gray-600 hover:border-amber-300 hover:text-gray-900 hover:bg-white"
                      }`}
                    >
                      <Plus className="w-5 h-5 mb-1 text-amber-600" />
                      <span className="text-xs font-bold">Use a Different Address</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        Type custom delivery details
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-amber-200/50 text-xs text-gray-600 flex items-center justify-between">
                    <span>No saved addresses found in your account yet.</span>
                    <span className="text-amber-700 font-semibold">Fill below to save one!</span>
                  </div>
                )}
              </div>
            )}

            {/* Input Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Name field */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-[#FFF8F0]"
                />
              </div>

              {/* Phone field */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm text-gray-500 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    placeholder="10-digit mobile number"
                    required
                    className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-[#FFF8F0]"
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Email Address <span className="text-xs font-normal text-gray-400">(For order confirmation & invoice)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-[#FFF8F0]"
                />
              </div>
            </div>

            {/* Address field */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Street Address / House No / Flat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="House/flat no, building, street, area"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-[#FFF8F0]"
              />
            </div>

            {/* Landmark (Optional) */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Landmark <span className="text-xs font-normal text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                placeholder="Near landmark, bus stop, or temple"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-[#FFF8F0]"
              />
            </div>

            {/* City & Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Madurai, Chennai"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-[#FFF8F0]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                    })
                  }
                  placeholder="6-digit pincode"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-[#FFF8F0]"
                />
              </div>
            </div>

            {/* State Dropdown */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                State <span className="text-red-500">*</span>
              </label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-[#FFF8F0]"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.concat(
                  form.state && !INDIAN_STATES.includes(form.state) ? [form.state] : []
                ).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              <div className="mt-3 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-gray-600 leading-relaxed space-y-1">
                <p>
                  <strong>Tamil Nadu & Pondicherry:</strong> ₹50 per kg
                </p>
                <p>
                  <strong>Andhra Pradesh, Karnataka, Kerala & Telangana:</strong> ₹75 per kg
                </p>
                <p>
                  <strong>Rest of India:</strong> ₹300 per kg
                </p>
              </div>
            </div>

            {/* Save address checkbox (for logged-in user entering new address) */}
            {userId && (selectedAddressId === "new" || savedAddresses.length === 0) && (
              <div className="pt-3 border-t border-gray-100">
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={saveToAccount}
                    onChange={(e) => setSaveToAccount(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300"
                  />
                  <span>Save this address to My Account for fast 1-click checkout next time</span>
                </label>
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-4">
              Payment method
            </h2>

            {/* UPI Payment Option */}
            <div className="border-2 rounded-xl p-4 transition border-red-500 bg-red-50/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-500 shadow-xs">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[#1a1a2e]">Pay via any UPI / Cards / NetBanking</p>
                  <p className="text-xs text-gray-600">
                    Google Pay · PhonePe · Paytm · BHIM · Cards · NetBanking
                  </p>
                </div>
              </div>

              {/* UPI App Logos */}
              <div className="flex flex-wrap gap-3 mt-3">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
                  <img src={gpay} alt="GPay" className="w-7 h-7 object-contain" />
                  <span className="text-xs font-medium text-gray-700">GPay</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
                  <img src={phonepe} alt="PhonePe" className="w-7 h-7 object-contain" />
                  <span className="text-xs font-medium text-gray-700">PhonePe</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
                  <img src={paytm} alt="Paytm" className="w-7 h-7 object-contain" />
                  <span className="text-xs font-medium text-gray-700">Paytm</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs">
                  <img src={bhim} alt="BHIM" className="w-7 h-7 object-contain" />
                  <span className="text-xs font-medium text-gray-700">BHIM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment summary and button */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="space-y-2 mb-4 text-gray-700 text-sm">
              <p className="flex justify-between">
                <span>Total Amount (before delivery):</span>
                <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
              </p>
              <p className="flex justify-between">
                <span>Total Weight:</span>
                <span className="font-semibold">{totalWeight.toFixed(2)} kg</span>
              </p>
              <p className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className="font-semibold">
                  {form.state ? `₹${deliveryCharge.toFixed(2)}` : "Select state to calculate"}
                </span>
              </p>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <p className="flex justify-between text-lg font-bold text-[#1a1a2e]">
                  <span>Total Payable:</span>
                  <span>₹{finalAmount.toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* License Numbers */}
            {(licenseInfo.fssaiLicense || licenseInfo.gstin) && (
              <div className="mb-4 pt-2 border-t border-gray-100 text-xs text-gray-400 space-y-1">
                {licenseInfo.fssaiLicense && (
                  <p className="text-center">FSSAI Lic No: {licenseInfo.fssaiLicense}</p>
                )}
                {licenseInfo.gstin && (
                  <p className="text-center">GSTIN: {licenseInfo.gstin}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!form.state}
              className="w-full bg-[#1a1a2e] text-white py-4 rounded-xl hover:bg-[#2a2a3e] transition flex flex-col items-center hover:cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
            >
              <span className="text-lg font-semibold">
                Proceed to Pay ₹{finalAmount.toFixed(2)}
              </span>
              <span className="text-xs text-gray-300">
                {form.state
                  ? `(Including ₹${deliveryCharge.toFixed(2)} delivery)`
                  : "Please select a state above"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
