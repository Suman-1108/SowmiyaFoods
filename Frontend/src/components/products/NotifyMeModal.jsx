import React, { useState, useEffect } from "react";
import { Bell, X, CheckCircle2, AlertCircle, Package, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { requestProductNotification } from "../../api/productApi";

const NotifyMeModal = ({ isOpen, onClose, product }) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.email) setEmail(user.email);
          if (user.phone) setPhone(user.phone);
          if (user.name) setName(user.name);
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      toast.error("Please enter your email or phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await requestProductNotification(product._id, {
        email: email.trim(),
        phone: phone.trim(),
        name: name.trim(),
      });

      setIsSuccess(true);
      toast.success(res?.message || "You are on the waitlist! We will notify you when restocked.");

      // Notify admin portal listeners if active
      window.dispatchEvent(new CustomEvent("inventoryUpdated"));

      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit restock request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white">
                Back in Stock Alert
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                Get notified first when item is restocked
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Product Summary Preview */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/50 border border-amber-200/60 mb-5">
            <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-gray-900 truncate">
                {product.name}
              </h4>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {product.category || "Traditional Food"}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-600">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Currently Out of Stock</span>
              </div>
            </div>
          </div>

          {isSuccess ? (
            <div className="py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 border-2 border-emerald-300">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-black text-gray-900">You're on the Waitlist!</h4>
              <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto">
                We'll email or SMS you the instant fresh stock arrives at Sowmiya Foods.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                This item is temporarily sold out due to high demand. Enter your contact details below and our team will notify you immediately when available.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent transition bg-gray-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:border-transparent transition bg-gray-50/50"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-[#e8703b] hover:bg-[#d45f2a] text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving your request...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>Notify Me When In Stock</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-gray-400">
                🔒 We respect your privacy. No spam, only restocking alerts.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotifyMeModal;
