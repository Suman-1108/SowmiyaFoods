import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: true },
    isPrimaryAdmin: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["admin", "manager", "order_manager", "catalog_specialist", "viewer", "custom"],
      default: "admin",
    },
    permissions: {
      type: [String],
      default: ["*"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true, collection: "admins" }
);

export default mongoose.model("Admin", adminSchema);
