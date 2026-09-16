import React, { useState, useEffect } from "react";
import {
  Settings,
  Image as ImageIcon,
  Code,
  Sparkles,
  Save,
  Upload,
  RefreshCw,
  Eye,
  X,
  Flame,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Wrench,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import {
  getMetaPixelId,
  updateMetaPixelId,
  getCustomMetaScript,
  updateCustomMetaScript,
  getDiwaliPopupConfig,
  updateDiwaliPopupConfig,
} from "../../api/settingApi";

const DEFAULT_POPUP_CONTENT = {
  headline: "Celebrate With Pure & Traditional Taste!",
  description:
    "Freshly stone-ground flours, authentic millet mixes, noodles & traditional favorites prepared with 100% natural ingredients for your festive cooking.",
  badge: "Special Celebration",
  buttonText: "Shop Festive Offers",
  buttonLink: "/all-products?category=Diwali%20Special",
  footerText: "Pure & Authentic Ingredients",
  isEnabled: true,
};

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);

  // Diwali / Festive Popup State
  const [popupConfig, setPopupConfig] = useState({
    bannerUrl: "",
    ...DEFAULT_POPUP_CONTENT,
  });
  const [diwaliInput, setDiwaliInput] = useState("");
  const [diwaliPreview, setDiwaliPreview] = useState("");
  const [diwaliSaving, setDiwaliSaving] = useState(false);

  // Meta Pixel & Script State
  const [pixelId, setPixelId] = useState("");
  const [pixelInput, setPixelInput] = useState("");
  const [pixelSaving, setPixelSaving] = useState(false);

  const [customScript, setCustomScript] = useState("");
  const [scriptInput, setScriptInput] = useState("");
  const [scriptSaving, setScriptSaving] = useState(false);

  // Developer Mode Enable/Disable State
  const [isDeveloperModeEnabled, setIsDeveloperModeEnabled] = useState(true);
  const [showDevModal, setShowDevModal] = useState(false);
  const [devSaving, setDevSaving] = useState(false);

  const token = localStorage.getItem("token");

  const loadSettingsData = async () => {
    setLoading(true);
    try {
      const [popupRes, pixelRes, scriptRes, devRes] = await Promise.allSettled([
        getDiwaliPopupConfig(),
        getMetaPixelId(),
        getCustomMetaScript(),
        axiosInstance.get("/settings/developer-settings"),
      ]);

      if (popupRes.status === "fulfilled" && popupRes.value) {
        const data = popupRes.value;
        setPopupConfig({
          bannerUrl: data.bannerUrl || "",
          headline: data.headline || DEFAULT_POPUP_CONTENT.headline,
          description: data.description || DEFAULT_POPUP_CONTENT.description,
          badge: data.badge || DEFAULT_POPUP_CONTENT.badge,
          buttonText: data.buttonText || DEFAULT_POPUP_CONTENT.buttonText,
          buttonLink: data.buttonLink || DEFAULT_POPUP_CONTENT.buttonLink,
          footerText: data.footerText || DEFAULT_POPUP_CONTENT.footerText,
          isEnabled: data.isEnabled !== undefined ? Boolean(data.isEnabled) : true,
        });
        setDiwaliInput(data.bannerUrl || "");
        setDiwaliPreview(data.bannerUrl || "");
      }

      if (pixelRes.status === "fulfilled" && pixelRes.value) {
        setPixelId(pixelRes.value);
        setPixelInput(pixelRes.value);
      }

      if (scriptRes.status === "fulfilled" && scriptRes.value) {
        setCustomScript(scriptRes.value);
        setScriptInput(scriptRes.value);
      }

      if (devRes.status === "fulfilled" && devRes.value?.data?.settings) {
        setIsDeveloperModeEnabled(devRes.value.data.settings.isDeveloperModeEnabled !== false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load some store settings");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Developer Mode with optional confirmation popup
  const handleToggleDevModeClick = () => {
    if (!isDeveloperModeEnabled) {
      // Opening/Enabling -> Show Confirmation Modal
      setShowDevModal(true);
    } else {
      // Turning OFF -> Save immediately
      saveDeveloperModeState(false);
    }
  };

  const saveDeveloperModeState = async (newStatus) => {
    setDevSaving(true);
    try {
      const res = await axiosInstance.put("/settings/developer-settings", {
        isDeveloperModeEnabled: newStatus,
      });
      if (res.data?.success) {
        setIsDeveloperModeEnabled(newStatus);
        toast.success(
          newStatus
            ? "Developer Mode Enabled! Customizer menu unlocked in sidebar."
            : "Developer Mode Disabled. Menu hidden from sidebar."
        );
        window.dispatchEvent(new Event("developerSettingsUpdated"));
      } else {
        toast.error("Failed to update Developer Mode status");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update Developer Mode status");
    } finally {
      setDevSaving(false);
      setShowDevModal(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  // Save Festive Popup Settings
  const handleSavePopupConfig = async (e) => {
    e?.preventDefault();
    setDiwaliSaving(true);
    try {
      const finalImage = diwaliPreview || diwaliInput || popupConfig.bannerUrl || "";
      const payload = {
        ...popupConfig,
        bannerUrl: finalImage,
      };

      const updated = await updateDiwaliPopupConfig(payload, token);
      setPopupConfig((prev) => ({
        ...prev,
        ...updated,
        bannerUrl: updated.bannerUrl || finalImage,
      }));
      setDiwaliPreview(updated.bannerUrl || finalImage);
      setDiwaliInput(updated.bannerUrl || finalImage);
      toast.success("Festive popup content & settings saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update festive popup settings");
    } finally {
      setDiwaliSaving(false);
    }
  };

  // Reset Content to Defaults
  const handleResetDefaults = () => {
    setPopupConfig((prev) => ({
      ...prev,
      ...DEFAULT_POPUP_CONTENT,
    }));
    toast.success("Reset fields to default festival content");
  };

  const handleBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDiwaliPreview(reader.result);
      setDiwaliInput("");
      setPopupConfig((prev) => ({ ...prev, bannerUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Save Meta Pixel
  const handleSavePixel = async (e) => {
    e.preventDefault();
    setPixelSaving(true);
    try {
      await updateMetaPixelId(pixelInput.trim(), token);
      setPixelId(pixelInput.trim());
      toast.success("Meta Pixel ID saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save Meta Pixel ID");
    } finally {
      setPixelSaving(false);
    }
  };

  // Save Custom Script
  const handleSaveScript = async (e) => {
    e.preventDefault();
    setScriptSaving(true);
    try {
      await updateCustomMetaScript(scriptInput.trim(), token);
      setCustomScript(scriptInput.trim());
      toast.success("Custom tracking script saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save custom script");
    } finally {
      setScriptSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Store & Marketing Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Customize celebratory modal popup content, festival banners, tracking pixels, and head scripts.
          </p>
        </div>

        <button
          onClick={loadSettingsData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#e8703b]" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          Developer Mode Master Control Toggle Card & Confirmation Modal
          ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Developer Mode System Access
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    isDeveloperModeEnabled
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  }`}
                >
                  {isDeveloperModeEnabled ? "ENABLED" : "DISABLED"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Controls access to the high-level Developer Mode customizer suite (Logo overlays, card presets, site themes, custom navbar links & announcement tickers). When disabled, the Developer Mode menu item is hidden from the sidebar menu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
            {isDeveloperModeEnabled && (
              <a
                href="/portal/developer"
                className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold border border-slate-600 transition flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-orange-400" />
                <span>Open Developer Mode</span>
              </a>
            )}

            <button
              type="button"
              disabled={devSaving}
              onClick={handleToggleDevModeClick}
              className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer border shadow-md ${
                isDeveloperModeEnabled
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/30"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
              }`}
            >
              {isDeveloperModeEnabled ? (
                <>
                  <ToggleRight className="w-5 h-5 text-white" />
                  <span>Developer Mode Active</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-slate-400" />
                  <span>Enable Developer Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Confirmation Modal Popup for Enabling Developer Mode */}
        {showDevModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative origin-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h4 className="text-lg font-black text-center text-slate-900 tracking-tight">
                Enable Developer Mode?
              </h4>
              <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
                You are about to enable <strong>Developer Mode</strong>. This grants Main Admin & Operations Managers direct control over site branding logos, festival overlays, dynamic theme presets, card designs, and announcement tickers.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDevModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={devSaving}
                  onClick={() => saveDeveloperModeState(true)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition cursor-pointer"
                >
                  {devSaving ? "Enabling..." : "Confirm & Enable"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          Festive Greeting Popup: Full Content & Banner Customizer
          ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Section Top Bar with Status & Preview */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50/40 via-white to-orange-50/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8703b]/10 text-[#e8703b] flex items-center justify-center border border-[#e8703b]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Festive Greeting Popup & Content Editor
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    popupConfig.isEnabled
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {popupConfig.isEnabled ? "Active on Store" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize the festive headline, promotional copy, badges, button links, and popup banner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Enable/Disable Toggle */}
            <button
              type="button"
              onClick={() =>
                setPopupConfig((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))
              }
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                popupConfig.isEnabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
            >
              {popupConfig.isEnabled ? (
                <ToggleRight className="w-4 h-4 text-emerald-600" />
              ) : (
                <ToggleLeft className="w-4 h-4 text-slate-400" />
              )}
              <span>{popupConfig.isEnabled ? "Popup Enabled" : "Popup Disabled"}</span>
            </button>

            {/* Preview on Store */}
            <a
              href="/?festival=true"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition"
              title="Open the store homepage with live festival popup preview"
            >
              <Eye className="w-3.5 h-3.5 text-[#e8703b]" />
              <span>Preview Live</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Editor Body: Controls (Left) & Real-time Live Preview (Right) */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column: Configuration Form (7 cols) ── */}
          <form onSubmit={handleSavePopupConfig} className="lg:col-span-7 space-y-5">
            {/* Headline */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Modal Headline
                </label>
                <span className="text-[11px] text-slate-400">Primary bold heading</span>
              </div>
              <input
                type="text"
                value={popupConfig.headline}
                onChange={(e) =>
                  setPopupConfig((prev) => ({ ...prev, headline: e.target.value }))
                }
                placeholder="e.g. Celebrate With Pure & Traditional Taste!"
                className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:bg-white transition"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Promotional Message / Description
                </label>
                <span className="text-[11px] text-slate-400">Body text in the modal</span>
              </div>
              <textarea
                rows={3}
                value={popupConfig.description}
                onChange={(e) =>
                  setPopupConfig((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Freshly stone-ground flours, authentic millet mixes, noodles & traditional favorites prepared with 100% natural ingredients for your festive cooking."
                className="w-full px-3.5 py-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:bg-white transition leading-relaxed"
              />
            </div>

            {/* Badge & Button Text in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Celebration Badge Text
                </label>
                <input
                  type="text"
                  value={popupConfig.badge}
                  onChange={(e) =>
                    setPopupConfig((prev) => ({ ...prev, badge: e.target.value }))
                  }
                  placeholder="e.g. Special Celebration"
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={popupConfig.buttonText}
                  onChange={(e) =>
                    setPopupConfig((prev) => ({ ...prev, buttonText: e.target.value }))
                  }
                  placeholder="e.g. Shop Festive Offers"
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Button Link & Footer Note in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  CTA Redirect Destination
                </label>
                <input
                  type="text"
                  value={popupConfig.buttonLink}
                  onChange={(e) =>
                    setPopupConfig((prev) => ({ ...prev, buttonLink: e.target.value }))
                  }
                  placeholder="/all-products?category=Diwali%20Special"
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Footer Tagline
                </label>
                <input
                  type="text"
                  value={popupConfig.footerText}
                  onChange={(e) =>
                    setPopupConfig((prev) => ({ ...prev, footerText: e.target.value }))
                  }
                  placeholder="Pure & Authentic Ingredients"
                  className="w-full px-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Banner Image Customization */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Popup Banner Graphic / Image
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer border border-slate-200 transition">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Upload Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileChange}
                    className="hidden"
                  />
                </label>

                <input
                  type="url"
                  placeholder="Or enter image URL (https://...)"
                  value={diwaliInput}
                  onChange={(e) => {
                    setDiwaliInput(e.target.value);
                    setDiwaliPreview(e.target.value);
                    setPopupConfig((prev) => ({ ...prev, bannerUrl: e.target.value }));
                  }}
                  className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b]"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={diwaliSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 text-xs font-bold text-white bg-gradient-to-r from-[#e8703b] to-amber-500 hover:from-[#d65f29] hover:to-amber-600 rounded-xl shadow-md shadow-orange-500/20 transition cursor-pointer disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{diwaliSaving ? "Saving Settings..." : "Save Festive Popup Changes"}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Restore default festive text copy"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </form>

          {/* ── Right Column: Live Modal Card Preview (5 cols) ── */}
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-50/50 via-[#fffbf6] to-orange-50/50 rounded-2xl p-5 border border-amber-200/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-amber-900/80 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#e8703b]" />
                  Live Modal Card Preview
                </span>
                <span className="text-[10px] text-amber-700 font-medium">
                  Matches Store Design
                </span>
              </div>

              {/* Replica Modal Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden relative group">
                {/* Banner image preview */}
                <div className="relative w-full h-40 bg-slate-50 flex items-center justify-center overflow-hidden border-b border-amber-100">
                  {diwaliPreview || popupConfig.bannerUrl ? (
                    <>
                      <img
                        src={diwaliPreview || popupConfig.bannerUrl}
                        alt="Popup Banner"
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setDiwaliPreview("");
                          setDiwaliInput("");
                          setPopupConfig((prev) => ({ ...prev, bannerUrl: "" }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"
                        title="Remove banner"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-3 text-slate-400">
                      <ImageIcon className="w-7 h-7 mx-auto mb-1 opacity-50" />
                      <span className="text-[11px] font-medium">No banner image selected</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-2.5 bg-white">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#e8703b] border border-orange-200">
                    <Flame className="w-3 h-3 fill-[#e8703b] text-[#e8703b]" />
                    <span>{popupConfig.badge || "Special Celebration"}</span>
                  </div>

                  {/* Headline */}
                  <h4 className="text-sm font-black text-gray-900 leading-snug">
                    {popupConfig.headline || "Celebrate With Pure & Traditional Taste!"}
                  </h4>

                  {/* Description */}
                  <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-3">
                    {popupConfig.description ||
                      "Freshly stone-ground flours, authentic millet mixes, noodles & traditional favorites prepared with 100% natural ingredients for your festive cooking."}
                  </p>

                  {/* CTA Button */}
                  <div className="pt-2">
                    <div className="w-full py-2.5 px-3 rounded-xl bg-[#e8703b] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-orange-500/20">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{popupConfig.buttonText || "Shop Festive Offers"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>

                    {/* Footer note */}
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 px-0.5">
                      <span>{popupConfig.footerText || "Pure & Authentic Ingredients"}</span>
                      <span className="underline opacity-80">Maybe later</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-amber-800/70 text-center mt-3">
              ✨ Updates appear in real-time when visitors load the homepage.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          Analytics & Tracking Settings (Meta Pixel & Custom Head Tag)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Analytics & Tracking Integrations</h3>
            <p className="text-xs text-slate-500">Configure Meta Pixel, Google Analytics, and custom tracking tags</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meta Pixel */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Facebook / Meta Pixel ID
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your Pixel ID to automatically log PageView, AddToCart, and Purchase conversions.
            </p>

            <form onSubmit={handleSavePixel} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 123456789012345"
                  value={pixelInput}
                  onChange={(e) => setPixelInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b]"
                />
                <button
                  type="submit"
                  disabled={pixelSaving}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition cursor-pointer"
                >
                  {pixelSaving ? "Saving..." : "Save ID"}
                </button>
              </div>
            </form>
          </div>

          {/* Custom Head Scripts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Custom Head Script (GTM / Analytics)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Any custom raw HTML or JavaScript tracking tags injected into the website header.
            </p>

            <form onSubmit={handleSaveScript} className="space-y-2">
              <textarea
                rows={3}
                placeholder="<script>...</script>"
                value={scriptInput}
                onChange={(e) => setScriptInput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={scriptSaving}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition cursor-pointer"
                >
                  {scriptSaving ? "Saving..." : "Save Script"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
