import React, { useEffect, useState } from "react";
import { Heart, Eye, ShoppingCart, Bell } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductsByCategory } from "../../api/productApi";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext.jsx";
import ph from "../../assets/image.png";
import toast from "react-hot-toast";
import NotifyMeModal from "./NotifyMeModal";
import { sortProductsBySubOrder } from "../../utils/productSubOrdering";

const CategoryProducts = () => {
  const { categoryName } = useParams();
  const decodedCategory = decodeURIComponent(categoryName);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifyProduct, setNotifyProduct] = useState(null);
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const navigate = useNavigate();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchCategoryProducts = async () => {
      try {
        const data = await getProductsByCategory(decodedCategory);
        setProducts(sortProductsBySubOrder(data, decodedCategory));
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [decodedCategory]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const extractWeight = (name) => {
    const match = name.match(/(\d+\s?(g|kg|ml|L))/i);
    return match ? match[0] : null;
  };

  const cleanName = (name) => {
    return name.replace(/(\d+\s?(g|kg|ml|L))/i, "").trim();
  };

  return (
    <>
      <Navbar />
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* ✅ Only the title has text-default */}
          <h2 className="text-default text-3xl font-bold mb-8 text-center">
            {decodedCategory} Products
          </h2>

          {loading ? (
            <p className="text-center">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-center">No products found in this category.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product.slug || product._id}`)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden relative group cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    minWidth: screenWidth < 640 ? "140px" : "200px",
                  }}
                >
                  <div className="relative">
                    {/* Badge: Custom label from Admin */}
                    {product.label && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="text-[10px] sm:text-[11px] font-bold text-amber-950 bg-amber-200/95 backdrop-blur-xs px-2 py-0.5 rounded-md border border-amber-400 shadow-xs">
                          {product.label}
                        </span>
                      </div>
                    )}
                    <img
                      src={product.image || ph}
                      alt={product.name}
                      className="w-full h-40 xs:h-44 sm:h-56 md:h-60 lg:h-60 object-cover"
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
                      <div className="p-2 xs:p-3 sm:p-4 flex flex-col space-y-1 sm:space-y-2">
                        <h3 className="text-md xs:text-base sm:text-md font-semibold flex flex-wrap gap-1 items-center">
                          <span>{cleanName(product.name)}</span>
                          {extractWeight(product.name) && (
                            <span className="text-md font-bold">{extractWeight(product.name)}</span>
                          )}
                        </h3>
                        {product.quote ? (
                          <p className="text-[11px] text-amber-700 italic truncate" title={product.quote}>
                            &ldquo;{product.quote}&rdquo;
                          </p>
                        ) : product.tamilName ? (
                          <p className="text-[11px] text-amber-800/80 truncate">
                            {product.tamilName}
                          </p>
                        ) : null}
                        <p className="text-xs xs:text-sm sm:text-sm text-gray-500">{product.category}</p>

                        {/* Price & Action Button */}
                        <div className="flex items-center justify-between pt-1">
                          {isOutOfStock ? (
                            <>
                              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                Out of Stock
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifyProduct(product);
                                }}
                                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white font-bold px-2 py-1 xs:px-3 xs:py-2 rounded-lg text-xs shadow-xs cursor-pointer transition"
                              >
                                <Bell size={14} />
                                <span className="text-xs">Notify</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="flex items-baseline gap-1.5">
                                <p className="text-sm xs:text-base sm:text-lg font-bold">₹{product.price}</p>
                                {(() => {
                                  const itemMrp =
                                    product.mrp !== undefined && product.mrp !== null
                                      ? Number(product.mrp)
                                      : Math.round(Number(product.price) * 1.3) || Number(product.price) + 30;
                                  return itemMrp > Number(product.price) ? (
                                    <span className="text-[11px] text-gray-400 line-through">
                                      ₹{itemMrp}
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await addToCart(product);
                                }}
                                className="flex items-center gap-1 bg-gray-200 text-gray-800 px-2 py-1 xs:px-3 xs:py-2 sm:px-3 sm:py-2 rounded-lg hover:bg-gray-300 cursor-pointer transition"
                              >
                                <ShoppingCart size={16} />
                                <span className="text-xs xs:text-sm sm:text-sm">Add</span>
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
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Back in stock notification modal */}
      <NotifyMeModal
        isOpen={!!notifyProduct}
        onClose={() => setNotifyProduct(null)}
        product={notifyProduct}
      />

      <Footer />
    </>
  );
};

export default CategoryProducts;
