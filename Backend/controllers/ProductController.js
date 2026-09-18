import mongoose from "mongoose";
import Product from "../models/Product.js";
import StockNotification from "../models/StockNotification.js";
import Review from "../models/Review.js";
import cloudinary from "../config/cloudinaryConfig.js";

// Helper to convert product name to slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")           // Replace spaces with -
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
    .replace(/\-\-+/g, "-")         // Replace multiple - with single -
    .replace(/^-+/, "")             // Trim - from start
    .replace(/-+$/, "");            // Trim - from end
};

// Helper to generate a unique slug
const generateUniqueSlug = async (name, currentProductId = null) => {
  let baseSlug = slugify(name);
  let slug = baseSlug;
  let count = 1;
  
  while (true) {
    const query = { slug };
    if (currentProductId) {
      query._id = { $ne: currentProductId };
    }
    const existing = await Product.findOne(query);
    if (!existing) break;
    slug = `${baseSlug}-${count}`;
    count++;
  }
  return slug;
};

// Helper to upload an image to Cloudinary if it is a Base64 string
const uploadToCloudinary = async (imageString) => {
  if (imageString && imageString.startsWith("data:image")) {
    try {
      const result = await cloudinary.uploader.upload(imageString, {
        folder: "sowmiyafoods",
      });
      return result.secure_url;
    } catch (error) {
      console.warn("Cloudinary upload failed (using raw image fallback):", error.message || error);
      return imageString;
    }
  }
  return imageString; // Return as is if already a URL or empty
};


// @desc Get all products with pagination
export const getProducts = async (req, res) => {
  try {
    // Backward compatibility: If page/limit parameters are not supplied, return the products array directly.
    if (!req.query.page && !req.query.limit) {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json(products);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + products.length < total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getProductsBySearch = async (req, res) => {
  try {
    const search = (req.query.q || "").trim();
    console.log("Search term:", search);

    if (!search) {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.status(200).json(products);
    }

    const regex = new RegExp(search, "i");
    const filter = {
      $or: [
        { name: { $regex: regex } },
        { category: { $regex: regex } },
        { description: { $regex: regex } },
      ],
    };

    const products = await Product.find(filter);
    console.log("Products found:", products.length);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error in getProductsBySearch:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};


// @desc Get last 10 latest products (newest first)
export const getLatestProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(10);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch latest products" });
  }
};

// @desc Get trending products (newest first)
export const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(8);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Get home page data (latest + trending in one call)
export const getHomeProducts = async (req, res) => {
  try {
    const [latestProducts, trendingProducts] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).limit(10),
      Product.find().sort({ createdAt: -1 }).limit(8),
    ]);
    res.status(200).json({ latestProducts, trendingProducts });
  } catch (error) {
    console.error("Error fetching home products:", error);
    res.status(500).json({ message: "Failed to fetch home products" });
  }
};


export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const search = req.query.search || "";
    const decodedCategory = decodeURIComponent(category);

    // If category is "All", return all products that match the search term
    const filter = decodedCategory.toLowerCase() === "all"
      ? { name: { $regex: new RegExp(search, "i") } }
      : {
          category: { $regex: new RegExp(`^${decodedCategory}$`, "i") }, // exact match (case-insensitive)
          name: { $regex: new RegExp(search, "i") },       // match name (optional search)
        };

    const products = await Product.find(filter);
    console.log(`Category filter: ${decodedCategory}, Products found: ${products.length}`);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// @desc Get a single product by ID or Slug
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Create a new product (Admin only)
export const createProduct = async (req, res) => {
  try {
    console.log("========== CREATE PRODUCT ==========");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message:
          "Request body is missing. Ensure Content-Type: application/json header is set.",
      });
    }

    const {
      name,
      description,
      price,
      category,
      image,
      stock,
      lowStockThreshold,
      inStock,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "Name and Price are required.",
      });
    }

    // Upload to Cloudinary if image is base64
    const imageUrl = await uploadToCloudinary(image);

    // Generate unique slug
    const slug = await generateUniqueSlug(name);

    const parsedStock = stock !== undefined && stock !== "" ? Math.max(0, Number(stock)) : 20;
    const parsedThreshold = lowStockThreshold !== undefined && lowStockThreshold !== "" ? Math.max(1, Number(lowStockThreshold)) : 10;
    const parsedInStock = inStock !== undefined ? Boolean(inStock) : parsedStock > 0;

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      image: imageUrl,
      slug,
      stock: parsedStock,
      lowStockThreshold: parsedThreshold,
      inStock: parsedInStock,
    });

    const savedProduct = await product.save();

    return res.status(201).json(savedProduct);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Update a product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock, lowStockThreshold, inStock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (name && name !== product.name) {
      product.slug = await generateUniqueSlug(name, product._id);
      product.name = name;
    }
    
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.category = category !== undefined ? category : product.category;
    
    if (stock !== undefined && stock !== "") {
      product.stock = Math.max(0, Number(stock));
      if (inStock === undefined) {
        product.inStock = product.stock > 0;
      }
    }

    if (lowStockThreshold !== undefined && lowStockThreshold !== "") {
      product.lowStockThreshold = Math.max(1, Number(lowStockThreshold));
    }

    if (inStock !== undefined) {
      product.inStock = Boolean(inStock);
    }

    if (image) {
      product.image = await uploadToCloudinary(image);
    }

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

