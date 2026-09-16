import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, ArrowRight, X, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";

const SnackbarContext = createContext();

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

export const SnackbarProvider = ({ children }) => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    type: "cart", // "cart" | "wishlist" | "success" | "error" | "info"
    message: "Item added to cart",
    product: null,
    link: null,
    linkText: null,
  });

  const timerRef = useRef(null);
  const remainingTimeRef = useRef(4000);
  const startTimeRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const hideSnackbar = () => {
    clearTimer();
    setSnackbar((prev) => ({ ...prev, isOpen: false }));
  };

  const startTimer = (duration = 4000) => {
    clearTimer();
    startTimeRef.current = Date.now();
    remainingTimeRef.current = duration;
    timerRef.current = setTimeout(() => {
      hideSnackbar();
    }, duration);
  };

  const showSnackbar = ({
    type = "cart",
    message = "Notification",
    product = null,
    link = type === "cart" ? "/cart" : type === "wishlist" ? "/wishlist" : null,
    linkText = type === "cart" ? "GO TO CART" : type === "wishlist" ? "GO TO WISHLIST" : null,
    duration = 4000,
  }) => {
    clearTimer();
    setSnackbar({
      isOpen: true,
      type,
      message,
      product,
      link,
      linkText,
    });
    startTimer(duration);
  };

  const showSuccess = (message, options = {}) => {
    showSnackbar({ type: "success", message, ...options });
  };

  const showError = (message, options = {}) => {
    showSnackbar({ type: "error", message, ...options });
  };

  const handleMouseEnter = () => {
    // Pause auto-dismiss when hovering
    if (timerRef.current && startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(1000, remainingTimeRef.current - elapsed);
      clearTimer();
    }
  };

  const handleMouseLeave = () => {
    // Resume auto-dismiss
    startTimer(remainingTimeRef.current);
  };

  const handleActionClick = () => {
    const targetLink = snackbar.link;
    hideSnackbar();
    if (targetLink) {
      navigate(targetLink);
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const imageSrc =
    snackbar.product?.image ||
    snackbar.product?.img ||
    (Array.isArray(snackbar.product?.images) ? snackbar.product.images[0] : null);

  const productName = snackbar.product?.name || snackbar.product?.title || "";

  const isCart = snackbar.type === "cart";
  const isWishlist = snackbar.type === "wishlist";
  const isSuccess = snackbar.type === "success";
  const isError = snackbar.type === "error";

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar, showSuccess, showError }}>
      {children}

      {/* Bottom Snackbar Notification */}
      {snackbar.isOpen && (
        <div
          role="status"
          aria-live="polite"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[99999] w-[94vw] sm:w-auto sm:min-w-[380px] max-w-lg bg-zinc-900/95 text-white rounded-xl shadow-[0_12px_45px_rgba(0,0,0,0.65)] border border-zinc-700/80 p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 sm:gap-4 animate-slide-up-snackbar select-none backdrop-blur-md transition-all duration-300"
        >
          {/* Left: Thumbnail or Icon + Text */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Image or Icon Badge */}
            <div className="relative flex-shrink-0">
              {imageSrc ? (
                <div className="w-11 h-11 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/80 flex items-center justify-center">
                  <img
                    src={imageSrc}
                    alt={productName || "Product"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isCart || isSuccess
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : isWishlist || isError
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  }`}
                >
                  {isCart && <ShoppingCart className="w-5 h-5" />}
                  {isWishlist && <Heart className="w-5 h-5 fill-rose-400" />}
                  {isSuccess && <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />}
                  {isError && <AlertCircle className="w-5 h-5 stroke-[2.2]" />}
                  {!isCart && !isWishlist && !isSuccess && !isError && (
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  )}
                </div>
              )}

              {/* Status Badge Dot */}
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow ${
                  isCart || isSuccess ? "bg-emerald-500" : isWishlist || isError ? "bg-rose-500" : "bg-amber-500"
                }`}
              >
                {isCart || isSuccess ? "✓" : isWishlist ? "♥" : "!"}
              </span>
            </div>

            {/* Message & Title */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white tracking-wide leading-tight flex items-center gap-2">
                <span>{snackbar.message}</span>
                {isCart || isSuccess ? (
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ) : isWishlist || isError ? (
                  <span className="inline-block w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                ) : (
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </p>
              {productName && (
                <p className="text-xs text-zinc-400 truncate max-w-[180px] sm:max-w-[240px] mt-0.5">
                  {productName}
                </p>
              )}
            </div>
          </div>

          {/* Right: Action Button (GO TO CART / GO TO WISHLIST / Custom) + Close */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {snackbar.link && snackbar.linkText && (
              <button
                onClick={handleActionClick}
                className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span>{snackbar.linkText}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
            <button
              onClick={hideSnackbar}
              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </SnackbarContext.Provider>
  );
};
