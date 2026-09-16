import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    password: { type: String, required: false },
    isAdmin: { type: Boolean, default: false },
    isPrimaryAdmin: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["admin", "manager", "order_manager", "catalog_specialist", "viewer", "custom", "customer"],
      default: "customer",
    },
    permissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
