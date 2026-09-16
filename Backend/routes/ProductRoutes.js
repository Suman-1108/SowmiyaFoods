import express from "express";
import { requirePermission } from "../middleware/authMiddleware.js";
import {
  getProducts,
  getLatestProducts,
  getTrendingProducts,
  getHomeProducts,
  getProductsByCategory,
  getProductById,
  getProductsBySearch, // ✅ new
  createProduct,       // ✅ new (Admin / Staff)
  updateProduct,       // ✅ new (Admin / Staff)
  deleteProduct,       // ✅ new (Admin / Staff)
  getAllCategories,    // ✅ new
  updateProductStock,  // ✅ new (Stock update)
  getLowStockAlerts,   // ✅ new (Stock alerts)
  requestStockNotification, // ✅ customer notify me
  dismissCustomerAlert,     // ✅ dismiss customer alert
  createProductReview,      // ✅ customer review
  getProductReviews,        // ✅ fetch product reviews
  dismissReviewAlert,       // ✅ dismiss review notification
  deleteReview,             // ✅ delete review
  bulkImportProducts,       // ✅ bulk import products
} from "../controllers/ProductController.js";

const router = express.Router();

// General product routes
router.get("/", getProducts);
router.get("/home", getHomeProducts);
router.get("/categories", getAllCategories);
router.get("/latest", getLatestProducts);
router.get("/trending", getTrendingProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/search", getProductsBySearch); // ✅ search route
router.get("/inventory/low-stock", getLowStockAlerts); // ✅ Low stock + customer request + review notifications
router.patch("/inventory/customer-alerts/:id/dismiss", requirePermission("products:view"), dismissCustomerAlert);

// Review admin routes (placed before /:id)
router.patch("/reviews/:id/dismiss", requirePermission("products:view"), dismissReviewAlert);
router.delete("/reviews/:id", requirePermission("products:delete"), deleteReview);

// Public customer stock notification request
router.post("/:id/notify-me", requestStockNotification);

// Public customer review routes
router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", createProductReview);

// Staff/Admin RBAC protected product routes
router.post("/bulk-import", requirePermission("products:create"), bulkImportProducts); // ✅ bulk import
router.post("/", requirePermission("products:create"), createProduct);
router.put("/:id", requirePermission("products:edit"), updateProduct);
router.patch("/:id/stock", requirePermission("products:edit"), updateProductStock); // ✅ quick stock edit
router.delete("/:id", requirePermission("products:delete"), deleteProduct);      

router.get("/:id", getProductById);

export default router;
