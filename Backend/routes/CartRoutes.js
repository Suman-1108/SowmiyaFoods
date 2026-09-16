import express from "express";
import Cart from "../models/Cart.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Verify that the authenticated user matches the target userId, or is an admin
const verifyUserOrAdmin = (req, res, next) => {
  if (req.user.id !== req.params.userId && !req.user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Unauthorized request." });
  }
  next();
};


// =====================
// Get cart for a user
// =====================
router.get("/:userId", protect, verifyUserOrAdmin, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate(
      "products.productId"
    );

    res.status(200).json(cart || { userId: req.params.userId, products: [] });
  } catch (err) {
    console.error("Fetch cart error:", err);
    res.status(500).json({ message: err.message });
  }
});

// =====================
// Add product to cart
// =====================
router.post("/:userId", protect, verifyUserOrAdmin, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId)
      return res.status(400).json({ message: "Product ID is required" });

    const qty = Number(quantity) || 1;

    let cart = await Cart.findOne({ userId: req.params.userId });

    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) => String(p.productId) === String(productId)
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity += qty;
      } else {
        cart.products.push({ productId, quantity: qty });
      }

      await cart.save();
    } else {
      cart = await Cart.create({
        userId: req.params.userId,
        products: [{ productId, quantity: qty }],
      });
    }

    const populatedCart = await cart.populate("products.productId");
    res.status(200).json(populatedCart);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: err.message });
  }
});

// =====================
// Remove product from cart
// =====================
// =====================
// Remove product from cart (Fixed)
// =====================
router.delete("/:userId/:productId", protect, verifyUserOrAdmin, async (req, res) => {
  try {
    // Use MongoDB $pull to directly remove the item in one operation
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: req.params.userId },
      { $pull: { products: { productId: req.params.productId } } },
      { new: true } // return the updated document
    ).populate("products.productId");

    if (!updatedCart)
      return res.status(404).json({ message: "Cart not found" });

    res.status(200).json(updatedCart);
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ message: err.message });
  }
});

// =====================
// Update quantity of a product
// =====================
router.put("/:userId/:productId", protect, verifyUserOrAdmin, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1)
      return res.status(400).json({ message: "Invalid quantity" });

    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = cart.products.findIndex(
      (p) => String(p.productId) === String(req.params.productId)
    );

    if (productIndex > -1) {
      cart.products[productIndex].quantity = Number(quantity);
      await cart.save();
    }

    const populatedCart = await cart.populate("products.productId");
    res.status(200).json(populatedCart);
  } catch (err) {
    console.error("Update cart quantity error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
