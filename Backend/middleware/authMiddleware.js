// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Middleware to protect routes for logged-in users
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to request
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ✅ Middleware to protect admin-only routes (Any of the 4 Admins)
export const protectAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check token claim first
    const isTokenAdmin = Boolean(decoded.isAdmin || decoded.role === "admin" || decoded.isPrimaryAdmin);
    if (isTokenAdmin) {
      return next();
    }

    // Fallback: check database in case role was updated
    if (decoded.id) {
      const dbUser = await User.findById(decoded.id).select("isAdmin role isPrimaryAdmin isActive");
      if (dbUser && dbUser.isActive !== false && (dbUser.isAdmin || dbUser.role === "admin" || dbUser.isPrimaryAdmin)) {
        req.user.isAdmin = true;
        req.user.role = "admin";
        return next();
      }
    }

    return res.status(403).json({ message: "Access denied. Administrative privileges required." });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ✅ Middleware to protect staff/manager portal routes
export const protectStaff = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const staffRoles = ["admin", "manager", "order_manager", "catalog_specialist", "viewer", "custom"];
    const isStaffOrAdmin = Boolean(
      decoded.isAdmin ||
      decoded.isPrimaryAdmin ||
      decoded.role === "admin" ||
      staffRoles.includes(decoded.role)
    );

    if (isStaffOrAdmin) {
      return next();
    }

    if (decoded.id) {
      const dbUser = await User.findById(decoded.id).select("isAdmin role isPrimaryAdmin isActive");
      if (dbUser && dbUser.isActive !== false) {
        if (dbUser.isAdmin || dbUser.isPrimaryAdmin || staffRoles.includes(dbUser.role)) {
          return next();
        }
      }
    }

    return res.status(403).json({ message: "Access denied. Administrative or staff privileges required." });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ✅ Granular Azure-style RBAC permission middleware
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Full root Admin has unrestricted access
      if (decoded.isAdmin || decoded.role === "admin" || decoded.isPrimaryAdmin) {
        return next();
      }

      // Check if token payload has the permission or wildcard
      const permissions = Array.isArray(decoded.permissions) ? decoded.permissions : [];
      if (permissions.includes("*") || permissions.includes(permission)) {
        return next();
      }

      // Check database if permission or admin role was updated recently
      if (decoded.id) {
        const dbUser = await User.findById(decoded.id).select("permissions role isAdmin isPrimaryAdmin isActive");
        if (dbUser && dbUser.isActive !== false) {
          if (dbUser.isAdmin || dbUser.role === "admin" || dbUser.isPrimaryAdmin) return next();
          const dbPerms = Array.isArray(dbUser.permissions) ? dbUser.permissions : [];
          if (dbPerms.includes("*") || dbPerms.includes(permission)) {
            return next();
          }
        }
      }

      return res.status(403).json({
        message: `Access denied. Requires '${permission}' permission.`,
        requiredPermission: permission,
      });
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  };
};

// ✅ Optional: Middleware to attach full user object from DB
export const attachUser = async (req, res, next) => {
  try {
    if (req.user?.id) {
      const user = await User.findById(req.user.id).select("-password");
      req.user = user;
    }
    next();
  } catch (err) {
    console.error("Attach User Error:", err);
    next();
  }
};
