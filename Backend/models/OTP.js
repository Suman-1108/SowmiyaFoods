import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, index: true }, // phone or email
    otp: { type: String, required: true },
    type: { type: String, enum: ["phone", "email"], default: "phone" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete documents when expiresAt timestamp is reached
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OTP", otpSchema);
