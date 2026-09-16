import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const STAFF_ROLES = ["admin", "manager", "order_manager", "catalog_specialist", "viewer", "custom"];

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const login = (userData, userToken) => {
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData, newToken) => {
    localStorage.setItem("user", JSON.stringify(updatedUserData));
    setUser(updatedUserData);
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    }
  };

  const isAdmin = !!(user?.isAdmin || user?.isPrimaryAdmin || user?.role === "admin");
  const isStaff = isAdmin || STAFF_ROLES.includes(user?.role || "");

  // Permission check helper
  const hasPermission = (permission) => {
    if (!user) return false;
    if (isAdmin) return true;
    const perms = Array.isArray(user.permissions) ? user.permissions : [];
    return perms.includes("*") || perms.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isAdmin,
        isStaff,
        isPrimaryAdmin: !!user?.isPrimaryAdmin,
        role: user?.role || (user?.isAdmin ? "admin" : "customer"),
        permissions: Array.isArray(user?.permissions) ? user.permissions : [],
        hasPermission,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
