import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { Trash2 } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { getTamilName, getTamilSlogan } from "../utils/productTamil";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart } =
    useCart();
  const navigate = useNavigate();
  const [totalWeight, setTotalWeight] = useState(0);
  const [licenseInfo, setLicenseInfo] = useState({ fssaiLicense: "", gstin: "", gstRate: "5" });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Fetch license info
    axiosInstance
      .get("/settings/license-info")
      .then((res) => setLicenseInfo(res.data))
      .catch(() => {});
  }, []);

  const handleIncrease = (id, qty) => updateQuantity(id, qty + 1);
  const handleDecrease = (id, qty) => qty > 1 && updateQuantity(id, qty - 1);

  // ✅ Calculate total weight only
  const calculateTotalWeight = () => {
    if (!cart?.products?.length) return 0;
    let totalWeight = 0;
    cart.products.forEach((item) => {
      const match = item.name?.match(/(\d+\.?\d*)\s*(g|kg)/i);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        totalWeight +=
          unit === "kg"
            ? value * item.quantity
            : (value / 1000) * item.quantity;
      }
    });
    return totalWeight;
  };

  useEffect(() => {
    setTotalWeight(calculateTotalWeight());
  }, [cart]);

  // ✅ Calculate estimated delivery charge
  const calculateDeliveryCharge = (weightKg) => {
    const ceilWeight = Math.ceil(weightKg);
    if (ceilWeight <= 0) return 0;
    // Default to Tamil Nadu rate for estimate
    return ceilWeight * 50;
  };

  const estimatedDelivery = calculateDeliveryCharge(totalWeight);
  const subtotal = getTotal();

  if (!cart || !cart.products)
    return (
      <p className="text-center text-gray-600 mt-10">Loading your cart...</p>
    );

  return (
    <section className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-default">My Cart</h2>
          <p className="text-lg text-orange-500 font-semibold">
            {cart.products.length === 1
              ? "1 item in your cart"
              : `${cart.products.length} items in your cart`}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* 🛒 Cart Items */}
          <div className="md:w-3/5 bg-white rounded-2xl shadow-md p-4 max-h-[600px] overflow-y-auto">
            {cart.products.length === 0 ? (
              <p className="text-center font-bold text-gray-500 text-lg">
                Your cart is empty
              </p>
            ) : (
              <table className="w-full border-collapse min-w-[600px]">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="py-3 px-2 text-left">Product</th>
                    <th className="py-3 px-2 text-left">Price</th>
                    <th className="py-3 px-2 text-left">Qty</th>
                    <th className="py-3 px-2 text-left">Subtotal</th>
                    <th className="py-3 px-2 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.products.map((item, i) => (
                    <tr
                      key={item._id || i}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-2 px-2 flex items-center gap-3">
                        <img
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          className="w-16 h-20 object-contain rounded flex-shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 leading-snug">
                            {item.name}
                          </span>
                          {(item.tamilName || getTamilName(item.name, item.category)) && (
                            <span className="text-xs text-amber-800 font-medium mt-0.5">
                              {item.tamilName || getTamilName(item.name, item.category)}
                            </span>
                          )}
                          {(item.quote || item.slogan || item.tamilSlogan || getTamilSlogan(item.name, item.category)) && (
                            <span className="text-[11px] text-amber-700/80 italic mt-0.5">
                              &ldquo;{item.quote || item.slogan || item.tamilSlogan || getTamilSlogan(item.name, item.category)}&rdquo;
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2 font-semibold">₹{item.price}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleDecrease(item._id, item.quantity)
                            }
                            className="w-7 h-7 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              handleIncrease(item._id, item.quantity)
                            }
                            className="w-7 h-7 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-2 font-semibold">
                        ₹{item.subtotal}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 💰 Summary */}
          <div className="md:w-2/5 bg-white rounded-2xl shadow-md p-6">
            <p className="text-lg text-gray-700 font-medium">
              Subtotal: ₹{subtotal}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Total Weight: {totalWeight.toFixed(2)} kg
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Est. Delivery Charge: ₹{estimatedDelivery}
            </p>
            <div className="border-t pt-2 mt-2">
              <p className="text-2xl font-bold text-gray-900">
                Total: ₹{(subtotal + estimatedDelivery).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                (Incl. est. delivery ₹{estimatedDelivery})
              </p>
            </div>

            {/* License Numbers */}
            {(licenseInfo.fssaiLicense || licenseInfo.gstin) && (
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 space-y-1">
                {licenseInfo.fssaiLicense && (
                  <p>FSSAI Lic No: {licenseInfo.fssaiLicense}</p>
                )}
                {licenseInfo.gstin && (
                  <p>GSTIN: {licenseInfo.gstin}</p>
                )}
              </div>
            )}

            <button
              onClick={() => {
                navigate("/checkout", {
                  state: { totalAmount: subtotal, totalWeight },
                });
              }}
              className="mt-6 w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Proceed To Checkout
            </button>
           
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default Cart;