// @desc Quick update product stock quantity and status
export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, inStock, lowStockThreshold } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (stock !== undefined && stock !== "") {
      product.stock = Math.max(0, Number(stock));
      if (inStock === undefined) {
        product.inStock = product.stock > 0;
      }
    }

    if (inStock !== undefined) {
      product.inStock = Boolean(inStock);
    }

    if (lowStockThreshold !== undefined && lowStockThreshold !== "") {
      product.lowStockThreshold = Math.max(1, Number(lowStockThreshold));
    }

    const saved = await product.save();
    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      product: saved,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: "Failed to update stock" });
  }
};

// @desc Fetch low stock and out-of-stock products for notification alerts, plus customer restock requests
export const getLowStockAlerts = async (req, res) => {
  try {
    const products = await Product.find().select("name price category stock lowStockThreshold inStock image slug").lean();

    // Fetch pending customer restock requests
    const customerAlerts = await StockNotification.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();

    // Group customer counts by product ID
    const customerCountsByProductId = {};
    customerAlerts.forEach((alert) => {
      const pid = String(alert.product);
      customerCountsByProductId[pid] = (customerCountsByProductId[pid] || 0) + 1;
    });

    const lowStockItems = [];
    const outOfStockItems = [];

    products.forEach((p) => {
      const currentStock = p.stock !== undefined ? Number(p.stock) : 20;
      const threshold = p.lowStockThreshold !== undefined ? Number(p.lowStockThreshold) : 10;
      const isAvailable = p.inStock !== false;
      const customerWaitlistCount = customerCountsByProductId[String(p._id)] || 0;

      if (!isAvailable || currentStock === 0) {
        outOfStockItems.push({
          ...p,
          alertType: "out_of_stock",
          stock: currentStock,
          threshold,
          customerWaitlistCount,
        });
      } else if (currentStock <= threshold) {
        lowStockItems.push({
          ...p,
          alertType: "low_stock",
          stock: currentStock,
          threshold,
          customerWaitlistCount,
        });
      }
    });

    // Fetch undismissed customer reviews
    const reviewAlerts = await Review.find({ adminDismissed: false })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      totalAlerts: lowStockItems.length + outOfStockItems.length + customerAlerts.length + reviewAlerts.length,
      stockAlertsCount: lowStockItems.length + outOfStockItems.length,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      customerRequestsCount: customerAlerts.length,
      reviewsCount: reviewAlerts.length,
      alerts: [...outOfStockItems, ...lowStockItems],
      customerAlerts,
      reviewAlerts,
    });
  } catch (error) {
    console.error("Error fetching low stock alerts:", error);
    res.status(500).json({ message: "Failed to fetch stock alerts" });
  }
};

// @desc Add a new customer review for a product with validation
export const createProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, rating, comment } = req.body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid name (at least 2 characters)",
      });
    }

    if (name.trim().length > 60) {
      return res.status(400).json({
        success: false,
        message: "Name cannot exceed 60 characters",
      });
    }

    // Validate email with standard RFC email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address (e.g. yourname@example.com)",
      });
    }

    // Validate rating
    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please select a star rating between 1 and 5",
      });
    }

    // Validate comment
    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Please write a review comment (at least 5 characters)",
      });
    }

    if (comment.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Review comment cannot exceed 1000 characters",
      });
    }

    // Find the product
    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const review = new Review({
      product: product._id,
      productName: product.name,
      productImage: product.image || "",
      customerName: name.trim(),
      customerEmail: email.trim().toLowerCase(),
      rating: parsedRating,
      comment: comment.trim(),
      status: "approved",
      adminDismissed: false,
    });

    const savedReview = await review.save();

    res.status(201).json({
      success: true,
      message: "Thank you! Your review has been submitted successfully.",
      review: savedReview,
    });
  } catch (error) {
    console.error("Error creating product review:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit review",
    });
  }
};

