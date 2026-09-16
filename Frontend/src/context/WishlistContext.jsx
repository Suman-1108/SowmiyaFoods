import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";
import { useSnackbar } from "./SnackbarContext";

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const userId = user?.id || "guest";
  const [wishlist, setWishlist] = useState({ products: [] });

  // 🧠 Save guest wishlist to localStorage
  const saveGuestWishlist = (wishlistData) => {
    localStorage.setItem("guestWishlist", JSON.stringify(wishlistData));
  };

  // 📦 Fetch wishlist (user or guest)
  const fetchWishlist = async () => {
    if (userId !== "guest") {
      try {
        const res = await axiosInstance.get(`/wishlist/${userId}`);
        const updatedProducts =
          res.data.products?.map((item) => ({
            _id: item.productId?._id || item.productId,
            name: item.name,
            img: item.img || "/placeholder.png",
            price: item.price,
          })) || [];
        setWishlist({ products: updatedProducts });
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    } else {
      const guestWishlist =
        JSON.parse(localStorage.getItem("guestWishlist")) || { products: [] };
      setWishlist(guestWishlist);
    }
  };

  // ➕ Add to wishlist
  const addToWishlist = async (product) => {
    if (userId !== "guest") {
      try {
        await axiosInstance.post(`/wishlist/${userId}`, {
          productId: product._id,
        });
        await fetchWishlist();
        showSnackbar({
          type: "wishlist",
          message: "Item added to wishlist",
          product,
          link: "/wishlist",
          linkText: "GO TO WISHLIST",
        });
      } catch (err) {
        if (err.response?.status === 400) {
          showSnackbar({
            type: "wishlist",
            message: "Item already in wishlist",
            product,
            link: "/wishlist",
            linkText: "GO TO WISHLIST",
          });
        } else {
          console.error("Error adding to wishlist:", err);
        }
      }
    } else {
      const guestWishlist =
        JSON.parse(localStorage.getItem("guestWishlist")) || { products: [] };
      const exists = guestWishlist.products.some((p) => p._id === product._id);
      if (!exists) {
        guestWishlist.products.push({
          _id: product._id,
          name: product.name,
          img: product.image || "/placeholder.png",
          price: product.price,
        });
        saveGuestWishlist(guestWishlist);
        setWishlist(guestWishlist);
        showSnackbar({
          type: "wishlist",
          message: "Item added to wishlist",
          product,
          link: "/wishlist",
          linkText: "GO TO WISHLIST",
        });
      } else {
        showSnackbar({
          type: "wishlist",
          message: "Item already in wishlist",
          product,
          link: "/wishlist",
          linkText: "GO TO WISHLIST",
        });
      }
    }
  };

  // ❌ Remove from wishlist
  const removeFromWishlist = async (productId) => {
    if (userId !== "guest") {
      try {
        await axiosInstance.delete(`/wishlist/${userId}/${productId}`);
        fetchWishlist();
      } catch (err) {
        console.error("Error removing product:", err);
      }
    } else {
      const guestWishlist =
        JSON.parse(localStorage.getItem("guestWishlist")) || { products: [] };
      guestWishlist.products = guestWishlist.products.filter(
        (p) => p._id !== productId
      );
      saveGuestWishlist(guestWishlist);
      setWishlist(guestWishlist);
    }
  };

  // 🧹 Clear wishlist (used on logout)
  const clearWishlist = () => {
    setWishlist({ products: [] });
    localStorage.removeItem("guestWishlist");
  };

  useEffect(() => {
    fetchWishlist();
  }, [userId]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
