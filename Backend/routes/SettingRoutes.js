import express from "express";
import Setting from "../models/Setting.js";
import cloudinary from "../config/cloudinaryConfig.js";
import { requirePermission } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/settings/meta-pixel — Fetch the saved Meta Pixel ID and Custom Script
router.get("/meta-pixel", async (req, res) => {
  try {
    const pixelSetting = await Setting.findOne({ key: "metaPixelId" });
    const scriptSetting = await Setting.findOne({ key: "metaPixelScript" });

    res.json({
      pixelId: pixelSetting ? pixelSetting.value : "",
      script: scriptSetting ? scriptSetting.value : "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch meta pixel settings" });
  }
});

// PUT /api/settings/meta-pixel (Admin/Staff with settings:manage)
router.put("/meta-pixel", requirePermission("settings:manage"), async (req, res) => {
  try {
    const { pixelId, script } = req.body;
    let savedPixelId = "";
    let savedScript = "";

    if (pixelId !== undefined) {
      const p = await Setting.findOneAndUpdate(
        { key: "metaPixelId" },
        { value: pixelId },
        { upsert: true, new: true }
      );
      savedPixelId = p.value;
    } else {
      const p = await Setting.findOne({ key: "metaPixelId" });
      savedPixelId = p ? p.value : "";
    }

    if (script !== undefined) {
      const s = await Setting.findOneAndUpdate(
        { key: "metaPixelScript" },
        { value: script },
        { upsert: true, new: true }
      );
      savedScript = s.value;
    } else {
      const s = await Setting.findOne({ key: "metaPixelScript" });
      savedScript = s ? s.value : "";
    }

    res.json({
      pixelId: savedPixelId,
      script: savedScript,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save meta pixel settings" });
  }
});

// GET /api/settings/diwali-popup-banner — Fetch the Diwali popup banner & content (Public)
router.get("/diwali-popup-banner", async (req, res) => {
  try {
    const bannerSetting = await Setting.findOne({ key: "diwaliPopupBanner" });
    const contentSetting = await Setting.findOne({ key: "diwaliPopupContent" });

    const defaultContent = {
      headline: "Celebrate With Pure & Traditional Taste!",
      description:
        "Freshly stone-ground flours, authentic millet mixes, noodles & traditional favorites prepared with 100% natural ingredients for your festive cooking.",
      badge: "Special Celebration",
      buttonText: "Shop Festive Offers",
      buttonLink: "/all-products?category=Diwali%20Special",
      footerText: "Pure & Authentic Ingredients",
      isEnabled: true,
    };

    let content = { ...defaultContent };
    if (contentSetting && contentSetting.value) {
      try {
        const parsed = JSON.parse(contentSetting.value);
        content = { ...content, ...parsed };
      } catch (e) {
        console.error("Error parsing diwaliPopupContent:", e);
      }
    }

    res.json({
      bannerUrl: bannerSetting ? bannerSetting.value : "",
      ...content,
    });
  } catch (err) {
    console.error("Error fetching Diwali popup banner & content:", err);
    res.status(500).json({ message: "Failed to fetch banner" });
  }
});

// PUT /api/settings/diwali-popup-banner — Update Diwali popup banner URL & content (Admin / Staff)
router.put("/diwali-popup-banner", requirePermission("settings:manage"), async (req, res) => {
  try {
    const {
      bannerUrl,
      headline,
      description,
      badge,
      buttonText,
      buttonLink,
      footerText,
      isEnabled,
    } = req.body;

    let savedBannerUrl = "";
    if (bannerUrl !== undefined) {
      const bannerSetting = await Setting.findOneAndUpdate(
        { key: "diwaliPopupBanner" },
        { value: bannerUrl || "" },
        { upsert: true, new: true }
      );
      savedBannerUrl = bannerSetting.value;
    } else {
      const existing = await Setting.findOne({ key: "diwaliPopupBanner" });
      savedBannerUrl = existing ? existing.value : "";
    }

    // Load existing content or defaults
    const defaultContent = {
      headline: "Celebrate With Pure & Traditional Taste!",
      description:
        "Freshly stone-ground flours, authentic millet mixes, noodles & traditional favorites prepared with 100% natural ingredients for your festive cooking.",
      badge: "Special Celebration",
      buttonText: "Shop Festive Offers",
      buttonLink: "/all-products?category=Diwali%20Special",
      footerText: "Pure & Authentic Ingredients",
      isEnabled: true,
    };

    const existingContentSetting = await Setting.findOne({ key: "diwaliPopupContent" });
    let currentContent = { ...defaultContent };
    if (existingContentSetting && existingContentSetting.value) {
      try {
        currentContent = { ...currentContent, ...JSON.parse(existingContentSetting.value) };
      } catch (_) {}
    }

    if (headline !== undefined) currentContent.headline = headline;
    if (description !== undefined) currentContent.description = description;
    if (badge !== undefined) currentContent.badge = badge;
    if (buttonText !== undefined) currentContent.buttonText = buttonText;
    if (buttonLink !== undefined) currentContent.buttonLink = buttonLink;
    if (footerText !== undefined) currentContent.footerText = footerText;
    if (isEnabled !== undefined) currentContent.isEnabled = Boolean(isEnabled);

    const updatedContentSetting = await Setting.findOneAndUpdate(
      { key: "diwaliPopupContent" },
      { value: JSON.stringify(currentContent) },
      { upsert: true, new: true }
    );

    res.json({
      bannerUrl: savedBannerUrl,
      ...currentContent,
    });
  } catch (err) {
    console.error("Error updating Diwali popup banner:", err);
    res.status(500).json({ message: "Failed to update banner" });
  }
});

// GET /api/settings/license-info — Fetch license numbers (FSSAI, GSTIN) (Public)
router.get("/license-info", async (req, res) => {
  try {
    const fssai = await Setting.findOne({ key: "fssaiLicense" });
    const gstin = await Setting.findOne({ key: "gstin" });
    const gstRate = await Setting.findOne({ key: "gstRate" });

    res.json({
      fssaiLicense: fssai ? fssai.value : "",
      gstin: gstin ? gstin.value : "",
      gstRate: gstRate ? gstRate.value : "5",
    });
  } catch (err) {
    console.error("Error fetching license info:", err);
    res.status(500).json({ message: "Failed to fetch license info" });
  }
});

// PUT /api/settings/license-info — Update license numbers (Admin / Staff)
router.put("/license-info", requirePermission("settings:manage"), async (req, res) => {
  try {
    const { fssaiLicense, gstin, gstRate } = req.body;

    if (fssaiLicense !== undefined) {
      await Setting.findOneAndUpdate(
        { key: "fssaiLicense" },
        { value: fssaiLicense },
        { upsert: true, new: true }
      );
    }
    if (gstin !== undefined) {
      await Setting.findOneAndUpdate(
        { key: "gstin" },
        { value: gstin },
        { upsert: true, new: true }
      );
    }
    if (gstRate !== undefined) {
      await Setting.findOneAndUpdate(
        { key: "gstRate" },
        { value: gstRate },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "License info updated successfully" });
  } catch (err) {
    console.error("Error updating license info:", err);
    res.status(500).json({ message: "Failed to update license info" });
  }
});

// GET /api/settings/main-banner — Fetch the main banner URL (Public)
router.get("/main-banner", async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: "mainBanner" });

    res.json({
      bannerUrl: setting ? setting.value : "",
    });
  } catch (err) {
    console.error("Error fetching main banner:", err);
    res.status(500).json({ message: "Failed to fetch banner" });
  }
});

