import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ShieldOff } from "lucide-react";

// Staff roles that are allowed into the portal
const STAFF_ROLES = ["admin", "manager", "order_manager", "catalog_specialist", "viewer", "custom"];

const getStoredUser = (token) => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    // Fallback: decode JWT payload
    if (token) {
      const base64Url = token.split(".")[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        return JSON.parse(jsonPayload);
      }
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * AdminRoute – protects portal pages.
 *
 * Props:
 *  - children: page component to render
 *  - requiredPermission: optional permission string (e.g. "team:manage")
 *    If provided AND the user lacks this permission, shows an Access Denied screen.
 */
const AdminRoute = ({ children, requiredPermission }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = getStoredUser(token);

  // Not authenticated at all
  if (!token || !user) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  const isAdmin = !!(user.isAdmin || user.isPrimaryAdmin || user.role === "admin");
  const isStaff = isAdmin || STAFF_ROLES.includes(user.role);

  // Not a staff/admin user
  if (!isStaff) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  // Check granular permission if required
  if (requiredPermission && !isAdmin) {
    const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
    const hasPermission =
      userPermissions.includes("*") || userPermissions.includes(requiredPermission);

    if (!hasPermission) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-3xl bg-rose-100 flex items-center justify-center mx-auto mb-6 border border-rose-200">
              <ShieldOff className="w-10 h-10 text-rose-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h1>
            <p className="text-sm text-slate-500 mb-1">
              Your account doesn't have the required permission to view this page.
            </p>
            <p className="text-xs text-slate-400 bg-slate-100 rounded-xl px-4 py-2 inline-block mt-2 font-mono">
              Required: <span className="text-rose-600 font-bold">{requiredPermission}</span>
            </p>
            <p className="text-xs text-slate-400 mt-4">
              Contact your administrator to request access.
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition cursor-pointer"
            >
              ← Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default AdminRoute;
