import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { ShoppingCart, Eye, Heart, Bell, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import ph from "../../assets/image.png";
import { fetchProductsBySearch } from "../../api/productApi";
import NotifyMeModal from "./NotifyMeModal";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifyProduct, setNotifyProduct] = useState(null);

  const searchTerm = new URLSearchParams(location.search).get("q") || "";
  const [inputVal, setInputVal] = useState(searchTerm);

  useEffect(() => {
    setInputVal(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchTerm.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchProductsBySearch(searchTerm);
        setProducts(data);
      } catch (err) {
        console.error("Error fetching search results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo(0, 0);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputVal.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <>
      <Navbar />
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-[#1a365d] mb-2">
              {searchTerm ? `Search Results for "${searchTerm}"` : "Search Products"}
            </h2>
            <p className="text-gray-500 text-sm">
              {loading ? "Searching product catalog..." : `Found ${products.length} matching products`}
            </p>
          </div>

          {/* 🔍 Search Input Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search by product name, category, or keyword..."
                className="w-full pl-11 pr-24 py-3 rounded-2xl bg-white border border-gray-300 text-gray-800 text-sm shadow-xs focus:border-[#e8703b] focus:ring-2 focus:ring-amber-500/20 outline-none transition"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => setInputVal("")}
                  className="absolute right-20 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#e8703b] hover:bg-[#d45f2a] text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-amber-500/20 border-t-[#e8703b] rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500 font-medium text-sm">Searching products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl p-8 border border-gray-200/80 shadow-xs max-w-md mx-auto">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800 mb-1">No products found</h3>
              <p className="text-gray-500 text-sm mb-5">
                We couldn't find any products matching your search.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="px-5 py-2.5 rounded-xl bg-[#e8703b] hover:bg-[#d45f2a] text-white text-sm font-semibold cursor-pointer transition"
              >
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden relative group cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
                  onClick={() => navigate(`/product/${product.slug || product._id}`)}
                >
                  <div className="relative">
                    <img
                      src={product.image || ph}
                      alt={product.name}
                      className="w-full h-60 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-4 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.slug || product._id}`);
                        }}
                        className="bg-white p-2 rounded-full hover:bg-gray-100"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await addToWishlist(product);
                        }}
                        className="bg-white p-2 rounded-full hover:bg-gray-100"
                      >
                        <Heart size={18} />
                      </button>
                    </div>
                  </div>

                  {(() => {
                    const isOutOfStock =
                      product.inStock === false ||
                      (product.stock !== undefined && Number(product.stock) <= 0);

                    return (
                      <div className="p-4 flex flex-col space-y-2">
                        <h3 className="text-md font-semibold text-gray-800">{product.name}</h3>
                        <p className="text-gray-500">{product.category}</p>
                        <div className="flex items-center justify-between pt-2">
                          {isOutOfStock ? (
                            <>
                              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                                Out of Stock
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifyProduct(product);
                                }}
                                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs cursor-pointer transition"
                              >
                                <Bell size={14} />
                                <span>Notify</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <p className="text-lg font-bold text-gray-900">₹{product.price}</p>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await addToCart(product);
                                }}
                                className="flex items-center gap-1 bg-gray-200 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-300 cursor-pointer transition"
                              >
                                <ShoppingCart size={16} />
                                <span className="text-sm">Add</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>

      {/* Back in stock alert modal */}
      <NotifyMeModal
        isOpen={!!notifyProduct}
        onClose={() => setNotifyProduct(null)}
        product={notifyProduct}
      />

      <Footer />
    </>
  );
};

export default SearchResults;
