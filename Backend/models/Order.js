import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  products: [
    {
      productId: { type: String },
      name: { type: String },
      category: { type: String, default: "" },
      quantity: { type: Number },
      price: { type: Number },
      subtotal: { type: Number },
      img: { type: String },
    },
  ],
  totalAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  paymentMethod: { type: String, default: "Razorpay" },
  status: {
    type: String,
    enum: ["paid", "processing", "shipped", "delivered", "cancelled"],
    default: "paid",
  },
  trackingNumber: { type: String, default: "" },
  address: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
  },
  customerEmail: { type: String, required: false },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
