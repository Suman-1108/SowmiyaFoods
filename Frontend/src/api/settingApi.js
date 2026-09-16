import axiosInstance from "./axiosInstance";

export const getMetaPixelId = async () => {
  try {
    const res = await axiosInstance.get("/settings/meta-pixel");
    return res.data?.pixelId || null;
  } catch (_) {
    return null;
  }
};

export const updateMetaPixelId = async (pixelId, token) => {
  const res = await axiosInstance.put(
    "/settings/meta-pixel",
    { pixelId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data?.pixelId;
};

export const getCustomMetaScript = async () => {
  try {
    const res = await axiosInstance.get("/settings/meta-pixel");
    return res.data?.script || null;
  } catch (_) {
    return null;
  }
};

export const updateCustomMetaScript = async (script, token) => {
  const res = await axiosInstance.put(
    "/settings/meta-pixel",
    { script },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.script;
};

// Diwali / Festival Popup Configuration APIs
export const getDiwaliPopupConfig = async () => {
  try {
    const res = await axiosInstance.get("/settings/diwali-popup-banner");
    return res.data || {};
  } catch (_) {
    return {
      bannerUrl: "",
      headline: "Celebrate With Pure & Traditional Taste!",
      description:
        "Freshly stone-ground flours, authentic millet mixes, noodles & traditional favorites prepared with 100% natural ingredients for your festive cooking.",
      badge: "Special Celebration",
      buttonText: "Shop Festive Offers",
      buttonLink: "/all-products?category=Diwali%20Special",
      footerText: "Pure & Authentic Ingredients",
      isEnabled: true,
    };
  }
};

export const updateDiwaliPopupConfig = async (config, token) => {
  const res = await axiosInstance.put(
    "/settings/diwali-popup-banner",
    config,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Legacy banner-only helpers
export const getDiwaliPopupBanner = async () => {
  const config = await getDiwaliPopupConfig();
  return config.bannerUrl || "";
};

export const updateDiwaliPopupBanner = async (imageUrl, token) => {
  const res = await updateDiwaliPopupConfig({ bannerUrl: imageUrl }, token);
  return res.bannerUrl;
};
