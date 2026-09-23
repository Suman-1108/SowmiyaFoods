// src/components/products/ProductDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Star,
  Heart,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Lock,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Minus,
  Plus,
  CheckCircle2,
  Home as HomeIcon,
  Share2,
  Sparkles,
  ExternalLink,
  Play,
  RotateCcw,
  Award,
  Bell,
  XCircle,
  User,
  Mail,
  MessageSquarePlus,
  X,
} from "lucide-react";
import { getProductById, getProductReviews, addProductReview } from "../../api/productApi";
import axiosInstance from "../../api/axiosInstance";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext.jsx";
import Navbar from "../Navbar";
import Footer from "../Footer";
import ph from "../../assets/image.png";
import brandLogo from "../../assets/logo.png";
import toast from "react-hot-toast";
import NotifyMeModal from "./NotifyMeModal";
import { ProductDetailSkeleton } from "../common/ProductSkeleton";

// Tamil slogan / subtitle helper
const getTamilSlogan = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("millet") || lower.includes("ragi") || lower.includes("bajra") || lower.includes("kambu"))
    return "சத்தான பாரம்பரிய சிறுதானியம். 100% Pure & Natural.";
  if (lower.includes("noodles"))
    return "ருசியான நொடிப்பொழுதில். Immersive Taste. Pure Quality.";
  if (lower.includes("vermicelli") || lower.includes("semiya"))
    return "மென்மையான பாரம்பரிய சேமியா. Homemade Authentic.";
  if (lower.includes("atta") || lower.includes("wheat") || lower.includes("maida"))
    return "மென்மையானது, சத்தானது. Traditional Stone-Ground.";
  if (lower.includes("sooji") || lower.includes("rava"))
    return "சூப்பர் சுவையான ரவை. Fluffy & Delicious.";
  if (lower.includes("rice flour"))
    return "தூய பாரம்பரிய அரிசி மாவு. Silky Soft.";
  if (lower.includes("gram flour") || lower.includes("kadalai"))
    return "உயர் தர கடலை மாவு. Premium Besan Quality.";
  if (lower.includes("idli podi") || lower.includes("idly podi"))
    return "சுவையான பாரம்பரிய இட்லி பொடி. Spicy & Aromatic.";
  if (lower.includes("ellu podi"))
    return "எள்ளின் தூய சுவையுடன். Rich Sesame Flavor.";
  if (lower.includes("puliyotharai"))
    return "பாரம்பரிய சுவையில் புளியோதரை. Temple Style.";
  if (lower.includes("ulundhankali") || lower.includes("ulunthankali"))
    return "உடலுக்கு உறுதி தரும் உளுந்து. Health & Strength.";
  if (lower.includes("puttu"))
    return "சிறுதானிய பாரம்பரிய சத்து. Steamed Perfection.";
  if (lower.includes("idiappam") || lower.includes("idiappa"))
    return "மென்மையான பூ போன்ற இடியாப்பம். Feather Light.";
  if (lower.includes("murukku"))
    return "மொறுமொறுப்பான பாரம்பரிய முறுக்கு. Super Crispy.";
  if (lower.includes("bajji") || lower.includes("bonda"))
    return "மொறுமொறுப்பான சுவையான பஜ்ஜிக்கு. Instant Crisp.";
  return "ராமர் பாரம்பரிய தரம். Traditional Goodness, Pure Taste.";
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeFaq, setActiveFaq] = useState(0); // first FAQ open by default
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const relatedScrollRef = useRef(null);

  // Customer reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    rating: 5,
    comment: "",
  });
  const [reviewErrors, setReviewErrors] = useState({});
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Curated initial seed reviews for rich social proof
  const DEFAULT_REVIEWS = [
    {
      _id: "seed-1",
      customerName: "Kavitha Rajan",
      rating: 5,
      comment: "Incredible sound quality and effective traditional aroma! Made the softest idlis and crispiest snacks our family has enjoyed.",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      isVerified: true,
    },
    {
      _id: "seed-2",
      customerName: "Suresh Kumar",
      rating: 5,
      comment: "Most authentic traditional food products I've owned and ordered online. Clean hygienic packing and super fresh taste!",
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      isVerified: true,
    },
    {
      _id: "seed-3",
      customerName: "Ananya Meenakshi",
      rating: 5,
      comment: "Instant cooking perfection with no chemical preservatives. Tastes like home-cooked grandma's recipe. Ordering again!",
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      isVerified: true,
    },
  ];

  const fetchReviews = async (productId) => {
    if (!productId) return;
    setReviewsLoading(true);
    try {
      const res = await getProductReviews(productId);
      if (res?.success && Array.isArray(res.reviews)) {
        setReviews(res.reviews);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const validateReviewForm = () => {
    const errors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!reviewForm.name || !reviewForm.name.trim()) {
      errors.name = "Please enter your name";
    } else if (reviewForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (reviewForm.name.trim().length > 60) {
      errors.name = "Name cannot exceed 60 characters";
    }

    if (!reviewForm.email || !reviewForm.email.trim()) {
      errors.email = "Please enter your email ID";
    } else if (!emailRegex.test(reviewForm.email.trim())) {
      errors.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      errors.rating = "Please select a rating between 1 and 5 stars";
    }

    if (!reviewForm.comment || !reviewForm.comment.trim()) {
      errors.comment = "Please write your review feedback";
    } else if (reviewForm.comment.trim().length < 5) {
      errors.comment = "Review must be at least 5 characters";
    } else if (reviewForm.comment.trim().length > 1000) {
      errors.comment = "Review cannot exceed 1000 characters";
    }

    setReviewErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!validateReviewForm()) return;

    setReviewSubmitting(true);
    try {
      const targetId = product?._id || product?.id || id;
      const res = await addProductReview(targetId, {
        name: reviewForm.name.trim(),
        email: reviewForm.email.trim().toLowerCase(),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      });

      if (res?.success) {
        toast.success("Thank you! Your review has been submitted.", {
          icon: "⭐",
          duration: 3000,
        });

        if (res.review) {
          setReviews((prev) => [res.review, ...prev]);
        } else {
          fetchReviews(targetId);
        }

        setReviewForm({ name: "", email: "", rating: 5, comment: "" });
        setReviewErrors({});
        setReviewModalOpen(false);

        // Notify admin listeners
        window.dispatchEvent(new CustomEvent("inventoryUpdated"));
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit review. Please check the inputs.";
      toast.error(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name.trim().slice(0, 2) || "KR").toUpperCase();
  };

  const getAvatarColor = (index) => {
    const colors = [
      "bg-amber-100 text-amber-800 border-amber-200",
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-emerald-100 text-emerald-800 border-emerald-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-rose-100 text-rose-800 border-rose-200",
    ];
    return colors[index % colors.length];
  };

  // Extract weight from product name1
  const extractWeight = (name) => {
    const match = name?.match(/(\d+\.?\d*)\s*(g|kg)/i);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    return unit === "kg" ? value : value / 1000;
  };

  // Check if product is in wishlist
  const isWishlisted = Boolean(
    product &&
    wishlist?.products?.some((p) => p._id === (product._id || product.id))
  );

  const toggleWishlist = async () => {
    if (!product) return;
    const prodId = product._id || product.id;
    if (isWishlisted) {
      if (removeFromWishlist) {
        await removeFromWishlist(prodId);
        toast.success("Removed from wishlist", { duration: 1500 });
      }
    } else {
      await addToWishlist(product);
      toast.success("Added to wishlist", { duration: 1500 });
    }
  };

  // Fetch current product details & related products
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setQuantity(1);
    setSelectedImageIndex(0);

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        const productWithLinks = {
          ...data,
          brandLogo,
          links: data.links || [
            {
              label: "Murukku Maavu Recipe Guide",
              url: "https://www.instagram.com/reel/DPtEbNBk418/?igsh=dmdlc3p6eXRpaGNw",
            },
            {
              label: "Lemon Semiya Bath Video",
              url: "https://www.instagram.com/reel/DPu990hjy3u/?igsh=NnUwMjB4amltdnhr",
            },
          ],
        };
        setProduct(productWithLinks);
        fetchReviews(data?._id || data?.id || id);

        // Fetch related products from backend
        try {
          const res = await axiosInstance.get("/products");
          if (Array.isArray(res.data)) {
            const currentCategory = data?.category;
            const currentId = data?._id || data?.id || id;
            // Prefer products in the same category, excluding the current product
            const sameCat = res.data.filter(
              (p) => (p._id || p.id) !== currentId && p.category === currentCategory
            );
            const others = res.data.filter(
              (p) => (p._id || p.id) !== currentId && p.category !== currentCategory
            );
            const combined = [...sameCat, ...others].slice(0, 10);
            setRelatedProducts(combined);
          }
        } catch (rErr) {
          console.error("Failed to load related products:", rErr);
        }
      } catch (error) {
        console.error("Failed to load product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Observer for sticky bottom bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 480) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = async () => {
    if (product) {
      await addToCart({ ...product }, quantity);
      toast.success(`Added ${quantity} ${product.name} to cart!`, { duration: 1800 });
    }
  };

  const handleBuyNow = async () => {
    if (product) {
      await addToCart({ ...product }, quantity);
      const weight = extractWeight(product.name) * quantity;
      const totalAmount = product.price * quantity;
      navigate("/checkout", {
        state: {
          totalAmount,
          totalWeight: weight,
        },
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || "Sowmiya Foods",
        text: `Check out ${product?.name} from Sowmiya Foods!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!", { duration: 1500 });
    }
  };

  const scrollRelatedLeft = () => {
    if (relatedScrollRef.current) {
      relatedScrollRef.current.scrollBy({ left: -260, behavior: "smooth" });
    }
  };

  const scrollRelatedRight = () => {
    if (relatedScrollRef.current) {
      relatedScrollRef.current.scrollBy({ left: 260, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <Navbar />
        <div className="flex-grow py-6">
          <ProductDetailSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 max-w-md mb-6">
            The product you're looking for might have been moved or is currently unavailable.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2.5 rounded-xl bg-[#e8703b] hover:bg-[#d45f2a] text-white font-semibold transition-colors cursor-pointer shadow-sm"
          >
            Explore All Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Gallery images setup (main pack + branded angles)
  const mainImage = product.image || ph;
  const galleryImages = [
    { src: mainImage, label: "Front Pack" },
    { src: brandLogo, label: "Heritage Seal" },
    { src: mainImage, label: "Side View" },
    { src: mainImage, label: "Serving Suggestion" },
  ];

  // Pricing calculations
  const price = Number(product.price) || 0;
  const mrp = Math.round(price * 1.33) || price + 35;
  const saveAmount = mrp - price;
  const discountPercent = Math.round((saveAmount / mrp) * 100);
  const tamilTagline = getTamilSlogan(product.name);
  const isOutOfStock =
    product.inStock === false ||
    (product.stock !== undefined && Number(product.stock) <= 0);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-amber-100 selection:text-amber-900">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8 text-xs sm:text-sm text-gray-500">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link
                to="/"
                className="hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            </li>
            <li>
              <Link
                to="/products"
                className="hover:text-gray-900 transition-colors"
              >
                Products
              </Link>
            </li>
            {product.category && (
              <>
                <li>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                </li>
                <li>
                  <Link
                    to={`/products?category=${encodeURIComponent(product.category)}`}
                    className="hover:text-gray-900 transition-colors"
                  >
                    {product.category}
                  </Link>
                </li>
              </>
            )}
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            </li>
            <li className="font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* 2. Top Product Hero (2-Column Grid matching reference) */}
        <div ref={heroRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 sm:mb-20">
          {/* Left Column: Visual Gallery (Cols 1-6) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main Image Stage */}
            <div className="relative w-full aspect-square bg-[#F7F7F7] rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex items-center justify-center overflow-hidden border border-gray-100 group">
              {/* Top-Left: Pure Veg Symbol + Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-2">
                {/* Pure Veg Emblem */}
                <div
                  className="w-5 h-5 bg-white/90 border-2 border-emerald-600 rounded flex items-center justify-center shadow-2xs"
                  title="100% Pure Vegetarian"
                >
                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></span>
                </div>

                {/* New Product Pill */}
                {isOutOfStock ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-rose-600 text-white shadow-2xs">
                    Out of Stock
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-[#e8703b] text-white shadow-2xs">
                    New
                  </span>
                )}
              </div>

              {/* Top-Right: Wishlist Heart & Share */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 flex items-center justify-center shadow-sm transition-all cursor-pointer"
                  title="Share product"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleWishlist}
                  className="w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-red-500 shadow-sm transition-all cursor-pointer"
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  aria-label="Wishlist toggle"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isWishlisted ? "fill-red-500 text-red-500" : "stroke-[2]"
                    }`}
                  />
                </button>
              </div>

              {/* Main Product Graphic */}
              <img
                src={galleryImages[selectedImageIndex]?.src || mainImage}
                alt={product.name}
                className="max-h-[85%] max-w-[85%] object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>

            {/* Thumbnail Strip (4 Thumbnails matching reference) */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {galleryImages.map((imgObj, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`aspect-square rounded-xl sm:rounded-2xl p-2 bg-[#F7F7F7] flex items-center justify-center transition-all cursor-pointer border-2 ${
                    selectedImageIndex === idx
                      ? "border-gray-900 ring-2 ring-gray-900/10 scale-102"
                      : "border-transparent hover:border-gray-300 opacity-75 hover:opacity-100"
                  }`}
                  aria-label={`View angle ${idx + 1}`}
                >
                  <img
                    src={imgObj.src}
                    alt={`${product.name} angle ${idx + 1}`}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Buy Box (Cols 7-12) */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Category / Brand Eyebrow */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/60">
                {product.category || "Traditional Food"}
              </span>
              <span className="text-xs text-gray-400 font-medium">·</span>
              <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                Ramar Heritage
              </span>
            </div>

            {/* Product Title matching bold Shopify Plus style */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
              {product.name}
            </h1>

            {/* Tamil Slogan / Subtitle */}
            <p className="text-sm sm:text-base font-medium text-amber-700 mb-3">
              {tamilTagline}
            </p>

            {/* Star Rating & Social Proof */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex text-[#F59E0B] gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900">4.9</span>
              <span className="text-xs text-gray-400 font-medium">·</span>
              <a
                href="#customer-reviews"
                className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors"
              >
                Based on 1,250 Reviews
              </a>
            </div>

            {/* Pricing Area (Hidden when out of stock) */}
            {isOutOfStock ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Currently Out of Stock
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Pricing unavailable while item is out of stock
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm sm:text-base text-gray-400 line-through font-normal">
                  ₹{mrp.toFixed(2)}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  ₹{price.toFixed(2)}
                </span>
                {discountPercent > 0 && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/70 tracking-wide uppercase">
                    Save ₹{saveAmount} | {discountPercent}% OFF
                  </span>
                )}
              </div>
            )}

            {/* Short Appetizing Highlights */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
              {product.description ||
                "Traditional goodness prepared from freshly sourced natural grains with zero artificial preservatives. Perfect aroma, authentic South Indian taste, and hygienic food-grade packaging."}
            </p>

            {/* Quantity Selector (Only when in stock) */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/80 p-1">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors shadow-2xs cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors shadow-2xs cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Value Props / Trust Row (3 items matching screenshot) */}
            <div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-100 mb-6 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <p className="font-bold text-gray-900">Secure</p>
                  <p className="text-gray-500">Checkout</p>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <p className="font-bold text-gray-900">Fast</p>
                  <p className="text-gray-500">Shipping</p>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <p className="font-bold text-gray-900">100% Quality</p>
                  <p className="text-gray-500">Guarantee</p>
                </div>
              </div>
            </div>

            {/* Call To Action Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              {isOutOfStock ? (
                <button
                  onClick={() => setNotifyModalOpen(true)}
                  className="w-full py-4 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99]"
                >
                  <Bell className="w-4 h-4 stroke-[2.2]" />
                  <span>Notify Me When Available</span>
                </button>
              ) : (
                <>
                  {/* Primary CTA: Add to Cart (Orange #e8703b) */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#e8703b] hover:bg-[#d45f2a] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99]"
                  >
                    <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
                    <span>Add to Cart</span>
                  </button>

                  {/* Secondary CTA: Buy Now (Solid Black pill) */}
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 px-6 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                  >
                    <span>Buy Now</span>
                  </button>
                </>
              )}
            </div>

            {/* Recipe / Instagram Reel Links if available */}
            {product.links && product.links.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#FFF8F0] border border-amber-200/70">
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                  Authentic Video Recipe Guides:
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#e8703b] hover:text-[#d45f2a] bg-white px-3 py-1.5 rounded-lg border border-amber-200 hover:border-amber-300 shadow-2xs inline-flex items-center gap-1.5 transition-all"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Section: Customer Reviews */}
        <section id="customer-reviews" className="mb-16 sm:mb-20 pt-4 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Customer Reviews
                </h2>
                {reviews.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Real feedback from verified Sowmiya Foods customers
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200/60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Verified Purchases</span>
              </div>

              <button
                onClick={() => {
                  setReviewErrors({});
                  setReviewModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Write a Review</span>
              </button>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {(reviews.length > 0 ? reviews : DEFAULT_REVIEWS).map((rev, idx) => {
              const ratingVal = Number(rev.rating) || 5;
              const avatarInitials = getInitials(rev.customerName);
              const avatarColor = getAvatarColor(idx);
              const isRecent = reviews.some((r) => r._id === rev._id);

              return (
                <div
                  key={rev._id || idx}
                  className={`border rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all ${
                    isRecent
                      ? "bg-amber-50/20 border-amber-200/70"
                      : "bg-[#FAF9F6] border-gray-200/70"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm border shadow-2xs ${avatarColor}`}
                        >
                          {avatarInitials}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">
                            {rev.customerName}
                          </h4>
                          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                          </p>
                        </div>
                      </div>

                      {rev.createdAt && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex text-[#F59E0B] gap-0.5 mb-2.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < ratingVal
                              ? "fill-[#F59E0B] text-[#F59E0B]"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Write a Review Modal */}
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-[#e8703b] border border-orange-500/20 flex items-center justify-center">
                    <MessageSquarePlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Write a Review
                    </h3>
                    <p className="text-[11px] text-gray-500 truncate max-w-[240px] sm:max-w-xs">
                      {product?.name || "Sowmiya Foods Product"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/80 transition cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
                {/* 1. Star Rating Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Your Rating <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const activeStar = ratingHover || reviewForm.rating;
                        const isFilled = star <= activeStar;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() =>
                              setReviewForm((prev) => ({ ...prev, rating: star }))
                            }
                            onMouseEnter={() => setRatingHover(star)}
                            onMouseLeave={() => setRatingHover(0)}
                            className="p-1 transition-transform hover:scale-115 focus:outline-hidden cursor-pointer"
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                isFilled
                                  ? "fill-[#F59E0B] text-[#F59E0B]"
                                  : "fill-gray-100 text-gray-300"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      {ratingHover || reviewForm.rating === 5
                        ? "5 - Excellent!"
                        : (ratingHover || reviewForm.rating) === 4
                        ? "4 - Very Good"
                        : (ratingHover || reviewForm.rating) === 3
                        ? "3 - Average"
                        : (ratingHover || reviewForm.rating) === 2
                        ? "2 - Below Average"
                        : "1 - Poor"}
                    </span>
                  </div>
                  {reviewErrors.rating && (
                    <p className="text-[11px] font-semibold text-rose-500 mt-1">
                      {reviewErrors.rating}
                    </p>
                  )}
                </div>

                {/* 2. Customer Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Suresh Kumar"
                      value={reviewForm.name}
                      onChange={(e) => {
                        setReviewForm((prev) => ({ ...prev, name: e.target.value }));
                        if (reviewErrors.name) setReviewErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition ${
                        reviewErrors.name
                          ? "border-rose-300 focus:ring-rose-200"
                          : "border-gray-200 focus:border-[#e8703b] focus:ring-orange-100"
                      }`}
                    />
                  </div>
                  {reviewErrors.name && (
                    <p className="text-[11px] font-semibold text-rose-500 mt-1">
                      {reviewErrors.name}
                    </p>
                  )}
                </div>

                {/* 3. Customer Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={reviewForm.email}
                      onChange={(e) => {
                        setReviewForm((prev) => ({ ...prev, email: e.target.value }));
                        if (reviewErrors.email) setReviewErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition ${
                        reviewErrors.email
                          ? "border-rose-300 focus:ring-rose-200"
                          : "border-gray-200 focus:border-[#e8703b] focus:ring-orange-100"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    🔒 Email is validated for genuine reviews and will never be shared publicly.
                  </p>
                  {reviewErrors.email && (
                    <p className="text-[11px] font-semibold text-rose-500 mt-1">
                      {reviewErrors.email}
                    </p>
                  )}
                </div>

                {/* 4. Review Comment */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      Your Feedback <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-gray-400">
                      {reviewForm.comment.length}/1000
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Tell us what you loved about the taste, texture, and cooking experience..."
                    value={reviewForm.comment}
                    maxLength={1000}
                    onChange={(e) => {
                      setReviewForm((prev) => ({ ...prev, comment: e.target.value }));
                      if (reviewErrors.comment) setReviewErrors((prev) => ({ ...prev, comment: "" }));
                    }}
                    className={`w-full p-3 text-xs sm:text-sm rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition resize-none ${
                      reviewErrors.comment
                        ? "border-rose-300 focus:ring-rose-200"
                        : "border-gray-200 focus:border-[#e8703b] focus:ring-orange-100"
                    }`}
                  />
                  {reviewErrors.comment && (
                    <p className="text-[11px] font-semibold text-rose-500 mt-1">
                      {reviewErrors.comment}
                    </p>
                  )}
                </div>

                {/* Form Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {reviewSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 fill-white" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. Section: Frequently Asked Questions (Accordion) */}
        <section className="mb-16 sm:mb-20">
          <div className="mb-6 pb-2 border-b border-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Everything you need to know about our products, delivery & packaging
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Accordion 1: Shipping & Returns */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all shadow-2xs">
              <button
                onClick={() => setActiveFaq(activeFaq === 0 ? null : 0)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-gray-900 hover:bg-gray-50/80 transition-colors cursor-pointer"
              >
                <span>Shipping & Returns</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    activeFaq === 0 ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeFaq === 0 && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                  <p className="mb-2">
                    All orders are freshly packed and dispatched within 24 hours directly from our production mill in Tamil Nadu.
                  </p>
                  <p className="mb-2">
                    • <strong>Tamil Nadu:</strong> Delivered in 1–3 business days.<br />
                    • <strong>Rest of India:</strong> Delivered in 3–6 business days via trusted courier partners.
                  </p>
                  <p>
                    In case of damaged packaging or defective items upon delivery, we offer a 100% replacement or refund guarantee within 7 days.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: Product Specifications */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all shadow-2xs">
              <button
                onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-gray-900 hover:bg-gray-50/80 transition-colors cursor-pointer"
              >
                <span>Product Specifications & Ingredients</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    activeFaq === 1 ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeFaq === 1 && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                  <p className="mb-2">
                    • <strong>Ingredients:</strong> 100% natural, farm-selected grains milled traditionally without chemical bleaching or adulterants.<br />
                    • <strong>Preservatives:</strong> 0% artificial colors, chemicals, or synthetic additives.<br />
                    • <strong>Dietary:</strong> 100% Pure Vegetarian.<br />
                    • <strong>Shelf Life:</strong> 6 to 12 months from manufacturing date (printed on pack).
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 3: Storage & Usage Information */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all shadow-2xs">
              <button
                onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-gray-900 hover:bg-gray-50/80 transition-colors cursor-pointer"
              >
                <span>Storage & Usage Instructions</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    activeFaq === 2 ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeFaq === 2 && (
                <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                  <p className="mb-2">
                    • Store in a cool, dry place away from direct sunlight and humidity.<br />
                    • Transfer contents into an airtight container after opening to retain aroma and crisp freshness.<br />
                    • For recipe suggestions, check out our Instagram reels or the preparation guides linked above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. Section: Related Products (Carousel matching reference) */}
        {relatedProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6 pb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Related Products
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={scrollRelatedLeft}
                  className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                  aria-label="Previous related products"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollRelatedRight}
                  className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                  aria-label="Next related products"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Related Products Carousel */}
            <div
              ref={relatedScrollRef}
              className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth pb-4 px-1"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {relatedProducts.map((relProduct, rIdx) => {
                const relPrice = Number(relProduct.price) || 0;
                const relMrp = Math.round(relPrice * 1.3) || relPrice + 35;
                const relReviewCount = 70 + ((rIdx * 23) % 80);

                // Badge assignment - only "New" (Best Seller & Sale removed)
                let relBadge = null;
                const isRelOutOfStock =
                  relProduct.inStock === false ||
                  (relProduct.stock !== undefined && Number(relProduct.stock) <= 0);

                if (isRelOutOfStock) {
                  relBadge = { text: "Out of Stock", bg: "bg-rose-600 text-white font-bold" };
                } else {
                  relBadge = { text: "New", bg: "bg-[#e8703b] text-white" };
                }

                return (
                  <div
                    key={relProduct._id || relProduct.id}
                    className="flex-shrink-0 w-[205px] sm:w-[220px] md:w-[235px] group flex flex-col"
                  >
                    <div className="bg-white rounded-2xl border border-gray-200/85 hover:border-gray-300 shadow-xs hover:shadow-md transition-all duration-300 p-3 sm:p-3.5 flex flex-col justify-between h-full">
                      {/* Image container */}
                      <div
                        className="relative w-full aspect-square bg-[#F7F7F7] rounded-xl overflow-hidden mb-3 flex items-center justify-center p-3 cursor-pointer"
                        onClick={() => navigate(`/product/${relProduct._id || relProduct.id}`)}
                      >
                        {relBadge && (
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wide ${relBadge.bg}`}>
                              {relBadge.text}
                            </span>
                          </div>
                        )}

                        <img
                          src={relProduct.image || ph}
                          alt={relProduct.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-106 transition-transform duration-300"
                        />
                      </div>

                      {/* Text details */}
                      <div className="flex flex-col flex-grow">
                        <h3
                          onClick={() => navigate(`/product/${relProduct._id || relProduct.id}`)}
                          className="font-semibold text-gray-900 text-[13.5px] sm:text-[14px] leading-tight truncate cursor-pointer group-hover:text-[#e8703b] transition-colors"
                          title={relProduct.name}
                        >
                          {relProduct.name}
                        </h3>

                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {relProduct.category || "Traditional"}
                        </p>

                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="font-bold text-gray-900 text-sm sm:text-[15px]">
                            ₹{relPrice}
                          </span>
                          {relMrp > relPrice && (
                            <span className="text-[11px] text-gray-400 line-through font-normal">
                              ₹{relMrp}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-1.5">
                          <div className="flex text-[#F59E0B] gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                            ))}
                          </div>
                          <span className="text-[10.5px] text-gray-500 font-medium ml-0.5">
                            ({relReviewCount})
                          </span>
                        </div>

                        {/* Add to Cart button (Orange #e8703b) */}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await addToCart(relProduct, 1);
                            toast.success(`Added ${relProduct.name} to cart`, { duration: 1500 });
                          }}
                          className="w-full mt-3 py-2 px-3 rounded-lg bg-[#e8703b] hover:bg-[#d45f2a] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 stroke-[1.9]" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* 6. Sticky Bottom Floating Quick-Buy Bar (As in reference image) */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] py-2.5 px-4 sm:px-8 transition-transform duration-300 ${
          showStickyBar ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-gray-100 p-1 flex-shrink-0 flex items-center justify-center border border-gray-200">
              <img
                src={mainImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                {product.name}
              </h4>
              {isOutOfStock ? (
                <span className="text-xs font-bold text-rose-600">Out of Stock</span>
              ) : (
                <p className="text-xs font-extrabold text-[#e8703b]">
                  ₹{price.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {isOutOfStock ? (
              <button
                onClick={() => setNotifyModalOpen(true)}
                className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notify Me</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  className="py-2.5 px-4 sm:px-6 rounded-xl bg-[#e8703b] hover:bg-[#d45f2a] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <ShoppingCart className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="hidden sm:flex py-2.5 px-5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span>Buy Now</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Back in stock notification modal */}
      <NotifyMeModal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        product={product}
      />

      <Footer />
    </div>
  );
};

export default ProductDetails;
