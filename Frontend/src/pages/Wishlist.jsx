import React from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { FaTrash } from "react-icons/fa";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
  };

  return (
    <section className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-10 flex-grow">
        <h2 className="text-2xl font-bold mb-2">Your Wishlist</h2>
        <p className="text-gray-600 mb-6">
          There {wishlist.products.length === 1 ? "is" : "are"}{" "}
          {wishlist.products.length}{" "}
          {wishlist.products.length === 1 ? "product" : "products"} in your
          wishlist
        </p>

        {wishlist.products.length === 0 ? (
          <p className="text-center text-gray-500 font-medium">
            No products in wishlist.
          </p>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Desktop Table */}
            <div className="hidden md:block md:w-full bg-white rounded-2xl shadow-md p-4 overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-2 text-left">Product</th>
                    <th className="py-3 px-2 text-left">Price</th>
                    <th className="py-3 px-2 text-left hidden sm:table-cell">
                      Stock Status
                    </th>
                    <th className="py-3 px-2 text-left">Add to Cart</th>
                    <th className="py-3 px-2 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlist.products.map((product, index) => (
                    <tr
                      key={product._id || index}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-2 px-2 flex items-center gap-2 sm:gap-4 flex-wrap">
                        <img
                          src={product.img || "/placeholder.png"}
                          alt={product.name}
                          className="w-16 h-24 sm:w-20 sm:h-32 object-contain rounded-md"
                        />
                        <span className="font-medium text-gray-800 text-sm sm:text-base">
                          {product.name}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-gray-800 font-semibold text-sm sm:text-base">
                        ₹{product.price.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 hidden sm:table-cell">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs sm:text-sm">
                          In stock
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex items-center gap-1 bg-[#5e371f] text-white px-3 py-2 rounded-lg hover:bg-gray-300 hover:text-gray-800 transition"
                        >
                          <ShoppingCart size={16} />
                          <span className="text-sm">Add</span>
                        </button>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => removeFromWishlist(product._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-2 transition"
                        >
                          <FaTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-4 w-full">
              {wishlist.products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-md p-4 flex flex-col"
                >
                  <div className="flex gap-4">
                    <img
                      src={product.img || "/placeholder.png"}
                      alt={product.name}
                      className="w-24 h-24 object-contain rounded-md"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-gray-700 text-sm">
                        ₹{product.price.toFixed(2)}
                      </p>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs mt-1 w-max">
                        In stock
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1 bg-[#5e371f] text-white py-2 rounded-lg hover:bg-gray-300 hover:text-gray-800 transition"
                    >
                      <ShoppingCart size={16} />
                      <span className="text-sm">Add</span>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="flex-1 flex items-center justify-center text-red-500 py-2 rounded-lg hover:text-red-700 transition ml-2"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </section>
  );
};

export default Wishlist;