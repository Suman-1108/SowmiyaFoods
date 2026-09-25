import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number },
    description: { type: String },
    category: { type: String },
    categories: [{ type: String }],
    image: { type: String },
    slug: { type: String, unique: true, sparse: true },
    stock: { type: Number, default: 20, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 1 },
    inStock: { type: Boolean, default: true },
    label: { type: String, default: "" },
    quote: { type: String, default: "" },
    tamilName: { type: String, default: "" },
    tamilSlogan: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ Indexes for faster queries
productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, name: 1 });
productSchema.index({ categories: 1 });
productSchema.index({ name: "text", category: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;
