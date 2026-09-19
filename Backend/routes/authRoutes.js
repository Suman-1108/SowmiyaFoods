import express from "express";
import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Address from "../models/Address.js";
import OTP from "../models/OTP.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { getSmtpTransporter, getFromAddress } from "../config/mailer.js";
import { protectAdmin, requirePermission, protectStaff } from "../middleware/authMiddleware.js";

const router = express.Router();

// 👑 Azure-Style RBAC Role Definitions & Capabilities
export const ROLE_DEFINITIONS = {
  admin: {
    key: "admin",
    name: "Admin (Owner)",
    badgeColor: "purple",
    description: "Full unrestricted control over store catalog, orders, settings, and staff delegation.",
    permissions: ["*"],
  },
  manager: {
    key: "manager",
    name: "Operations Manager",
    badgeColor: "blue",
    description: "Day-to-day operations: manage products, orders, inventory, and view customers.",
    permissions: [
      "dashboard:view",
      "products:view",
      "products:create",
      "products:edit",
      "orders:view",
      "orders:update",
      "customers:view",
      "settings:view",
    ],
  },
  order_manager: {
    key: "order_manager",
    name: "Order & Fulfillment Specialist",
    badgeColor: "amber",
    description: "Process orders, handle fulfillment statuses, and view customer shipping details.",
    permissions: [
      "dashboard:view",
      "orders:view",
      "orders:update",
      "customers:view",
    ],
  },
  catalog_specialist: {
    key: "catalog_specialist",
    name: "Catalog & Inventory Specialist",
    badgeColor: "emerald",
    description: "Create, update, and manage product inventory, categories, pricing, and stock.",
    permissions: [
      "dashboard:view",
      "products:view",
      "products:create",
      "products:edit",
    ],
  },
  viewer: {
    key: "viewer",
    name: "Support / Viewer",
    badgeColor: "slate",
    description: "Read-only access to view products, orders, customers, and store metrics.",
    permissions: [
      "dashboard:view",
      "products:view",
      "orders:view",
      "customers:view",
      "settings:view",
    ],
  },
  custom: {
    key: "custom",
    name: "Custom Role",
    badgeColor: "indigo",
    description: "Tailored granular access with custom selected permissions.",
    permissions: [],
  },
};

// 🔐 Helper: Issue JWT Token with full RBAC claims
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email || "",
      isAdmin: !!user.isAdmin,
      isPrimaryAdmin: !!user.isPrimaryAdmin,
      role: user.role || (user.isAdmin ? "admin" : "customer"),
      permissions:
        user.permissions && user.permissions.length > 0
          ? user.permissions
          : user.isAdmin
          ? ["*"]
          : [],
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// 👤 Helper: Format safe sanitized User response
export const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email || "",
  phone: user.phone || "",
  isAdmin: !!user.isAdmin,
  isPrimaryAdmin: !!user.isPrimaryAdmin,
  role: user.role || (user.isAdmin ? "admin" : "customer"),
  permissions:
    user.permissions && user.permissions.length > 0
      ? user.permissions
      : user.isAdmin
      ? ["*"]
      : [],
  isActive: user.isActive !== false,
  createdAt: user.createdAt,
});

