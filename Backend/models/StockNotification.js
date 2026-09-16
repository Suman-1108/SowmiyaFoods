import mongoose from "mongoose";

const stockNotificationSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      default: "",
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      trim: true,
      default: "",
    },
    customerName: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "notified", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

stockNotificationSchema.index({ product: 1, customerEmail: 1 });
stockNotificationSchema.index({ status: 1, createdAt: -1 });

const StockNotification = mongoose.model("StockNotification", stockNotificationSchema);

export default StockNotification;
