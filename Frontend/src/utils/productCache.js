/**
 * High-performance Product & Image Local Storage Cache Utility
 * Provides instant 0ms loads, stale-while-revalidate, and image preloading
 */

export const CANONICAL_CATEGORIES = [
  "Millet",
  "Instant Products",
  "Noodles",
  "Semiya",
  "Flour Items",
  "Rava Sooji",
  "Pickles",
  "Thokku",
  "Traditional Mix",
  "Appalam",
];

// Baseline canonical seed catalog to guarantee 0ms instant render for every visitor
export const CANONICAL_PRODUCTS_BASELINE = [
  // 1. Millet
  {
    _id: "seed-millet-1",
    name: "Kambu (Bajra) Flour 500g",
    category: "Millet",
    price: 40,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760268062/bajra-flour_ngkfkc.png",
    description: "Nutritious pearl millet flour.\nRich in iron and fiber.",
    countInStock: 50,
    rating: 4.8,
    numReviews: 14,
    featured: true,
  },
  {
    _id: "seed-millet-2",
    name: "Ragi Flour 500g",
    category: "Millet",
    price: 35,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/ragi-flour_mi8rqx.png",
    description: "Nutritious finger millet flour.\nGreat for healthy recipes.",
    countInStock: 50,
    rating: 4.9,
    numReviews: 22,
    featured: true,
  },
  {
    _id: "seed-millet-3",
    name: "Millet Puttu Podi 250g",
    category: "Millet",
    price: 55,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg",
    description: "Specialty millet puttu mix.\nAuthentic taste.",
    countInStock: 45,
    rating: 4.7,
    numReviews: 9,
    featured: true,
  },
  {
    _id: "seed-millet-4",
    name: "Millet Idly Dosa Mix 500g",
    category: "Millet",
    price: 65,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png",
    description: "Healthy multi-millet dosa mix.\nEasy to prepare.",
    countInStock: 40,
    rating: 4.8,
    numReviews: 18,
    featured: true,
  },

  // 2. Instant Products
  {
    _id: "seed-instant-1",
    name: "Instant Parotta 200g",
    category: "Instant Products",
    price: 30,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272318/instant-parotta_lhleky.png",
    description: "Ready-to-cook parotta.\nSoft and fluffy every time.",
    countInStock: 60,
    rating: 4.9,
    numReviews: 35,
    featured: true,
  },
  {
    _id: "seed-instant-2",
    name: "Adai Dosa Mix 500g",
    category: "Instant Products",
    price: 85,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/rice-flour_cj7msm.png",
    description: "Quick adai dosa mix.\nEasy and protein-packed meals.",
    countInStock: 35,
    rating: 4.8,
    numReviews: 12,
    featured: true,
  },
  {
    _id: "seed-instant-3",
    name: "Rava Dosa Mix 500g",
    category: "Instant Products",
    price: 70,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760276417/rava-org_yvgm7r.png",
    description: "Instant crispy rava dosa mix.\nRestaurant style.",
    countInStock: 40,
    rating: 4.7,
    numReviews: 16,
    featured: true,
  },

  // 3. Noodles
  {
    _id: "seed-noodle-1",
    name: "Noodles – 100g",
    category: "Noodles",
    price: 14,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272313/noodles_ryybot.png",
    description: "Classic Ramar instant noodles.\nQuick and tasty snack.",
    countInStock: 100,
    rating: 4.6,
    numReviews: 28,
    featured: true,
  },
  {
    _id: "seed-noodle-2",
    name: "Noodles – 200g",
    category: "Noodles",
    price: 28,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272313/noodles_ryybot.png",
    description: "Family pack Ramar noodles.\nQuick and tasty meal.",
    countInStock: 80,
    rating: 4.8,
    numReviews: 31,
    featured: true,
  },
  {
    _id: "seed-noodle-3",
    name: "Ragi Millet Noodles 200g",
    category: "Noodles",
    price: 55,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png",
    description: "Healthy finger millet noodles.\nNutritious comfort food.",
    countInStock: 50,
    rating: 4.9,
    numReviews: 24,
    featured: true,
  },
  {
    _id: "seed-noodle-4",
    name: "Kambu Millet Noodles 200g",
    category: "Noodles",
    price: 55,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png",
    description: "Healthy pearl millet noodles.\nWholesome goodness.",
    countInStock: 45,
    rating: 4.8,
    numReviews: 19,
    featured: true,
  },
  {
    _id: "seed-noodle-5",
    name: "Varagu Millet Noodles 200g",
    category: "Noodles",
    price: 58,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png",
    description: "Nutritious kodo millet noodles.\nLight and fiber-rich.",
    countInStock: 40,
    rating: 4.7,
    numReviews: 15,
    featured: true,
  },
  {
    _id: "seed-noodle-6",
    name: "Thinai Millet Noodles 200g",
    category: "Noodles",
    price: 58,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/millet-noodles_d2kyyw.png",
    description: "Nutritious foxtail millet noodles.\nWholesome and delicious.",
    countInStock: 40,
    rating: 4.8,
    numReviews: 17,
    featured: true,
  },

  // 4. Semiya
  {
    _id: "seed-semiya-1",
    name: "Regular Semiya – 200g",
    category: "Semiya",
    price: 25,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/vermicelli_oekzvx.png",
    description: "Soft and healthy vermicelli.\nPerfect for quick breakfast meals.",
    countInStock: 75,
    rating: 4.8,
    numReviews: 29,
    featured: true,
  },
  {
    _id: "seed-semiya-2",
    name: "Semia – 500g",
    category: "Semiya",
    price: 58,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/vermicelli_oekzvx.png",
    description: "Roasted long vermicelli.\nIdeal for savory upma and sweet payasam.",
    countInStock: 60,
    rating: 4.9,
    numReviews: 33,
    featured: true,
  },
  {
    _id: "seed-semiya-3",
    name: "Ragi Semiya – 200g",
    category: "Semiya",
    price: 32,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272313/ragi-vermicelli_gvvkfj.png",
    description: "Rich in fiber and nutrients.\nIdeal for wholesome healthy eating.",
    countInStock: 50,
    rating: 4.8,
    numReviews: 21,
    featured: true,
  },

  // 5. Flour Items
  {
    _id: "seed-flour-1",
    name: "Chakki Atta 500g",
    category: "Flour Items",
    price: 32,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.22_f8b79ba1_jzvxuq.jpg",
    description: "Freshly ground 100% whole wheat atta.\nSoft and healthy rotis.",
    countInStock: 90,
    rating: 4.9,
    numReviews: 42,
    featured: true,
  },
  {
    _id: "seed-flour-2",
    name: "Chakki Atta 5kg",
    category: "Flour Items",
    price: 270,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.22_f8b79ba1_jzvxuq.jpg",
    description: "Freshly ground whole wheat atta bulk pack.",
    countInStock: 30,
    rating: 5.0,
    numReviews: 25,
    featured: true,
  },
  {
    _id: "seed-flour-3",
    name: "Maida 500g",
    category: "Flour Items",
    price: 35,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272312/maida-flour_tuyebe.png",
    description: "Fine maida flour.\nIdeal for baking and cooking.",
    countInStock: 70,
    rating: 4.7,
    numReviews: 18,
    featured: true,
  },
  {
    _id: "seed-flour-4",
    name: "Rice Flour 250g",
    category: "Flour Items",
    price: 16,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/rice-flour_cj7msm.png",
    description: "Pure rice flour.\nGreat for idiappam, dosa and sweets.",
    countInStock: 80,
    rating: 4.8,
    numReviews: 20,
    featured: true,
  },
  {
    _id: "seed-flour-5",
    name: "Rice Flour 500g",
    category: "Flour Items",
    price: 30,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/rice-flour_cj7msm.png",
    description: "Pure rice flour.\nGreat for idiappam, dosa and sweets.",
    countInStock: 75,
    rating: 4.8,
    numReviews: 27,
    featured: true,
  },
  {
    _id: "seed-flour-6",
    name: "Murukku Flour 500g",
    category: "Flour Items",
    price: 60,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272316/murukku-flour_ltab6z.png",
    description: "Special murukku flour.\nCrunchy and delicious.",
    countInStock: 50,
    rating: 4.9,
    numReviews: 32,
    featured: true,
  },
  {
    _id: "seed-flour-7",
    name: "Idiappa Flour 500g",
    category: "Flour Items",
    price: 50,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg",
    description: "Authentic idiappa flour.\nPerfect for soft traditional dishes.",
    countInStock: 45,
    rating: 4.8,
    numReviews: 19,
    featured: true,
  },
  {
    _id: "seed-flour-8",
    name: "Gram Flour 250g",
    category: "Flour Items",
    price: 33,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272311/gram-flour_yyeeec.png",
    description: "High-quality gram flour.\nGreat for snacks and sweets.",
    countInStock: 60,
    rating: 4.7,
    numReviews: 14,
    featured: true,
  },
  {
    _id: "seed-flour-9",
    name: "Gram Flour 500g",
    category: "Flour Items",
    price: 60,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760272311/gram-flour_yyeeec.png",
    description: "High-quality gram flour.\nGreat for snacks and sweets.",
    countInStock: 55,
    rating: 4.8,
    numReviews: 22,
    featured: true,
  },
  {
    _id: "seed-flour-10",
    name: "Bajji Flour 200g",
    category: "Flour Items",
    price: 30,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Special bajji flour blend.\nPerfect for deep-fried evening snacks.",
    countInStock: 65,
    rating: 4.9,
    numReviews: 38,
    featured: true,
  },

  // 6. Rava Sooji
  {
    _id: "seed-rava-1",
    name: "Roasted Sooji 250g",
    category: "Rava Sooji",
    price: 20,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760276417/rava-org_yvgm7r.png",
    description: "Premium roasted sooji.\nIdeal for idli, upma and kesari.",
    countInStock: 70,
    rating: 4.8,
    numReviews: 24,
    featured: true,
  },
  {
    _id: "seed-rava-2",
    name: "Roasted Sooji 500g",
    category: "Rava Sooji",
    price: 36,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760276417/rava-org_yvgm7r.png",
    description: "Premium roasted sooji.\nIdeal for idli, upma and kesari.",
    countInStock: 65,
    rating: 4.9,
    numReviews: 30,
    featured: true,
  },
  {
    _id: "seed-rava-3",
    name: "Roasted Sooji 1kg",
    category: "Rava Sooji",
    price: 71,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760276417/rava-org_yvgm7r.png",
    description: "Premium roasted sooji value pack.",
    countInStock: 50,
    rating: 4.9,
    numReviews: 36,
    featured: true,
  },
  {
    _id: "seed-rava-4",
    name: "Broken Samba Wheat 500g",
    category: "Rava Sooji",
    price: 65,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.24_7c543103_oj7kiz.jpg",
    description: "Premium broken samba wheat.\nHealthy and nutritious.",
    countInStock: 45,
    rating: 4.8,
    numReviews: 18,
    featured: true,
  },

  // 7. Pickles
  {
    _id: "seed-pickle-1",
    name: "Mango Pickle (Bottle) 300g",
    category: "Pickles",
    packagingType: "bottle",
    price: 75,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Spicy and tangy cut mango pickle in glass bottle.",
    countInStock: 40,
    rating: 4.9,
    numReviews: 29,
    featured: true,
  },
  {
    _id: "seed-pickle-2",
    name: "Mixed Veg Pickle (Bottle) 300g",
    category: "Pickles",
    packagingType: "bottle",
    price: 75,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Traditional mixed vegetable pickle in glass bottle.",
    countInStock: 35,
    rating: 4.8,
    numReviews: 21,
    featured: true,
  },
  {
    _id: "seed-pickle-3",
    name: "Lime Pickle (Bottle) 300g",
    category: "Pickles",
    packagingType: "bottle",
    price: 70,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Authentic lemon pickle in glass jar.",
    countInStock: 38,
    rating: 4.7,
    numReviews: 17,
    featured: true,
  },
  {
    _id: "seed-pickle-4",
    name: "Mango Pickle (Pack)",
    category: "Pickles",
    packagingType: "pack",
    price: 45,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Authentic mango pickle in pouch pack.",
    countInStock: 60,
    rating: 4.8,
    numReviews: 26,
    featured: true,
  },
  {
    _id: "seed-pickle-5",
    name: "Mixed Veg Pickle (Pack)",
    category: "Pickles",
    packagingType: "pack",
    price: 45,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Mixed vegetable pickle in handy pouch pack.",
    countInStock: 55,
    rating: 4.8,
    numReviews: 23,
    featured: true,
  },

  // 8. Thokku
  {
    _id: "seed-thokku-1",
    name: "Tomato Thokku (Bottle) 300g",
    category: "Thokku",
    packagingType: "bottle",
    price: 85,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Tangy country tomato thokku in glass bottle.",
    countInStock: 42,
    rating: 4.9,
    numReviews: 33,
    featured: true,
  },
  {
    _id: "seed-thokku-2",
    name: "Garlic Thokku (Bottle) 300g",
    category: "Thokku",
    packagingType: "bottle",
    price: 95,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Aromatic spiced garlic thokku in glass jar.",
    countInStock: 35,
    rating: 5.0,
    numReviews: 40,
    featured: true,
  },
  {
    _id: "seed-thokku-3",
    name: "Tomato Thokku (Pack)",
    category: "Thokku",
    packagingType: "pack",
    price: 50,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Simmered tomato thokku in fresh stay-pack.",
    countInStock: 50,
    rating: 4.8,
    numReviews: 20,
    featured: true,
  },
  {
    _id: "seed-thokku-4",
    name: "Garlic Thokku (Pack)",
    category: "Thokku",
    packagingType: "pack",
    price: 55,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Spiced garlic thokku in convenient pouch pack.",
    countInStock: 48,
    rating: 4.9,
    numReviews: 25,
    featured: true,
  },

  // 9. Traditional Mix
  {
    _id: "seed-trad-1",
    name: "Puliyotharai Mix 100g",
    category: "Traditional Mix",
    price: 45,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg",
    description: "Traditional authentic temple-style puliyotharai mix.",
    countInStock: 50,
    rating: 4.9,
    numReviews: 31,
    featured: true,
  },
  {
    _id: "seed-trad-2",
    name: "Traditional Idli Podi 100g",
    category: "Traditional Mix",
    price: 40,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg",
    description: "Flavorful spicy gun powder for idlis and dosas.",
    countInStock: 65,
    rating: 5.0,
    numReviews: 44,
    featured: true,
  },
  {
    _id: "seed-trad-3",
    name: "Ellu Idli Podi 100g",
    category: "Traditional Mix",
    price: 45,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg",
    description: "Traditional sesame seed gunpowder.",
    countInStock: 40,
    rating: 4.8,
    numReviews: 18,
    featured: true,
  },
  {
    _id: "seed-trad-4",
    name: "Ulundhankali Mix 250g",
    category: "Traditional Mix",
    price: 65,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266660/WhatsApp_Image_2025-10-11_at_18.54.23_9b813d28_vdt6gm.jpg",
    description: "Nutritious roasted black gram mix for kali.",
    countInStock: 35,
    rating: 4.9,
    numReviews: 22,
    featured: true,
  },

  // 10. Appalam
  {
    _id: "seed-appalam-1",
    name: "Traditional Appalam 100g",
    category: "Appalam",
    price: 35,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Crunchy sun-dried urad dal appalam papad.",
    countInStock: 80,
    rating: 4.8,
    numReviews: 27,
    featured: true,
  },
  {
    _id: "seed-appalam-2",
    name: "Pepper Appalam 100g",
    category: "Appalam",
    price: 40,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Black pepper crushed crispy appalam.",
    countInStock: 60,
    rating: 4.9,
    numReviews: 23,
    featured: true,
  },
  {
    _id: "seed-appalam-3",
    name: "Jeera Appalam 100g",
    category: "Appalam",
    price: 40,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Aromatic cumin-infused crunchy papad.",
    countInStock: 55,
    rating: 4.8,
    numReviews: 19,
    featured: true,
  },
  {
    _id: "seed-appalam-4",
    name: "Rice Vadam / Appalam 100g",
    category: "Appalam",
    price: 45,
    image: "https://res.cloudinary.com/dbuyr00w6/image/upload/v1760266659/WhatsApp_Image_2025-10-11_at_18.54.22_39290d95_uqyz0z.jpg",
    description: "Crispy sun-dried South Indian rice vadam.",
    countInStock: 50,
    rating: 4.9,
    numReviews: 21,
    featured: true,
  },
];

