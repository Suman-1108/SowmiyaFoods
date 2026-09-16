import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/WishlistController.js";

const router = express.Router();

// Verify that the authenticated user matches the target userId, or is an admin
const verifyUserOrAdmin = (req, res, next) => {
  if (req.user.id !== req.params.userId && !req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Unauthorized request." });
  }
  next();
};

// 🧾 Get all wishlist items for a user
router.get("/:userId", protect, verifyUserOrAdmin, getWishlist);

// ➕ Add product to wishlist
router.post("/:userId", protect, verifyUserOrAdmin, addToWishlist);

// ❌ Remove product from wishlist
router.delete("/:userId/:productId", protect, verifyUserOrAdmin, removeFromWishlist);

export default router;
