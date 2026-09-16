import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Settings,
  ExternalLink,
  LogOut,
  X,
  Crown,
  ShieldCheck,
  UserCog,
  CreditCard,
  Wrench,
} from "lucide-react";
import toast from "react-hot-toast";
import { getLowStockAlerts } from "../../api/productApi";

import axiosInstance from "../../api/axiosInstance";

// ─── Get current user from localStorage ──────────────────
const getStoredUser = () => {
  try {
    const str = localStorage.getItem("user");
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
};

// ─── Role badge config ────────────────────────────────────
const ROLE_BADGE = {
  admin: { label: "Primary Admin", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", Icon: Crown },
  manager: { label: "Ops Manager", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", Icon: ShieldCheck },
  order_manager: { label: "Order Specialist", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", Icon: ShieldCheck },
  catalog_specialist: { label: "Catalog Specialist", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", Icon: ShieldCheck },
  viewer: { label: "Viewer", color: "bg-slate-500/20 text-slate-300 border-slate-500/30", Icon: ShieldCheck },
  custom: { label: "Custom Role", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30", Icon: ShieldCheck },
};

// ─── hasAccess helper: checks if user can see a nav item ─
const hasAccess = (user, requiredPermission) => {
  if (!user) return false;
  if (user.isAdmin || user.isPrimaryAdmin || user.role === "admin") return true;
  const perms = Array.isArray(user.permissions) ? user.permissions : [];
  return perms.includes("*") || perms.includes(requiredPermission);
};

// ─── AdminSidebar ─────────────────────────────────────────
const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const isAdmin = !!(user?.isAdmin || user?.isPrimaryAdmin || user?.role === "admin");
  const [lowStockCount, setLowStockCount] = useState(0);
  const [isDevModeActive, setIsDevModeActive] = useState(true);

  // Fetch low stock alerts count & developer mode status
  useEffect(() => {
    let isMounted = true;

    const fetchDevStatus = async () => {
      try {
        const res = await axiosInstance.get("/settings/developer-settings");
        if (isMounted && res.data?.success && res.data.settings) {
          setIsDevModeActive(res.data.settings.isDeveloperModeEnabled !== false);
        }
      } catch {}
    };

    const fetchAlerts = async () => {
      try {
        const res = await getLowStockAlerts();
        if (isMounted && res?.success) {
          setLowStockCount(res.totalAlerts || 0);
        }
      } catch {
        // silent fail on network errors in sidebar
      }
    };

    fetchAlerts();
    fetchDevStatus();

    const handleInventoryChange = () => fetchAlerts();
    const handleDevUpdate = () => fetchDevStatus();

    window.addEventListener("inventoryUpdated", handleInventoryChange);
    window.addEventListener("developerSettingsUpdated", handleDevUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("inventoryUpdated", handleInventoryChange);
      window.removeEventListener("developerSettingsUpdated", handleDevUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/portal/login");
  };

  // Dynamic nav items based on permissions
  const navItems = [
    {
      name: "Dashboard",
      path: "/portal/dashboard",
      icon: LayoutDashboard,
      requiredPermission: "dashboard:view",
      badge: null,
    },
    {
      name: "Products",
      path: "/portal/products",
      icon: Package,
      requiredPermission: "products:view",
      badge: null,
    },
    {
      name: "Inventory",
      path: "/portal/inventory",
      icon: Boxes,
      requiredPermission: "products:view",
      badge: lowStockCount > 0 ? `${lowStockCount} Alert${lowStockCount > 1 ? "s" : ""}` : null,
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse font-bold",
    },
    {
      name: "Orders",
      path: "/portal/orders",
      icon: ShoppingCart,
      requiredPermission: "orders:view",
      badge: null,
    },
    {
      name: "Razorpay Gateway",
      path: "/portal/razorpay",
      icon: CreditCard,
      requiredPermission: "orders:view",
      badge: "Live",
    },
    {
      name: "Customers",
      path: "/portal/users",
      icon: Users,
      requiredPermission: "customers:view",
      badge: null,
    },
    {
      name: "Team & Roles",
      path: "/portal/team",
      icon: UserCog,
      requiredPermission: "team:manage",
      badge: null,
      adminOnly: true,
    },
    {
      name: "Developer Mode",
      path: "/portal/developer",
      icon: Wrench,
      requiredPermission: "settings:manage",
      badge: "DEV",
      badgeColor: "bg-orange-500/20 text-orange-400 border border-orange-500/40 font-black text-[10px]",
      devAccessOnly: true, // Only show for Main Admin or Operations Manager when Developer Mode is enabled
    },
    {
      name: "Settings",
      path: "/portal/settings",
      icon: Settings,
      requiredPermission: "settings:view",
      badge: null,
    },
  ].filter((item) => {
    const userRole = user?.role || (user?.isAdmin ? "admin" : "viewer");
    const isDevAccessUser = isAdmin || userRole === "admin" || userRole === "manager";
    if (item.devAccessOnly) return isDevAccessUser && isDevModeActive;
    if (item.adminOnly) return isAdmin || hasAccess(user, item.requiredPermission);
    return hasAccess(user, item.requiredPermission);
  });

  // Role display
  const userRole = user?.role || (user?.isAdmin ? "admin" : "viewer");
  const roleMeta = ROLE_BADGE[userRole] || ROLE_BADGE.viewer;
  const RoleIcon = roleMeta.Icon;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-200 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-[#0b1120]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e8703b] to-amber-500 flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20">
            S
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
              Sowmiya Foods
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#e8703b]/20 text-[#e8703b] border border-[#e8703b]/30">
                Portal
              </span>
            </span>
            <p className="text-[11px] text-slate-400">Management Console</p>
          </div>
        </div>

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-[#e8703b] text-white shadow-lg shadow-orange-500/25 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    item.badgeColor || "bg-slate-800 text-slate-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Quick Links
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span>View Live Store</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Online
          </span>
        </a>
      </div>

      {/* Footer: Profile + Role + Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0b1120]">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#e8703b]/20 text-[#e8703b] flex items-center justify-center font-black text-xs border border-[#e8703b]/30 flex-shrink-0">
            {(user?.name || "AD")[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name || "Administrator"}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || ""}</p>
          </div>
        </div>

        {/* Role badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${roleMeta.color} mb-2`}>
          <RoleIcon className="w-3 h-3 flex-shrink-0" />
          <span className="text-[10px] font-bold tracking-wide">{roleMeta.label}</span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 left-0 z-30 shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
