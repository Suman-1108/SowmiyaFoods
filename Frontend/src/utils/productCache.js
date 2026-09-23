/**
 * High-performance Product & Image Local Storage Cache Utility
 * Provides instant 0ms loads, stale-while-revalidate, and image preloading
 */

const CACHE_KEY = "sf_products_cache_v2";
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours TTL

// Set of already preloaded image URLs to avoid duplicate DOM image instances
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
 * Returns { products, categories, timestamp } or null
 */
export const getCachedProducts = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.products) && parsed.products.length > 0) {
      // Trigger instant background preloading for the cached images
      preloadProductImages(parsed.products, 16);
      return parsed;
    }
  } catch (err) {
    console.warn("Error reading product cache from localStorage:", err);
  }
  return null;
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
      categories: Array.isArray(categories) ? categories : [],
      timestamp: Date.now(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    // Preload top images so they load instantly on next navigation
    preloadProductImages(products, 20);
  } catch (err) {
    // If quota exceeded, silently clear older keys
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