// PUT /api/settings/main-banner — Update the main banner URL (Admin / Staff)
router.put("/main-banner", requirePermission("settings:manage"), async (req, res) => {
  try {
    const { bannerUrl } = req.body;

    const setting = await Setting.findOneAndUpdate(
      { key: "mainBanner" },
      { value: bannerUrl },
      { upsert: true, new: true }
    );

    res.json({
      bannerUrl: setting.value,
    });
  } catch (err) {
    console.error("Error updating main banner:", err);
    res.status(500).json({ message: "Failed to update banner" });
  }
});

// POST /api/settings/upload-image — Upload image base64 to Cloudinary (with fallback to base64 data URL)
router.post("/upload-image", requirePermission("settings:manage"), async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: "Image data is required" });
    }

    // Try Cloudinary upload if credentials are provided in .env
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "qnbhfeck";
    const isCloudinaryAlready = typeof image === "string" && image.includes(`res.cloudinary.com/${cloudName}`);

    if (!isCloudinaryAlready && typeof image === "string" && (image.startsWith("data:image") || image.startsWith("http://") || image.startsWith("https://"))) {
      try {
        const uploadRes = await cloudinary.uploader.upload(image, {
          folder: "sowmiyafoods/branding",
          resource_type: "auto",
        });
        if (uploadRes?.secure_url) {
          return res.json({ success: true, url: uploadRes.secure_url });
        }
      } catch (cloudErr) {
        console.warn("Cloudinary upload warning, falling back to original image data:", cloudErr.message);
      }
    }

    // Fallback: Return image data directly so uploading local files always works seamlessly
    return res.json({ success: true, url: image });
  } catch (err) {
    console.error("Error processing branding image:", err);
    return res.json({ success: true, url: req.body?.image || "" });
  }
});

