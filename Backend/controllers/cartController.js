import Cart from "../models/Cart.js";

// 🛒 Get Cart for a User
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate(
      "products.productId"
    );
    res.status(200).json(cart || { userId: req.params.userId, products: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ Add Product to Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.params.userId });

    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) => p.productId.toString() === productId
      );
      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }
      await cart.save();
    } else {
      cart = await Cart.create({
        userId: req.params.userId,
        products: [{ productId, quantity }],
      });
    }

    // 🔹 Populate before returning
    await cart.populate("products.productId");
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Remove Product from Cart
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(
      (p) => p.productId.toString() !== req.params.productId
    );
    await cart.save();

    // 🔹 Populate before returning
    await cart.populate("products.productId");
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔄 Update Product Quantity
export const updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === req.params.productId
    );
    if (productIndex > -1) {
      cart.products[productIndex].quantity = quantity;
      await cart.save();
    }

    // 🔹 Populate before returning
    await cart.populate("products.productId");
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};