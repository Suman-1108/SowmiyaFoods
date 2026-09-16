import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// 🧾 Get Wishlist for a User
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId }).populate("products.productId");
    if (!wishlist) {
      return res.status(200).json({ userId: req.params.userId, products: [] });
    }

    const products = wishlist.products
      .filter((p) => p.productId)
      .map((p) => ({
        productId: p.productId._id,
        name: p.productId.name,
        img: p.productId.image,
        price: p.productId.price,
      }));

    res.status(200).json({ userId: wishlist.userId, products });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

// ➕ Add Product to Wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    // 🧠 Fetch product details from DB
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let wishlist = await Wishlist.findOne({ userId: req.params.userId });

    if (wishlist) {
      const alreadyExists = wishlist.products.some(
        (p) => p.productId.toString() === productId
      );

      if (alreadyExists)
        return res.status(400).json({ message: "Product already in wishlist" });

      wishlist.products.push({ productId });
      await wishlist.save();
    } else {
      wishlist = await Wishlist.create({
        userId: req.params.userId,
        products: [{ productId }],
      });
    }

    // Populate and return mapped wishlist
    await wishlist.populate("products.productId");
    const products = wishlist.products
      .filter((p) => p.productId)
      .map((p) => ({
        productId: p.productId._id,
        name: p.productId.name,
        img: p.productId.image,
        price: p.productId.price,
      }));

    res.status(200).json({ userId: wishlist.userId, products });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
};

// ❌ Remove Product from Wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter(
      (p) => p.productId.toString() !== productId
    );

    await wishlist.save();

    // Populate and return mapped wishlist
    await wishlist.populate("products.productId");
    const products = wishlist.products
      .filter((p) => p.productId)
      .map((p) => ({
        productId: p.productId._id,
        name: p.productId.name,
        img: p.productId.image,
        price: p.productId.price,
      }));

    res.status(200).json({ userId: wishlist.userId, products });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Failed to remove from wishlist" });
  }
};