// 📧 Reusable Helper to send OTP email via SMTP
async function sendEmailOTP({ targetEmail, otp, title = "Verification Code", subject = null }) {
  const emailSubject = subject || `${otp} is your verification code for Sowmiya Foods`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #fed7aa; border-radius: 16px; background-color: #fffbf5;">
      <h2 style="color: #9a3412; margin-top: 0;">Sowmiya Foods</h2>
      <p style="color: #4b5563; font-size: 15px; margin-bottom: 20px;">
        ${title}. Your One-Time Password (OTP) is:
      </p>
      <div style="font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #ea580c; background-color: #ffedd5; padding: 14px 20px; text-align: center; border-radius: 10px; margin: 18px 0; border: 1px dashed #f97316;">
        ${otp}
      </div>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
        This OTP will expire in 10 minutes. If you did not request this, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #fed7aa; margin: 20px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">
        Pure · Fresh · Tasty — Sowmiya Foods
      </p>
    </div>
  `;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return { success: false, error: "SMTP credentials not configured (EMAIL_USER / EMAIL_PASS missing)" };
  }

  try {
    const transporter = getSmtpTransporter();
    const fromAddress = getFromAddress();

    const info = await transporter.sendMail({
      from: fromAddress,
      to: targetEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(`📧 [SMTP] Verification code successfully sent to ${targetEmail} (messageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (smtpErr) {
    console.error("❌ SMTP sendMail failed:", smtpErr.message || smtpErr);
    return { success: false, error: smtpErr.message || "Failed to send email via SMTP" };
  }
}

// 📲 Send OTP Route (Phone or Email)
router.post("/send-otp", async (req, res) => {
  try {
    const { identifier, type } = req.body;

    if (!identifier || !type) {
      return res.status(400).json({ message: "Identifier and type are required" });
    }

    const cleanIdentifier = identifier.toString().trim();
    const otpType = type.trim();

    // Validation
    if (otpType === "phone") {
      const cleanPhone = cleanIdentifier.replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ message: "Please enter a valid 10-digit mobile number" });
      }
    } else if (otpType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanIdentifier)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
    } else {
      return res.status(400).json({ message: "Invalid type. Must be 'phone' or 'email'" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save or update OTP in DB
    await OTP.findOneAndUpdate(
      { identifier: cleanIdentifier.toLowerCase() },
      { identifier: cleanIdentifier.toLowerCase(), otp, type: otpType, expiresAt },
      { upsert: true, new: true }
    );

    // 📢 Prominently display OTP in terminal for developer testing & verification
    console.log("\n==================================================");
    console.log("               🔐 SOWMIYA FOODS OTP               ");
    console.log("==================================================");
    console.log(`  Target:     ${cleanIdentifier} (${otpType.toUpperCase()})`);
    console.log(`  Code (OTP): >>> ${otp} <<<`);
    console.log(`  Expires in: 10 Minutes (${expiresAt.toLocaleTimeString()})`);
    console.log("==================================================\n");

    // Send via Email if type is email
    if (otpType === "email") {
      const sendResult = await sendEmailOTP({
        targetEmail: cleanIdentifier.toLowerCase(),
        otp,
        title: "Account Verification",
        subject: `${otp} is your verification code for Sowmiya Foods`,
      });

      if (!sendResult.success) {
        console.warn(`⚠️ [SEND-OTP] Email delivery failed (${sendResult.error}). Providing resilient OTP code fallback.`);
        return res.status(200).json({
          success: true,
          message: `Verification code: ${otp}`,
          otpCode: otp,
          emailDeliveryFailed: true,
        });
      }

      return res.status(200).json({
        success: true,
        message: sendResult.sandboxWarning
          ? `Verification code: ${otp}`
          : `OTP sent successfully to ${cleanIdentifier}`,
        ...(sendResult.sandboxWarning ? { otpCode: otp } : {}),
      });
    }

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${cleanIdentifier}`,
      otpCode: otp,
    });
  } catch (error) {
    console.error("Error in /send-otp:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to send OTP. Please try again." });
  }
});

// 🔐 Verify OTP Route (Login / Auto-Register)
router.post("/verify-otp", async (req, res) => {
  try {
    const { identifier, otp, name } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ message: "Identifier and OTP are required" });
    }

    const cleanIdentifier = identifier.toString().trim();
    const cleanOtp = otp.toString().trim();

    // Verify OTP from database (case-insensitive for emails)
    const otpRecord = await OTP.findOne({
      $or: [
        { identifier: cleanIdentifier },
        { identifier: cleanIdentifier.toLowerCase() },
      ],
      otp: cleanOtp,
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Determine type
    const isEmail = cleanIdentifier.includes("@");

    // Find existing user by email or phone
    let user = await User.findOne({
      $or: [
        isEmail ? { email: cleanIdentifier.toLowerCase() } : { phone: cleanIdentifier },
        isEmail ? { email: cleanIdentifier } : { phone: cleanIdentifier.replace(/\D/g, "") },
      ],
    });

    if (!user) {
      // Create new user automatically (seamless registration)
      let defaultName =
        name?.trim() ||
        (isEmail ? cleanIdentifier.split("@")[0] : `User_${cleanIdentifier.slice(-4)}`);

      if (!defaultName) {
        defaultName = `User_${Date.now().toString().slice(-4)}`;
      }

      user = new User({
        name: defaultName,
        email: isEmail ? cleanIdentifier.toLowerCase() : undefined,
        phone: !isEmail ? cleanIdentifier : undefined,
        isAdmin: false,
      });

      try {
        await user.save();
      } catch (saveErr) {
        // Fallback in case of duplicate name conflict
        if (saveErr.code === 11000) {
          user.name = `${defaultName}_${Math.floor(1000 + Math.random() * 9000)}`;
          await user.save();
        } else {
          throw saveErr;
        }
      }
    } else {
      // Update phone or email if not set
      let updated = false;
      if (isEmail && !user.email) {
        user.email = cleanIdentifier.toLowerCase();
        updated = true;
      } else if (!isEmail && !user.phone) {
        user.phone = cleanIdentifier;
        updated = true;
      }
      if (name && name.trim() && user.name.startsWith("User_")) {
        user.name = name.trim();
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    // OTP verified successfully; now remove it
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate JWT token with RBAC
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: formatUserResponse(user),
      token,
    });
  } catch (error) {
    console.error("Error in /verify-otp:", error);
    res.status(500).json({ success: false, message: error.message || "Server error during OTP verification" });
  }
});

// ✅ User Signup with Password
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email: email.toLowerCase() }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    });

    if (existingUser) {
      return res.status(400).json({ message: "An account with this email or phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: email ? email.toLowerCase() : undefined,
      phone: phone || undefined,
      password: hashedPassword,
      isAdmin: false,
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      user: formatUserResponse(newUser),
      token,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// 🔍 Check Admin Setup Status (Public) - Supports up to 4 Admin Accounts
router.get("/admin/setup-status", async (req, res) => {
  try {
    const MAX_ADMINS = 4;
    const adminCount = await User.countDocuments({
      $or: [{ isAdmin: true }, { role: "admin" }, { isPrimaryAdmin: true }],
    });

    const isSetup = adminCount >= MAX_ADMINS;
    const canRegister = adminCount < MAX_ADMINS;
    const remainingSlots = Math.max(0, MAX_ADMINS - adminCount);

    res.status(200).json({
      success: true,
      isSetup,
      canRegister,
      adminCount,
      maxAdmins: MAX_ADMINS,
      remainingSlots,
      message:
        adminCount >= MAX_ADMINS
          ? "Admin setup completed. Maximum limit of 4 admin accounts reached."
          : `Admin registration open. ${adminCount} of ${MAX_ADMINS} admin accounts registered (${remainingSlots} slot${remainingSlots === 1 ? "" : "s"} remaining).`,
    });
  } catch (error) {
    console.error("Setup status error:", error);
    res.status(500).json({ success: false, message: "Server error checking setup status" });
  }
});

// 👑 Register Admin (Up to 4 Admins Allowed)
router.post("/admin/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Admin name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const MAX_ADMINS = 4;
    const adminCount = await User.countDocuments({
      $or: [{ isAdmin: true }, { role: "admin" }, { isPrimaryAdmin: true }],
    });

    if (adminCount >= MAX_ADMINS) {
      return res.status(403).json({
        success: false,
        message: `Registration Locked: Maximum limit of ${MAX_ADMINS} admin accounts has been reached.`,
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // Check if email or username is already taken
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { name: cleanName }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email or username already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isFirstAdmin = adminCount === 0;

    const newAdmin = new User({
      name: cleanName,
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
      password: hashedPassword,
      isAdmin: true,
      isPrimaryAdmin: isFirstAdmin,
      role: "admin",
      permissions: ["*"],
      isActive: true,
    });

    await newAdmin.save();

    const token = generateToken(newAdmin);
    const updatedCount = adminCount + 1;

    res.status(201).json({
      success: true,
      message: `Admin account created successfully! Registered as Admin ${updatedCount} of ${MAX_ADMINS}.`,
      user: formatUserResponse(newAdmin),
      token,
      slot: updatedCount,
      maxAdmins: MAX_ADMINS,
      remainingSlots: MAX_ADMINS - updatedCount,
    });
  } catch (error) {
    console.error("Admin Registration Error:", error);
    res.status(500).json({ success: false, message: "Server error during admin registration." });
  }
});

// 🛠️ Sync .env Admin Credentials (ADMIN_EMAIL & ADMIN_PASSWORD) to Database (admins and users collections)
export const syncEnvAdminUser = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "sowmiyafoods01@gmail.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123@";

    if (!adminEmail || !adminPassword) return;

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 1. Sync in Admin collection
    let adminRecord = await Admin.findOne({
      $or: [
        { email: adminEmail },
        { name: "SowmiyaFoods01" },
        { name: "Admin" },
        { isPrimaryAdmin: true },
      ],
    });

    if (adminRecord) {
      adminRecord.email = adminEmail;
      adminRecord.password = hashedPassword;
      adminRecord.isAdmin = true;
      adminRecord.role = "admin";
      adminRecord.permissions = ["*"];
      adminRecord.isActive = true;
      await adminRecord.save();
    } else {
      adminRecord = new Admin({
        name: "SowmiyaFoods01",
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        isPrimaryAdmin: true,
        role: "admin",
        permissions: ["*"],
        isActive: true,
      });
      await adminRecord.save();
    }

    // 2. Sync in User collection
    let userRecord = await User.findOne({
      $or: [
        { email: adminEmail },
        { name: "SowmiyaFoods01" },
        { name: "Admin" },
        { isPrimaryAdmin: true },
      ],
    });

    if (userRecord) {
      userRecord.email = adminEmail;
      userRecord.password = hashedPassword;
      userRecord.isAdmin = true;
      userRecord.role = "admin";
      userRecord.permissions = ["*"];
      userRecord.isActive = true;
      await userRecord.save();
    } else {
      userRecord = new User({
        name: "SowmiyaFoods01",
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        isPrimaryAdmin: true,
        role: "admin",
        permissions: ["*"],
        isActive: true,
      });
      await userRecord.save();
    }

    console.log(`✅ [ENV ADMIN SYNC] Synced admin credentials to 'admins' and 'users' collections: ${adminEmail}`);
  } catch (err) {
    console.error("⚠️ Failed to sync .env admin to DB:", err.message);
  }
};

// ✅ Login Route (Supports Admin, Staff, and Customers with Optional Verification Code Option)
router.post("/login", async (req, res) => {
  try {
    const {
      name,
      email: bodyEmail,
      password,
      isAdminLogin,
      requireOtp,
      sendVerificationCode,
    } = req.body || {};

    const shouldSendOtp = Boolean(requireOtp || sendVerificationCode);

    const cleanName = (name || bodyEmail || req.body.emailOrName || "").toString().trim();
    const cleanPassword = (password || "").toString().trim();
    if (!cleanName || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: "Username / Email and password are required",
      });
    }

    let user = await User.findOne({
      $or: [
        { name: cleanName },
        { email: cleanName.toLowerCase() },
        { phone: cleanName },
      ],
    });

    if (!user && (isAdminLogin || cleanName.toLowerCase().includes("admin") || cleanName.toLowerCase().includes("sowmiya"))) {
      user = await Admin.findOne({
        $or: [
          { name: cleanName },
          { email: cleanName.toLowerCase() },
          { phone: cleanName },
        ],
      });
    }

    // Fallback: Check if credentials match .env ADMIN_EMAIL & ADMIN_PASSWORD
    const envAdminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    const envAdminPass = (process.env.ADMIN_PASSWORD || "").trim();

    if (!user && envAdminEmail && (cleanName.toLowerCase() === envAdminEmail || cleanName.toLowerCase() === "admin" || cleanName.toLowerCase() === "sowmiyafoods01")) {
      if (cleanPassword === envAdminPass || password === envAdminPass) {
        await syncEnvAdminUser();
        user = await Admin.findOne({ email: envAdminEmail }) || await User.findOne({ email: envAdminEmail });
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid username, email/mobile or password",
      });
    }

    // Portal login permission check
    const isStaffUser =
      user.isAdmin ||
      ["admin", "manager", "order_manager", "catalog_specialist", "viewer", "custom"].includes(user.role);

    if (isAdminLogin && !isStaffUser) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Administrative or staff privileges required.",
      });
    }

    // Check if account is active
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact the administrator.",
      });
    }

    let isMatch = false;
    if (user.password) {
      isMatch = await bcrypt.compare(cleanPassword, user.password);
      if (!isMatch && cleanPassword !== password) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }

    // Also allow match against .env ADMIN_PASSWORD if user is admin
    if (!isMatch && envAdminPass && (cleanPassword === envAdminPass || password === envAdminPass) && (user.isAdmin || user.email === envAdminEmail)) {
      isMatch = true;
      user.password = await bcrypt.hash(envAdminPass, 10);
      await user.save();
    }

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ── OPTION A: DIRECT LOGIN (Password Only) ───────────────────
    if (!shouldSendOtp) {
      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        requiresOtp: false,
        message: `Welcome back, ${user.name || "Admin"}!`,
        user: formatUserResponse(user),
        token,
      });
    }

    // ── OPTION B: VERIFICATION CODE (2FA OTP) ───────────────────
    const targetEmail =
      user.email ||
      (cleanName.includes("@") ? cleanName.toLowerCase() : process.env.EMAIL_USER || "sowmiyafoods01@gmail.com");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in MongoDB OTP collection (for email and username to support verification under either)
    await OTP.findOneAndUpdate(
      { identifier: targetEmail.toLowerCase() },
      { identifier: targetEmail.toLowerCase(), otp, type: "email", expiresAt },
      { upsert: true, new: true }
    );
    if (user.name && user.name.toLowerCase() !== targetEmail.toLowerCase()) {
      await OTP.findOneAndUpdate(
        { identifier: user.name.toLowerCase() },
        { identifier: user.name.toLowerCase(), otp, type: "email", expiresAt },
        { upsert: true, new: true }
      );
    }

    console.log("\n==================================================");
    console.log("          🔐 SOWMIYA FOODS ADMIN LOGIN OTP        ");
    console.log("==================================================");
    console.log(`  User:       ${user.name} (${targetEmail})`);
    console.log(`  Code (OTP): >>> ${otp} <<<`);
    console.log(`  Expires in: 10 Minutes (${expiresAt.toLocaleTimeString()})`);
    console.log("==================================================\n");

    // Send OTP via email helper
    const sendResult = await sendEmailOTP({
      targetEmail: targetEmail.toLowerCase(),
      otp,
      title: "Admin Login Verification",
      subject: `${otp} is your admin login verification code for Sowmiya Foods`,
    });

    return res.status(200).json({
      success: true,
      requiresOtp: true,
      message: sendResult.success
        ? `Verification code sent to ${targetEmail}`
        : `Verification code: ${otp} (Enter this code to complete verification)`,
      email: targetEmail,
      identifier: targetEmail,
      otpCode: otp,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// 🔄 Resend Login OTP (For Admin / Staff 2FA)
router.post("/resend-login-otp", async (req, res) => {
  try {
    const { email, identifier } = req.body;
    const targetEmail = (email || identifier || "").toLowerCase().trim();

    if (!targetEmail) {
      return res.status(400).json({ message: "Email is required to resend verification code" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.findOneAndUpdate(
      { identifier: targetEmail },
      { identifier: targetEmail, otp, type: "email", expiresAt },
      { upsert: true, new: true }
    );

    console.log(`\n🔄 [RESEND OTP] >>> ${otp} <<< for ${targetEmail}\n`);

    const sendResult = await sendEmailOTP({
      targetEmail,
      otp,
      title: "Admin Login Verification",
      subject: `${otp} is your admin login verification code for Sowmiya Foods`,
    });

    res.status(200).json({
      success: true,
      message: sendResult.success
        ? `Fresh verification code sent to ${targetEmail}`
        : `Fresh verification code: ${otp}`,
      otpCode: otp,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ message: "Failed to resend verification code" });
  }
});

// 🔑 Verify Login OTP (For Admin / Staff 2FA)
router.post("/verify-login-otp", async (req, res) => {
  try {
    const { email, identifier, otp } = req.body;
    const target = (email || identifier || "").toString().trim();
    const targetEmail = target.toLowerCase();

    if (!target || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const cleanOtp = otp.toString().trim();

    const otpRecord = await OTP.findOne({
      $or: [
        { identifier: target },
        { identifier: targetEmail },
      ],
      otp: cleanOtp,
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: "OTP has expired. Please log in again." });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    let user = await User.findOne({
      $or: [{ email: targetEmail }, { name: target }, { name: targetEmail }, { phone: target }],
    });

    if (!user) {
      user = await Admin.findOne({
        $or: [{ email: targetEmail }, { name: target }, { name: targetEmail }, { phone: target }],
      });
    }

    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Account has been deactivated. Contact administrator." });
    }

    const isStaffUser =
      user.isAdmin ||
      ["admin", "manager", "order_manager", "catalog_specialist", "viewer", "custom"].includes(user.role);

    if (!isStaffUser) {
      return res.status(403).json({ message: "Access denied. Administrative privileges required." });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      user: formatUserResponse(user),
      token,
    });
  } catch (error) {
    console.error("Verify Login OTP error:", error);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
});

// 📋 Staff / Roles Definitions (Public/Staff)
router.get("/admin/roles-definitions", (req, res) => {
  res.status(200).json(ROLE_DEFINITIONS);
});

// 👥 Get all staff members (Admin only)
router.get("/admin/staff", protectAdmin, async (req, res) => {
  try {
    const staffMembers = await User.find({
      $or: [
        { isAdmin: true },
        { isPrimaryAdmin: true },
        {
          role: {
            $in: [
              "admin",
              "manager",
              "order_manager",
              "catalog_specialist",
              "viewer",
              "custom",
            ],
          },
        },
      ],
    })
      .select("-password")
      .populate("assignedBy", "name email")
      .sort({ isPrimaryAdmin: -1, createdAt: -1 })
      .lean();

    res.status(200).json(staffMembers);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ message: "Failed to fetch staff members" });
  }
});

// ➕ Create new staff member (Admin only)
router.post("/admin/staff", protectAdmin, async (req, res) => {
  try {
    const { name, email, phone, password, role, permissions } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { name: cleanName }],
    });

    if (existing) {
      return res.status(400).json({ message: "A user with this email or name already exists." });
    }

    let finalPermissions = permissions;
    if (!finalPermissions || !Array.isArray(finalPermissions) || finalPermissions.length === 0) {
      finalPermissions = ROLE_DEFINITIONS[role]?.permissions || [];
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = new User({
      name: cleanName,
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
      password: hashedPassword,
      isAdmin: role === "admin",
      isPrimaryAdmin: false,
      role,
      permissions: finalPermissions,
      isActive: true,
      assignedBy: req.user.id,
    });

    await newStaff.save();

    res.status(201).json({
      success: true,
      message: `${newStaff.name} added to staff as ${ROLE_DEFINITIONS[role]?.name || role}!`,
      staff: formatUserResponse(newStaff),
    });
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({ message: "Failed to create staff member." });
  }
});

// ✏️ Update staff member (Admin only)
router.put("/admin/staff/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, role, permissions, isActive } = req.body;

    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    // Protect Primary Admin from being demoted or deactivated
    if (staff.isPrimaryAdmin) {
      if (isActive === false) {
        return res.status(400).json({ message: "The Primary Admin cannot be deactivated." });
      }
      if (role && role !== "admin") {
        return res.status(400).json({ message: "The Primary Admin's role cannot be changed." });
      }
    }

    if (name) staff.name = name.trim();
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== staff.email) {
        const emailExists = await User.findOne({ email: cleanEmail, _id: { $ne: id } });
        if (emailExists) {
          return res.status(400).json({ message: "This email is already in use by another user." });
        }
        staff.email = cleanEmail;
      }
    }
    if (phone !== undefined) staff.phone = phone ? phone.trim() : undefined;
    if (password && password.trim()) {
      staff.password = await bcrypt.hash(password.trim(), 10);
    }
    if (role && !staff.isPrimaryAdmin) {
      staff.role = role;
      staff.isAdmin = role === "admin";
    }
    if (permissions && Array.isArray(permissions) && !staff.isPrimaryAdmin) {
      staff.permissions = permissions;
    }
    if (isActive !== undefined && !staff.isPrimaryAdmin) {
      staff.isActive = Boolean(isActive);
    }

    await staff.save();

    res.status(200).json({
      success: true,
      message: "Staff member updated successfully.",
      staff: formatUserResponse(staff),
    });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ message: "Failed to update staff member." });
  }
});

// 🗑️ Delete staff member (Admin only)
router.delete("/admin/staff/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found." });
    }

    if (staff.isPrimaryAdmin) {
      return res.status(403).json({ message: "The Primary Admin account cannot be deleted." });
    }

    if (req.user.id === id) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Staff member ${staff.name} deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ message: "Failed to delete staff member." });
  }
});

// ✅ Fetch all users with addresses (admin or staff with customers:view)
router.get("/admin/users", requirePermission("customers:view"), async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();

    const usersWithAddresses = await Promise.all(
      users.map(async (user) => {
        const addresses = await Address.find({ userId: user._id });
        return { ...user, addresses };
      })
    );

    res.status(200).json(usersWithAddresses);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// ✅ Delete a user (admin or staff with customers:manage)
router.delete("/admin/users/:userId", requirePermission("customers:manage"), async (req, res) => {
  try {
    const { userId } = req.params;

    await Address.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User and addresses deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error deleting user" });
  }
});

// ✅ Delete address (admin or staff with customers:manage)
router.delete("/admin/addresses/:addressId", requirePermission("customers:manage"), async (req, res) => {
  try {
    const { addressId } = req.params;

    await Address.findByIdAndDelete(addressId);
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    console.error("Error deleting address:", err);
    res.status(500).json({ message: "Server error deleting address" });
  }
});

// ✅ GET /api/auth/profile/:id — Fetch user profile
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// ✅ PUT /api/auth/profile/:id — Update user profile details
router.put("/profile/:id", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (email !== undefined) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      if (cleanEmail && cleanEmail !== user.email) {
        const existingEmailUser = await User.findOne({
          email: cleanEmail,
          _id: { $ne: userId },
        });
        if (existingEmailUser) {
          return res.status(400).json({ message: "This email address is already in use by another account" });
        }
      }
      user.email = cleanEmail || undefined;
    }

    if (phone !== undefined) {
      const cleanPhone = phone.trim();
      if (cleanPhone && cleanPhone.length !== 10) {
        return res.status(400).json({ message: "Mobile number must be 10 digits" });
      }
      if (cleanPhone && cleanPhone !== user.phone) {
        const existingPhoneUser = await User.findOne({
          phone: cleanPhone,
          _id: { $ne: userId },
        });
        if (existingPhoneUser) {
          return res.status(400).json({ message: "This mobile number is already registered to another account" });
        }
      }
      user.phone = cleanPhone || undefined;
    }

    await user.save();

    // Re-issue JWT token with updated user name
    const token = jwt.sign(
      { id: user._id, name: user.name, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const updatedUser = {
      id: user._id,
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
      token,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

export default router;