// @desc Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;

    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const reviews = await Review.find({
      product: product._id,
      status: "approved",
    }).sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
          )
        : 5.0;

    res.status(200).json({
      success: true,
      reviews,
      totalReviews,
      averageRating,
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

// @desc Dismiss review alert from Admin Notifications
export const dismissReviewAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(
      id,
      { adminDismissed: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({
      success: true,
      message: "Review notification dismissed successfully",
    });
  } catch (error) {
    console.error("Error dismissing review alert:", error);
    res.status(500).json({ success: false, message: "Failed to dismiss review alert" });
  }
};

// @desc Delete a review (Admin/Staff)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};

// @desc Customer requests back-in-stock notification
export const requestStockNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone, name } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: "Please provide an email or phone number" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const cleanEmail = (email || "").toLowerCase().trim();
    const cleanPhone = (phone || "").trim();

    // Check if customer already submitted request for this product
    const existing = await StockNotification.findOne({
      product: product._id,
      $or: [
        ...(cleanEmail ? [{ customerEmail: cleanEmail }] : []),
        ...(cleanPhone ? [{ customerPhone: cleanPhone }] : []),
      ],
      status: "pending",
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: `You're already registered on the waitlist for ${product.name}! We'll alert you as soon as it's restocked.`,
      });
    }

    const notification = new StockNotification({
      product: product._id,
      productName: product.name,
      productImage: product.image || "",
      customerEmail: cleanEmail || "N/A",
      customerPhone: cleanPhone || "",
      customerName: name || "Customer",
      status: "pending",
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: `Waitlist joined! We will alert you the moment ${product.name} is available.`,
      notification,
    });
  } catch (error) {
    console.error("Error creating stock notification:", error);
    res.status(500).json({ message: "Failed to submit restock request" });
  }
};

// @desc Dismiss customer alert (Admin only)
export const dismissCustomerAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await StockNotification.findByIdAndUpdate(
      id,
      { status: "dismissed" },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }
    res.status(200).json({ success: true, message: "Alert dismissed successfully" });
  } catch (error) {
    console.error("Error dismissing customer alert:", error);
    res.status(500).json({ message: "Failed to dismiss customer alert" });
  }
};

// @desc Get all unique categories
export const getAllCategories = async (req, res) => {
  try {
    // Use aggregation pipeline to safely get distinct non-empty categories
    const categories = await Product.aggregate([
      {
        $match: {
          category: { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $group: { _id: "$category" }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: { _id: 0, category: "$_id" }
      }
    ]);
    
    const validCategories = categories
      .map(c => c.category)
      .filter(cat => cat != null && cat !== "" && cat.trim() !== "");
    
    res.status(200).json(validCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// @desc Delete a product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

// @desc Bulk import products from spreadsheet (Admin / Staff)
export const bulkImportProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "An array of products is required for bulk import." });
    }

    const imported = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      const rowNum = i + 1;

      try {
        const name = (item.name || "").trim();
        const price = Number(item.price);
        const category = (item.category || "General").trim();
        const description = (item.description || "").trim();
        const stock =
          item.stock !== undefined && item.stock !== "" && !isNaN(Number(item.stock))
            ? Math.max(0, Number(item.stock))
            : 20;
        const lowStockThreshold =
          item.lowStockThreshold !== undefined &&
          item.lowStockThreshold !== "" &&
          !isNaN(Number(item.lowStockThreshold))
            ? Math.max(1, Number(item.lowStockThreshold))
            : 10;
        const inStock = item.inStock !== undefined ? Boolean(item.inStock) : stock > 0;

        if (!name) {
          errors.push({
            row: rowNum,
            item: item.name || `Row #${rowNum}`,
            error: "Missing required product name",
          });
          continue;
        }

        if (isNaN(price) || price <= 0) {
          errors.push({
            row: rowNum,
            item: name,
            error: "Price must be a valid number greater than 0",
          });
          continue;
        }

        // Upload image to Cloudinary if base64 data URL, else retain string/URL
        let imageUrl = item.image || item.imageUrl || "";
        if (imageUrl && imageUrl.startsWith("data:image")) {
          try {
            imageUrl = await uploadToCloudinary(imageUrl);
          } catch (imgErr) {
            console.warn(`Failed to upload image for ${name}, saving as is:`, imgErr.message);
          }
        }

        // Generate unique slug
        const slug = await generateUniqueSlug(name);

        const newProduct = new Product({
          name,
          price,
          category,
          description,
          image: imageUrl,
          slug,
          stock,
          lowStockThreshold,
          inStock,
        });

        const saved = await newProduct.save();
        imported.push(saved);
      } catch (err) {
        console.error(`Error importing row #${rowNum}:`, err);
        errors.push({ row: rowNum, item: item.name || `Row #${rowNum}`, error: err.message });
      }
    }

    return res.status(201).json({
      success: true,
      message: `Successfully imported ${imported.length} product${imported.length === 1 ? "" : "s"}.${errors.length > 0 ? ` Encountered ${errors.length} error(s).` : ""}`,
      totalProcessed: products.length,
      importedCount: imported.length,
      errorCount: errors.length,
      imported,
      errors,
    });
  } catch (error) {
    console.error("Bulk Import Controller Error:", error);
    res.status(500).json({ message: "Internal server error during bulk import", error: error.message });
  }
};
