import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster, resolveValue, toast } from "react-hot-toast";
import { CheckCircle2, AlertCircle, Loader2, Sparkles, X } from "lucide-react";

import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Products from "./pages/Products";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import Cart from "./components/Cart";
import CategoryProducts from "./components/products/CategoryProducts";
import ProductDetails from "./components/products/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import MyAccount from "./pages/MyAccount";
import SearchResults from "./components/products/SearchResults";
import AllProducts from "./components/products/AllProducts";
import Checkout from "./components/Checkout";
import Dashboard from "./pages/Dashboard";
import MetaPixel from "./components/MetaPixel";
import CustomMetaScript from "./components/CustomMetaScript";
import SplashScreen from "./components/common/SplashScreen";

// Admin Modules
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminRazorpay from "./pages/admin/AdminRazorpay";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminDeveloperMode from "./pages/admin/AdminDeveloperMode";

// Bottom Snackpopup Toaster (  snackpopup notification across the entire application)
const BottomSnackToaster = () => {
  return (
    <Toaster
      position="bottom-center"
      reverseOrder={false}
      gutter={10}
      containerStyle={{
        bottom: 24,
        zIndex: 99999,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
          border: "none",
          maxWidth: "92vw",
        },
      }}
    >
      {(t) => {
        const isSuccess = t.type === "success";
        const isError = t.type === "error";
        const isLoading = t.type === "loading";

        return (
          <div
            role="status"
            aria-live="polite"
            className={`w-[94vw] sm:w-auto sm:min-w-[360px] max-w-lg bg-zinc-900/95 text-white rounded-xl shadow-[0_12px_45px_rgba(0,0,0,0.65)] border border-zinc-700/80 p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 sm:gap-4 select-none backdrop-blur-md transition-all duration-300 ${t.visible ? "animate-toast-in" : "animate-toast-out"
              }`}
          >
            {/* Left: Type Badge Icon + Content */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Type Badge Icon */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSuccess
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : isError
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                        : isLoading
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    }`}
                >
                  {isSuccess && <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />}
                  {isError && <AlertCircle className="w-5 h-5 stroke-[2.2]" />}
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {!isSuccess && !isError && !isLoading && (
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  )}
                </div>

                {/* Status Dot */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${isSuccess
                      ? "bg-emerald-400"
                      : isError
                        ? "bg-rose-400"
                        : "bg-amber-400"
                    } animate-pulse`}
                />
              </div>

              {/* Message */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white tracking-wide leading-snug break-words">
                  {resolveValue(t.message, t)}
                </p>
              </div>
            </div>

            {/* Right: Close Button */}
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer flex-shrink-0"
              title="Close"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      }}
    </Toaster>
  );
};

function App() {
  return (
    <div>
      <SplashScreen />
      <MetaPixel />
      <CustomMetaScript />
      <BottomSnackToaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/products" element={<Products />} />
        <Route path="/all-products" element={<AllProducts />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/category/:categoryName" element={<CategoryProducts />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* 🔐 Admin / Portal Public Login Routes */}
        <Route path="/portal/login" element={<AdminLogin />} />
        <Route path="/portal-login" element={<AdminLogin />} />
        <Route path="/admin/login" element={<Navigate to="/portal/login" replace />} />
        <Route path="/admin-login" element={<Navigate to="/portal/login" replace />} />

        {/* 🛡️ Portal Protected Routes */}
        <Route
          path="/portal"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminOverview />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/portal/dashboard"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminOverview />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/portal/products"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/portal/inventory"
          element={
            <AdminRoute requiredPermission="products:view">
              <AdminLayout>
                <AdminInventory />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/portal/orders"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/portal/users"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/portal/settings"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/portal/team"
          element={
            <AdminRoute requiredPermission="team:manage">
              <AdminLayout>
                <AdminTeam />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/portal/razorpay"
          element={
            <AdminRoute requiredPermission="orders:view">
              <AdminLayout>
                <AdminRazorpay />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/portal/developer"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDeveloperMode />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route path="/portal/developer-mode" element={<Navigate to="/portal/developer" replace />} />
        <Route path="/admin/developer" element={<Navigate to="/portal/developer" replace />} />
        <Route path="/portal/payments" element={<Navigate to="/portal/razorpay" replace />} />
        <Route path="/admin/razorpay" element={<Navigate to="/portal/razorpay" replace />} />
        <Route path="/admin/payments" element={<Navigate to="/portal/razorpay" replace />} />

        {/* Backward Compatibility Redirects */}
        <Route path="/admin" element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="/admin/products" element={<Navigate to="/portal/products" replace />} />
        <Route path="/admin/inventory" element={<Navigate to="/portal/inventory" replace />} />
        <Route path="/admin/orders" element={<Navigate to="/portal/orders" replace />} />
        <Route path="/admin/users" element={<Navigate to="/portal/users" replace />} />
        <Route path="/admin/settings" element={<Navigate to="/portal/settings" replace />} />
      </Routes>
    </div>
  );
}

export default App;
