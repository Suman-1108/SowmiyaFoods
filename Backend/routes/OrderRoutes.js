import express from "express";
import { requirePermission } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getOrdersByUser,
  getAllOrders,
  getOrderById,
  deleteOrder,
  updateOrderStatus,
} from "../controllers/OrderController.js";

const router = express.Router();

// Save order (Customer / Public)
router.post("/", createOrder);

// Staff/Admin RBAC protected order routes
router.get("/admin/all", requirePermission("orders:view"), getAllOrders);
router.get("/admin/:id", requirePermission("orders:view"), getOrderById);
router.put("/admin/:id/status", requirePermission("orders:update"), updateOrderStatus);
router.delete("/admin/:id", requirePermission("orders:delete"), deleteOrder);

// Get orders by specific user
router.get("/:userId", getOrdersByUser);

export default router;
