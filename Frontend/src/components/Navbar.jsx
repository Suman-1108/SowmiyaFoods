import React, { useState, useEffect, useRef } from "react";
import { FaShoppingCart, FaHeart, FaBars, FaTimes } from "react-icons/fa";
import { User, Package, Heart, LogOut, ChevronDown, LayoutDashboard, Search, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const [devSettings, setDevSettings] = useState(null);

  // Load developer mode dynamic site customizer settings
  useEffect(() => {
    let isMounted = true;
    const fetchDevSettings = async () => {
      try {
        const res = await axiosInstance.get("/settings/developer-settings");
        if (isMounted && res.data?.success && res.data.settings) {
          setDevSettings(res.data.settings);
        }
      } catch {
        // Fallback to default
      }
    };
    fetchDevSettings();

    const handleUpdate = () => fetchDevSettings();
    window.addEventListener("developerSettingsUpdated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("developerSettingsUpdated", handleUpdate);
    };
  }, []);

  // Sync nav search with URL if on /products or /search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || params.get("q") || "";
    setNavSearch(q);
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch.trim())}`);
      setMobileOpen(false);
    } else {
      navigate("/products");
      setMobileOpen(false);
    }
  };

  // Get cart and wishlist item counts
  const cartCount = cart?.products?.length || 0;
  const wishlistCount = wishlist?.products?.length || 0;

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleWishlistClick = () => {
    navigate("/wishlist");
  };

  const handleOrdersClick = () => {
    navigate("/orders");
  };

  const handleUserClick = () => {
    if (user) {
      navigate("/my-account");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Standard nav links merged with dynamic custom links
  const defaultNavLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "About", path: "/aboutus" },
    { name: "Contact", path: "/contactus" },
  ];

  const customLinks = (devSettings?.customNavLinks || []).map((l) => ({
    name: l.name,
    path: l.path,
    isExternal: l.isExternal,
    badgeText: l.badgeText,
  }));

  const navLinks = [...defaultNavLinks, ...customLinks];

  // Dynamic logo logic (Festival Mode & Automated Schedule check)
  const isFestiveScheduleActive = () => {
    if (!devSettings) return false;
    if (devSettings.isFestivalMode) return true;
    if (devSettings.isAutoFestivalSchedule && devSettings.festivalStartDate && devSettings.festivalEndDate) {
      const now = new Date();
      const start = new Date(devSettings.festivalStartDate);
      const end = new Date(devSettings.festivalEndDate);
      return now >= start && now <= end;
    }
    return false;
  };

  const isFestive = isFestiveScheduleActive();
  const activeLogo = isFestive
    ? devSettings?.festivalLogo || devSettings?.siteLogo || logo
    : devSettings?.siteLogo || logo;

  const smallIcon = isFestive
    ? devSettings?.festivalIcon || devSettings?.navIcon
    : devSettings?.navIcon;

  return (
    <nav className="bg-[#FFFBF5] shadow-sm sticky top-0 z-50">
      {/* Dynamic Running Advertising Ticker Banner */}
      {devSettings?.advertisingBanner?.enabled && devSettings?.advertisingBanner?.text && (
        <div
          style={{ background: devSettings.advertisingBanner.bg || "linear-gradient(90deg, #e8703b 0%, #d65f29 100%)" }}
          className="py-1.5 px-4 text-white text-[11px] sm:text-xs font-extrabold overflow-hidden whitespace-nowrap text-center shadow-xs select-none relative"
        >
          <Link
            to={devSettings.advertisingBanner.link || "/products"}
            className="inline-block hover:underline tracking-wide"
          >
            {devSettings.advertisingBanner.text}
          </Link>
        </div>
      )}

      {/* Desktop Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img
                src={activeLogo}
                alt="Sowmiya Foods"
                className="h-14 w-14 object-contain rounded-lg"
              />
              {smallIcon && (
                <img
                  src={smallIcon}
                  alt="Icon"
                  className="w-5 h-5 absolute -top-1 -right-1 object-contain drop-shadow-md animate-bounce"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#1a365d] tracking-tight flex items-center gap-1.5">
                Sowmiya Foods
                {isFestive && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 border border-amber-300">
                    {devSettings?.festivalName || "Festive"}
                  </span>
                )}
              </span>
              <span className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-medium">
                Pure · Fresh · Tasty
              </span>
            </div>
          </Link>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? "text-[#e63946]"
                    : "text-gray-600 hover:text-[#e63946]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section: Search, User, Wishlist & Cart */}
          <div className="flex items-center space-x-2">
            {/* Desktop Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden lg:flex items-center relative w-48 xl:w-60"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-7 py-1.5 rounded-full border border-gray-200 bg-white/95 text-xs text-gray-800 placeholder-gray-400 focus:border-[#e8703b] focus:ring-2 focus:ring-amber-500/20 outline-none transition shadow-2xs"
              />
              {navSearch && (
                <button
                  type="button"
                  onClick={() => setNavSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="Clear"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>

            {/* User Account Dropdown */}
            {user ? (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer select-none border ${
                    dropdownOpen
                      ? "bg-amber-100/70 border-amber-300 text-amber-900 shadow-sm"
                      : "hover:bg-amber-50 border-transparent hover:border-amber-200 text-gray-700"
                  }`}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 to-orange-400 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden lg:flex flex-col text-left leading-tight">
                    <span className="text-[11px] text-gray-500 font-medium">Hello,</span>
                    <span className="text-sm font-semibold text-gray-800 truncate max-w-[110px]">
                      {user.name?.split(" ")[0] || "Account"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180 text-amber-600" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Popup Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                    {/* User Profile Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-400 text-white rounded-full flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email || "Customer"}
                        </p>
                      </div>
                    </div>

                    {/* Navigation Options */}
                    <div className="py-1.5">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/my-account?tab=profile");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition-colors text-left cursor-pointer group"
                      >
                        <User className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/orders");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition-colors text-left cursor-pointer group"
                      >
                        <Package className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">My Orders</span>
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/wishlist");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition-colors text-left cursor-pointer group"
                      >
                        <Heart className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Wishlist</span>
                        {wishlistCount > 0 && (
                          <span className="ml-auto bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </button>

                      {(user?.isAdmin || ['admin', 'manager', 'order_manager', 'catalog_specialist', 'viewer', 'custom'].includes(user?.role)) && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate("/portal/dashboard");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 transition-colors text-left cursor-pointer group"
                        >
                          <LayoutDashboard className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{user?.isAdmin ? "Admin" : "Staff"} Portal</span>
                        </button>
                      )}
                    </div>

                    {/* Logout Option */}
                    <div className="border-t border-gray-100 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer font-medium group"
                      >
                        <LogOut className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive("/login") || isActive("/signup")
                      ? "bg-amber-500 text-white"
                      : "text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Wishlist Icon */}
            {/* <button
              onClick={handleWishlistClick}
              className="relative p-2 text-gray-700 hover:text-[#e63946] transition-colors duration-200"
              aria-label="Wishlist"
            >
              <FaHeart className="text-2xl" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e63946] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button> */}

            {/* Cart Icon */}
            <button
              onClick={handleCartClick}
              className="relative p-2 text-gray-700 hover:text-[#7e492a] transition-colors duration-200"
              aria-label="Shopping Cart"
            >
              <FaShoppingCart className="text-2xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#e63946] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden ml-2 p-2 text-gray-700 hover:text-[#7e492a] transition-colors duration-200"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-2">
            {/* Mobile Search Form */}
            <form onSubmit={handleSearchSubmit} className="mb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:border-[#e8703b] focus:bg-white outline-none transition"
                />
                {navSearch && (
                  <button
                    type="button"
                    onClick={() => setNavSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? "text-[#e63946] bg-red-50"
                    : "text-gray-700 hover:text-[#e63946] hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Mobile User Section */}
            <div className="border-t border-gray-100 pt-3 mt-3">
              {user ? (
                <div className="space-y-1">
                  {/* User Profile Info Card */}
                  <div className="px-3 py-2.5 flex items-center gap-3 bg-amber-50/70 rounded-xl mb-2 border border-amber-200/60">
                    <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-400 text-white rounded-full flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email || "Customer"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigate("/my-account?tab=profile");
                      setMobileOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-amber-600" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate("/orders");
                      setMobileOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                  >
                    <Package className="w-4 h-4 text-amber-600" />
                    <span>My Orders</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate("/wishlist");
                      setMobileOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-amber-800 hover:bg-amber-50 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </button>

                  {(user?.isAdmin || ['admin', 'manager', 'order_manager', 'catalog_specialist', 'viewer', 'custom'].includes(user?.role)) && (
                    <button
                      onClick={() => {
                        navigate("/portal/dashboard");
                        setMobileOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-purple-600" />
                      <span>{user?.isAdmin ? "Admin" : "Staff"} Portal</span>
                    </button>
                  )}

                  <div className="border-t border-gray-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#e63946] hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;