import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";
import { useSnackbar } from "./SnackbarContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const userId = user?.id; // undefined if guest
  const [cart, setCart] = useState({ products: [] });

  // -------------------------
  // Guest cart helpers
  // -------------------------
  const saveGuestCart = (cartData) => {
    localStorage.setItem("guestCart", JSON.stringify(cartData));
  };

  const getGuestCart = () => {
    return JSON.parse(localStorage.getItem("guestCart")) || { products: [] };
  };

  // -------------------------
  // Fetch cart
  // -------------------------
  const fetchCart = async () => {
    if (userId) {
      // Logged-in user
      try {
        const res = await axiosInstance.get(`/cart/${userId}`);
        const updatedProducts =
          res.data.products?.map((item) => ({
            _id: item.productId?._id,
            name: item.productId?.name,
            price: item.productId?.price,
            image: item.productId?.image || "/placeholder.png",
            quantity: item.quantity,
            subtotal: (item.productId?.price || 0) * item.quantity,
          })) || [];
        setCart({ products: updatedProducts });
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    } else {
      // Guest user
      setCart(getGuestCart());
    }
  };

  // -------------------------
  // Add to cart
  // -------------------------
  const addToCart = (product, quantity = 1) => {
    // Show bottom popup
    showSnackbar({
      type: "cart",
      message: "Item added to cart",
      product,
      link: "/cart",
      linkText: "GO TO CART",
    });

    if (userId) {
      // Logged-in user
      return axiosInstance
        .post(`/cart/${userId}`, { productId: product._id, quantity })
        .then(fetchCart)
        .catch((err) => console.error("Error adding product to cart:", err));
    } else {
      // Guest user
      const guestCart = getGuestCart();
      const index = guestCart.products.findIndex((p) => p._id === product._id);

      if (index > -1) {
        guestCart.products[index].quantity += quantity;
        guestCart.products[index].subtotal =
          guestCart.products[index].price * guestCart.products[index].quantity;
      } else {
        guestCart.products.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image || "/placeholder.png",
          quantity,
          subtotal: product.price * quantity,
        });
      }

      saveGuestCart(guestCart);
      setCart({ ...guestCart }); // ensure re-render
    }
  };

  // -------------------------
  // Remove product
  // -------------------------
  const removeFromCart = (productId) => {
    if (userId) {
      return axiosInstance
        .delete(`/cart/${userId}/${productId}`)
        .then(fetchCart)
        .catch((err) => console.error("Error removing product:", err));
    } else {
      const guestCart = getGuestCart();
      guestCart.products = guestCart.products.filter((p) => p._id !== productId);
      saveGuestCart(guestCart);
      setCart({ ...guestCart });
    }
  };

  // -------------------------
  // Update quantity
  // -------------------------
  const updateQuantity = (productId, quantity) => {
    if (userId) {
      return axiosInstance
        .put(`/cart/${userId}/${productId}`, { quantity })
        .then(fetchCart)
        .catch((err) => console.error("Error updating quantity:", err));
    } else {
      const guestCart = getGuestCart();
      const index = guestCart.products.findIndex((p) => p._id === productId);
      if (index > -1) {
        guestCart.products[index].quantity = quantity;
        guestCart.products[index].subtotal =
          guestCart.products[index].price * quantity;
        saveGuestCart(guestCart);
        setCart({ ...guestCart });
      }
    }
  };

  // -------------------------
  // Clear cart
  // -------------------------
  const clearCart = () => {
    setCart({ products: [] });
    localStorage.removeItem("guestCart");
  };

  // -------------------------
  // Calculate total
  // -------------------------
  const getTotal = () =>
    cart.products.reduce((acc, item) => acc + (item.subtotal || 0), 0);

  // -------------------------
  // Effects
  // -------------------------
  useEffect(() => {
    fetchCart();
  }, [userId]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
