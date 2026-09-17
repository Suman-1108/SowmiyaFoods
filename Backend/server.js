import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import cartRoutes from "./routes/CartRoutes.js";
import productRoutes from "./routes/ProductRoutes.js";
import authRoutes, { syncEnvAdminUser } from "./routes/authRoutes.js";
import contactRoutes from "./routes/ContactRoutes.js";
import WishlistRoutes from "./routes/WishlistRoutes.js";
import OrderRoutes from "./routes/OrderRoutes.js";
import AddressRoutes from './routes/AddressRoutes.js';
import settingRoutes from "./routes/SettingRoutes.js";
import paymentRoutes from "./routes/PaymentRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from Backend directory or parent/current directory
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

const app = express();

// Apply body parsers FIRST
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Gracefully handle any URL prefix mismatches across environments
app.use((req, res, next) => {
  if (req.url.startsWith("/api/api/")) {
    req.url = req.url.replace(/^\/api\/api\//, "/api/");
  } else if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url}`;
  }
  next();
});

const allowedOrigins = [
  "https://sowmiyafoods.com",
  "https://www.sowmiyafoods.com",
  "http://localhost:5173",
  "http://localhost:5173/",
  "http://localhost:5174",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin: " + origin));
      }
    },
    credentials: true,
  })
);

// Debug middleware
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.path}`);
  console.log(`[DEBUG] Content-Type:`, req.headers['content-type']);
  console.log(`[DEBUG] Body exists:`, !!req.body);
  console.log(`[DEBUG] Body:`, req.body);
  next();
});

// Serverless-friendly DB connection middleware (ensures connection before routes)
app.use(async (req, res, next) => {
  if (req.path === "/api/health") {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ error: "Database connection failed", message: error.message });
  }
});

// Root API status
app.get("/api", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Sowmiya Foods API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/wishlist", WishlistRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/address", AddressRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/payment", paymentRoutes);

// ✅ Health Check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Server listener (runs in local and VPS environments like PM2, but not in Vercel serverless)
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  connectDB()
    .then(async () => {
      await syncEnvAdminUser();
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error("Startup DB error:", err);
      app.listen(PORT, () => console.log(`Server running on port ${PORT} (DB not connected)`));
    });
}

export default app;