// ─── DEVELOPER MODE & SITE CUSTOMIZER SETTINGS ─────────────────────────────
const DEFAULT_DEV_SETTINGS = {
  isDeveloperModeEnabled: true,
  siteLogo: "",
  navIcon: "",
  festivalLogo: "",
  festivalIcon: "",
  isFestivalMode: false,
  festivalName: "Diwali Celebration",
  festivalStartDate: "",
  festivalEndDate: "",
  isAutoFestivalSchedule: false,
  cardPreset: "modern_glass",
  activeTheme: "sowmiya_default",
  customPrimaryColor: "#e8703b",
  customNavLinks: [],
  advertisingBanner: {
    enabled: true,
    text: "🎉 Special Festive Season Offer! Get 20% OFF on Pure Stone-Ground Flours & Millet Products | Code: FESTIVE20",
    bg: "linear-gradient(90deg, #e8703b 0%, #d65f29 50%, #b84314 100%)",
    textColor: "#ffffff",
    link: "/products",
    speed: 18,
  },
};

// GET /api/settings/developer-settings (Public)
router.get("/developer-settings", async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: "developerSettings" });
    let config = { ...DEFAULT_DEV_SETTINGS };

    if (setting && setting.value) {
      try {
        const parsed = JSON.parse(setting.value);
        config = {
          ...config,
          ...parsed,
          advertisingBanner: {
            ...config.advertisingBanner,
            ...(parsed.advertisingBanner || {}),
          },
        };
      } catch (e) {
        console.error("Error parsing developerSettings:", e);
      }
    }

    res.json({ success: true, settings: config });
  } catch (err) {
    console.error("Error fetching developer settings:", err);
    res.status(500).json({ success: false, message: "Failed to fetch developer settings" });
  }
});

// PUT /api/settings/developer-settings (Admin / Operations Manager Only)
router.put("/developer-settings", requirePermission("settings:manage"), async (req, res) => {
  try {
    // Verify user role: Main Admin or Operations Manager
    const userRole = req.user?.role || (req.user?.isAdmin ? "admin" : "");
    const isMainAdminOrManager =
      req.user?.isAdmin ||
      req.user?.isPrimaryAdmin ||
      userRole === "admin" ||
      userRole === "manager";

    if (!isMainAdminOrManager) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Main Admin and Operations Manager can modify Developer Settings.",
      });
    }

    const existingSetting = await Setting.findOne({ key: "developerSettings" });
    let currentConfig = { ...DEFAULT_DEV_SETTINGS };

    if (existingSetting && existingSetting.value) {
      try {
        currentConfig = { ...currentConfig, ...JSON.parse(existingSetting.value) };
      } catch (_) {}
    }

    const updatedConfig = {
      ...currentConfig,
      ...req.body,
      advertisingBanner: {
        ...currentConfig.advertisingBanner,
        ...(req.body.advertisingBanner || {}),
      },
    };

    const saved = await Setting.findOneAndUpdate(
      { key: "developerSettings" },
      { value: JSON.stringify(updatedConfig) },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "Developer settings saved successfully!",
      settings: JSON.parse(saved.value),
    });
  } catch (err) {
    console.error("Error updating developer settings:", err);
    res.status(500).json({ success: false, message: "Failed to update developer settings" });
  }
});

export default router;