const CACHE_KEY = "sf_products_cache_v3";
const preloadedUrls = new Set();

/**
 * Preload high-priority product images into browser memory cache
 */
export const preloadProductImages = (products = [], limit = 16) => {
  if (!Array.isArray(products) || typeof window === "undefined") return;

  const toPreload = products.slice(0, limit);
  toPreload.forEach((product) => {
    const src = product?.image;
    if (src && typeof src === "string" && !preloadedUrls.has(src)) {
      preloadedUrls.add(src);
      const img = new Image();
      img.src = src;
    }
  });
};

/**
 * Read cached products and categories from localStorage
 * Returns { products, categories, timestamp } - NEVER returns empty or null!
 */
export const getCachedProducts = () => {
  if (typeof window === "undefined") {
    return {
      products: CANONICAL_PRODUCTS_BASELINE,
      categories: CANONICAL_CATEGORIES,
      timestamp: Date.now(),
    };
  }

  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.products) && parsed.products.length > 0) {
        preloadProductImages(parsed.products, 16);
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error reading product cache from localStorage:", err);
  }

  // Pre-seed localStorage with baseline catalog for instantaneous subsequent reads
  try {
    const payload = {
      products: CANONICAL_PRODUCTS_BASELINE,
      categories: CANONICAL_CATEGORIES,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (e) {}

  preloadProductImages(CANONICAL_PRODUCTS_BASELINE, 16);
  return {
    products: CANONICAL_PRODUCTS_BASELINE,
    categories: CANONICAL_CATEGORIES,
    timestamp: Date.now(),
  };
};

/**
 * Save products and categories into localStorage for instant second-time loading
 */
export const setCachedProducts = (products = [], categories = []) => {
  if (typeof window === "undefined") return;
  try {
    if (!Array.isArray(products) || products.length === 0) return;

    const payload = {
      products,
      categories: Array.isArray(categories) && categories.length > 0 ? categories : CANONICAL_CATEGORIES,
      timestamp: Date.now(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    preloadProductImages(products, 20);
  } catch (err) {
    console.warn("Could not save products to localStorage:", err);
  }
};

/**
 * Find a specific product by ID or Slug from the cached product list
 */
export const getCachedProductById = (idOrSlug) => {
  if (!idOrSlug) return null;
  const cache = getCachedProducts();
  if (!cache?.products) return null;

  return (
    cache.products.find(
      (p) =>
        p._id === idOrSlug ||
        p.slug === idOrSlug ||
        String(p._id) === String(idOrSlug)
    ) || null
  );
};

/**
 * Invalidate/clear the cache when admin edits, deletes, or updates inventory
 */
export const clearProductCache = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (err) {
    console.warn("Could not clear product cache:", err);
  }
};
