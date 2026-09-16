import React, { useState, useEffect } from "react";
import {
  Wrench,
  Sparkles,
  Palette,
  Image as ImageIcon,
  Link as LinkIcon,
  Megaphone,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Eye,
  Sliders,
  Sun,
  Crown,
  Layout,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";

const CARD_PRESETS = [
  {
    id: "modern_glass",
    name: "Modern Glassmorphism",
    desc: "Sleek frosted glass borders, subtle shadows, and crisp orange badges.",
    badgeBg: "bg-orange-500/10 text-orange-600 border-orange-200",
    containerBg: "bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md",
  },
  {
    id: "festive_warm",
    name: "Festive Warm Gold",
    desc: "Rich festive gold borders, warm celebration glow, and traditional accenting.",
    badgeBg: "bg-amber-500/15 text-amber-800 border-amber-300",
    containerBg: "bg-gradient-to-b from-amber-50/60 to-orange-50/40 border-2 border-amber-300/80 shadow-md",
  },
  {
    id: "classic_minimal",
    name: "Classic Minimalist",
    desc: "Clean high-contrast borders, minimal padding, focused product typography.",
    badgeBg: "bg-slate-900 text-white",
    containerBg: "bg-white border border-slate-300 shadow-2xs hover:border-slate-800",
  },
  {
    id: "vibrant_gradient",
    name: "Vibrant Gradient",
    desc: "High energy gradient highlights, glowing hover effects, and modern buttons.",
    badgeBg: "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs",
    containerBg: "bg-white border border-orange-200/90 shadow-lg hover:shadow-orange-500/10",
  },
];

const THEME_PRESETS = [
  {
    id: "sowmiya_default",
    name: "Sowmiya Classic (Orange & Navy)",
    primary: "#e8703b",
    secondary: "#0f172a",
    badge: "bg-[#e8703b] text-white",
  },
  {
    id: "diwali_gold",
    name: "Diwali Lights (Warm Gold & Maroon)",
    primary: "#d97706",
    secondary: "#78350f",
    badge: "bg-amber-600 text-white",
  },
  {
    id: "pongal_harvest",
    name: "Pongal Harvest (Golden Sugar & Green)",
    primary: "#059669",
    secondary: "#065f46",
    badge: "bg-emerald-600 text-white",
  },
  {
    id: "midnight_dark",
    name: "Midnight Luxury (Deep Slate & Bronze)",
    primary: "#f59e0b",
    secondary: "#020617",
    badge: "bg-slate-900 text-amber-400",
  },
  {
    id: "emerald_fresh",
    name: "Organic Fresh (Forest Emerald & Lime)",
    primary: "#10b981",
    secondary: "#064e3b",
    badge: "bg-teal-600 text-white",
  },
];

const PRESET_FAVICONS = [
  { id: "diya", name: "Diya Lamp", url: "https://img.icons8.com/emoji/96/diya-lamp.png", icon: "🪔" },
  { id: "wheat", name: "Golden Grain", url: "https://img.icons8.com/emoji/96/sheaf-of-rice-emoji.png", icon: "🌾" },
  { id: "lotus", name: "Royal Lotus", url: "https://img.icons8.com/emoji/96/lotus-emoji.png", icon: "🪷" },
  { id: "spice", name: "Spices", url: "https://img.icons8.com/emoji/96/hot-pepper-emoji.png", icon: "🌶️" },
  { id: "leaf", name: "Fresh Leaf", url: "https://img.icons8.com/emoji/96/herb-emoji.png", icon: "🍃" },
  { id: "crown", name: "Crown Badge", url: "https://img.icons8.com/emoji/96/crown-emoji.png", icon: "👑" },
  { id: "sparkle", name: "Sparkle Star", url: "https://img.icons8.com/emoji/96/sparkles-emoji.png", icon: "⚡" },
  { id: "pot", name: "Traditional Pot", url: "https://img.icons8.com/emoji/96/shallow-pan-of-food-emoji.png", icon: "🍲" },
  { id: "bag", name: "Shopping Bag", url: "https://img.icons8.com/emoji/96/shopping-bags-emoji.png", icon: "🛍️" },
  { id: "gift", name: "Gift Box", url: "https://img.icons8.com/emoji/96/wrapped-gift-emoji.png", icon: "🎁" },
];

const PresetIconGallery = ({ onSelectIcon, selectedUrl, label }) => {
  return (
    <div className="pt-2 border-t border-slate-200/80 mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          ✨ Or Pick Preset {label || "Favicon / Icon"}
        </span>
        <span className="text-[10px] text-slate-400">1-Click Select</span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {PRESET_FAVICONS.map((item) => {
          const isSelected = selectedUrl === item.url;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectIcon(item.url)}
              title={`Use ${item.name}`}
              className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                isSelected
                  ? "bg-amber-100 border-[#e8703b] ring-2 ring-orange-400/30 scale-105 shadow-xs"
                  : "bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/50"
              }`}
            >
              <img src={item.url} alt={item.name} className="w-6 h-6 object-contain mb-1" />
              <span className="text-[9px] font-bold text-slate-700 truncate max-w-full">
                {item.name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ImageDropZone = ({
  label,
  fieldKey,
  value,
  onChangeUrl,
  onFileUpload,
  uploadingField,
  helpText,
  previewLabel,
  isFestiveCard = false,
  presetGalleryLabel = null,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onFileUpload({ target: { files: [file] } }, fieldKey);
      } else {
        toast.error("Please drop a valid image file (PNG, JPG, WEBP, SVG)");
      }
    }
  };

  return (
    <div
      className={`space-y-3 p-4 rounded-xl border ${
        isFestiveCard
          ? "border-amber-200 bg-amber-50/30"
          : "border-slate-200 bg-slate-50/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <label
          className={`text-xs font-bold ${
            isFestiveCard ? "text-amber-900" : "text-slate-800"
          }`}
        >
          {label}
        </label>
        {uploadingField === fieldKey && (
          <span className="text-[11px] font-bold text-[#e8703b] animate-pulse">
            Uploading image...
          </span>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer relative ${
          isDragging
            ? "border-[#e8703b] bg-amber-100/90 scale-[1.01]"
            : isFestiveCard
            ? "border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50/50"
            : "border-slate-300 hover:border-[#e8703b] bg-white hover:bg-slate-50"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFileUpload(e, fieldKey)}
          disabled={uploadingField === fieldKey}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center space-y-1 select-none">
          <Upload
            className={`w-5 h-5 ${
              isDragging ? "text-[#e8703b] animate-bounce" : "text-slate-400"
            }`}
          />
          <p className="text-xs font-bold text-slate-700">
            {isDragging
              ? "Drop image file here to upload"
              : "Drag & Drop local image here, or click to browse"}
          </p>
          <p className="text-[10px] text-slate-400">
            Supports PNG, JPG, WEBP, SVG (Auto Cloudinary Sync)
          </p>
        </div>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChangeUrl(e.target.value)}
        placeholder="Or paste direct image URL (https://...)"
        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b]"
      />
      {helpText && <p className="text-[11px] text-slate-400">{helpText}</p>}

      {value && (
        <div className="p-3 bg-white border rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={value}
              alt="Preview"
              className="h-10 w-10 object-contain rounded-lg border p-1"
            />
            <span className="text-[11px] font-semibold text-slate-600">
              {previewLabel || "Live Image Preview"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChangeUrl("")}
            className="text-rose-500 hover:text-rose-700 text-[11px] font-bold px-2 py-1 bg-rose-50 rounded-lg hover:bg-rose-100 transition"
          >
            Clear
          </button>
        </div>
      )}

      {/* Preset Gallery if applicable */}
      {presetGalleryLabel && (
        <PresetIconGallery
          label={presetGalleryLabel}
          selectedUrl={value}
          onSelectIcon={(url) => onChangeUrl(url)}
        />
      )}
    </div>
  );
};

const AdminDeveloperMode = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("branding");

  // User role validation
  const storedUserStr = localStorage.getItem("user");
  const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
  const userRole = storedUser?.role || (storedUser?.isAdmin ? "admin" : "");
  const isAuthorized =
    storedUser?.isAdmin ||
    storedUser?.isPrimaryAdmin ||
    userRole === "admin" ||
    userRole === "manager";

  const [uploadingField, setUploadingField] = useState(null);

  // Developer settings state
  const [settings, setSettings] = useState({
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
  });

  // Calculate live festival schedule status
  const getScheduleStatus = () => {
    if (!settings.isAutoFestivalSchedule) {
      return { status: "OFF", label: "Auto-Schedule Off", badgeClass: "bg-slate-100 text-slate-600 border-slate-200" };
    }
    if (!settings.festivalStartDate || !settings.festivalEndDate) {
      return { status: "INCOMPLETE", label: "Select Start & End Dates", badgeClass: "bg-amber-100 text-amber-700 border-amber-300" };
    }

    const now = new Date().getTime();
    const start = new Date(settings.festivalStartDate).getTime();
    const end = new Date(settings.festivalEndDate).getTime();

    if (now >= start && now <= end) {
      return { status: "ACTIVE", label: "🟢 Festival Logo Active Now", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold animate-pulse" };
    }
    if (now < start) {
      return { status: "SCHEDULED", label: `⏳ Scheduled (${new Date(settings.festivalStartDate).toLocaleDateString()})`, badgeClass: "bg-blue-100 text-blue-800 border-blue-300 font-bold" };
    }
    return { status: "EXPIRED", label: "🔴 Festival Ended (Reverted to Normal Logo)", badgeClass: "bg-slate-900 text-white font-bold" };
  };

  // Upload local file to Cloudinary
  const handleFileUpload = async (event, settingField) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    setUploadingField(settingField);
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.post(
          "/settings/upload-image",
          { image: reader.result },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.success && res.data.url) {
          setSettings((prev) => ({ ...prev, [settingField]: res.data.url }));
          toast.success("Local file uploaded successfully!");
        } else {
          toast.error("Failed to upload image");
        }
      } catch (err) {
        console.error("Upload Error:", err);
        toast.error("Error uploading local image file");
      } finally {
        setUploadingField(null);
      }
    };

    reader.readAsDataURL(file);
  };

  // Load current developer settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/settings/developer-settings");
      if (res.data?.success && res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error("Failed to load developer settings:", err);
      toast.error("Failed to fetch developer mode settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save developer settings
  const handleSaveSettings = async () => {
    if (!isAuthorized) {
      toast.error("Access denied. Only Main Admin and Operations Manager can save developer settings.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.put("/settings/developer-settings", settings, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        toast.success("Developer Mode & Dynamic Site Settings Saved!");
        window.dispatchEvent(new CustomEvent("developerSettingsUpdated"));
      } else {
        toast.error(res.data?.message || "Failed to save settings");
      }
    } catch (err) {
      console.error("Save Error:", err);
      toast.error(err.response?.data?.message || "Error saving developer settings");
    } finally {
      setSaving(false);
    }
  };

  // Nav link helpers
  const handleAddNavLink = () => {
    setSettings((prev) => ({
      ...prev,
      customNavLinks: [
        ...prev.customNavLinks,
        {
          id: Date.now().toString(),
          name: "Festive Offers",
          path: "/products?category=Offers",
          isExternal: false,
          isBadge: true,
          badgeText: "HOT",
        },
      ],
    }));
  };

  const handleRemoveNavLink = (index) => {
    setSettings((prev) => ({
      ...prev,
      customNavLinks: prev.customNavLinks.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateNavLink = (index, field, value) => {
    setSettings((prev) => {
      const updated = [...prev.customNavLinks];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, customNavLinks: updated };
    });
  };

  if (!isAuthorized) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 max-w-xl mx-auto mt-10">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-slate-900">Developer Mode Access Restricted</h3>
        <p className="text-xs text-slate-600">
          This section is exclusively reserved for the <strong>Main Admin (Owner)</strong> and <strong>Operations Manager</strong> roles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#0f172a] p-6 rounded-2xl text-white border border-slate-700 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#e8703b] text-white rounded-xl shadow-md shadow-orange-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Developer Mode & Site Customizer
            </h2>
            <span className="px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full">
              DEV ACCESS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Dynamic site branding, festival themes, card presets, custom navbar links & running banner management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition cursor-pointer"
            title="Refresh Settings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#e8703b]" : ""}`} />
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] shadow-lg shadow-orange-500/30 transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving Changes..." : "Publish Dynamic Settings"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        {[
          { id: "branding", label: "Logo & Festival Branding", icon: ImageIcon },
          { id: "cards", label: "Product Card Presets", icon: Layout },
          { id: "theme", label: "Color & Festival Themes", icon: Palette },
          { id: "navbar", label: "Custom Navbar Links", icon: LinkIcon },
          { id: "banner", label: "Running Ad Ticker", icon: Megaphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "bg-[#e8703b] text-white shadow-md shadow-orange-500/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: LOGO & FESTIVAL BRANDING ─────────────────────────────────── */}
      {activeTab === "branding" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#e8703b]" />
                Site Branding & Festival Overlays
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload local logo files or paste URLs, and configure automatic festival schedule dates
              </p>
            </div>

            {/* Manual Festival Mode Toggle */}
            <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <div>
                <div className="text-xs font-extrabold text-amber-900">Manual Festival Mode</div>
                <div className="text-[10px] text-amber-700">Force festival logo & icon ON site-wide</div>
              </div>
              <input
                type="checkbox"
                checked={settings.isFestivalMode}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, isFestivalMode: e.target.checked }))
                }
                className="w-5 h-5 text-[#e8703b] rounded focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* 📅 AUTOMATED FESTIVAL SCHEDULE CALENDAR SECTION */}
          <div className="p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-2xl border border-amber-300/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                  <Sun className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-amber-950">
                    Automated Festival Logo Schedule (Calendar & Time Picker)
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    Automatically switches to festival logo during start/end period, then auto-reverts to normal logo!
                  </p>
                </div>
              </div>

              {/* Schedule Status Badge */}
              {(() => {
                const sched = getScheduleStatus();
                return (
                  <span className={`px-3 py-1 rounded-xl text-xs border ${sched.badgeClass}`}>
                    {sched.label}
                  </span>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Enable Auto Schedule Toggle */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                <input
                  type="checkbox"
                  id="auto-sched"
                  checked={settings.isAutoFestivalSchedule || false}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, isAutoFestivalSchedule: e.target.checked }))
                  }
                  className="w-5 h-5 text-[#e8703b] rounded cursor-pointer"
                />
                <label htmlFor="auto-sched" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Enable Calendar Auto-Schedule
                </label>
              </div>

              {/* Start Date & Time */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-900">Festival Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={settings.festivalStartDate || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, festivalStartDate: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* End Date & Time */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-900">Festival End Date & Time</label>
                <input
                  type="datetime-local"
                  value={settings.festivalEndDate || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, festivalEndDate: e.target.value }))
                  }
                  className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Main Logo */}
            <ImageDropZone
              label="Main Site Logo Image"
              fieldKey="siteLogo"
              value={settings.siteLogo}
              onChangeUrl={(url) => setSettings((prev) => ({ ...prev, siteLogo: url }))}
              onFileUpload={handleFileUpload}
              uploadingField={uploadingField}
              helpText="Replaces standard Sowmiya Foods logo in header"
              previewLabel="Live Main Logo Preview"
            />

            {/* Navbar Small Icon */}
            <ImageDropZone
              label="Small Navbar Icon / Favicon"
              fieldKey="navIcon"
              value={settings.navIcon}
              onChangeUrl={(url) => setSettings((prev) => ({ ...prev, navIcon: url }))}
              onFileUpload={handleFileUpload}
              uploadingField={uploadingField}
              helpText="Small icon displayed next to search bar or mobile header badge"
              previewLabel="Live Small Navbar Icon Preview"
              presetGalleryLabel="Navbar Icon / Favicon"
            />

            {/* Festival Logo Overlay */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-amber-100/60 p-2.5 rounded-xl border border-amber-200">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  Festival Overlay Title Name:
                </span>
                <input
                  type="text"
                  value={settings.festivalName}
                  onChange={(e) => setSettings((prev) => ({ ...prev, festivalName: e.target.value }))}
                  placeholder="Festival Name (e.g. Diwali)"
                  className="px-3 py-1 text-xs bg-white border border-amber-300 rounded-lg font-bold text-amber-900 w-44"
                />
              </div>

              <ImageDropZone
                label="Festival Overlay Logo"
                fieldKey="festivalLogo"
                value={settings.festivalLogo}
                onChangeUrl={(url) => setSettings((prev) => ({ ...prev, festivalLogo: url }))}
                onFileUpload={handleFileUpload}
                uploadingField={uploadingField}
                helpText="Overlay logo displayed when Festival Mode or Schedule is active"
                previewLabel="Live Festival Overlay Logo Preview"
                isFestiveCard={true}
              />
            </div>

            {/* Festival Small Icon */}
            <ImageDropZone
              label="Festival Small Icon (Diya / Pot / Badge)"
              fieldKey="festivalIcon"
              value={settings.festivalIcon}
              onChangeUrl={(url) => setSettings((prev) => ({ ...prev, festivalIcon: url }))}
              onFileUpload={handleFileUpload}
              uploadingField={uploadingField}
              helpText="Animated small festive badge displayed beside logo during festive period"
              previewLabel="Live Small Festive Badge Preview"
              isFestiveCard={true}
              presetGalleryLabel="Festive Badge / Diya Icon"
            />
          </div>
        </div>
      )}

      {/* ─── TAB 2: PRODUCT CARD PRESETS ─────────────────────────────────────── */}
      {activeTab === "cards" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layout className="w-4 h-4 text-[#e8703b]" />
              Product Card Design Customizer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a preset design for all product cards displayed across the store catalog
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CARD_PRESETS.map((preset) => {
              const isSelected = settings.cardPreset === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSettings((prev) => ({ ...prev, cardPreset: preset.id }))}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "border-[#e8703b] bg-orange-50/20 ring-2 ring-orange-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#e8703b]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{preset.desc}</p>
                  </div>

                  {/* Sample Card Badge */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${preset.badgeBg}`}>
                      SAMPLE BADGE
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Sample Card Preview */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#e8703b]" />
              Live Preview of Selected Product Card Preset
            </h4>

            <div className="max-w-xs mx-auto">
              {CARD_PRESETS.filter((p) => p.id === settings.cardPreset).map((preset) => (
                <div key={preset.id} className={`rounded-2xl p-4 transition-all duration-300 ${preset.containerBg}`}>
                  <div className="relative aspect-4/3 bg-slate-100 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-400">PRODUCT IMAGE</span>
                    <span className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded border ${preset.badgeBg}`}>
                      100% PURE
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900">Sowmiya Flour Special</h5>
                  <p className="text-xs text-slate-500 mt-0.5">Stone-ground millet flour mix 1kg</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-base font-black text-[#e8703b]">₹149</span>
                    <button className="px-3 py-1.5 text-xs font-bold text-white bg-[#e8703b] rounded-xl hover:bg-[#d65f29]">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: THEMES & COLOR SYSTEM ──────────────────────────────────── */}
      {activeTab === "theme" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#e8703b]" />
              Site Color System & Festival Theme Presets
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch entire website color palette according to seasons, festivals, or brand campaigns
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {THEME_PRESETS.map((t) => {
              const isSelected = settings.activeTheme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      activeTheme: t.id,
                      customPrimaryColor: t.primary,
                    }))
                  }
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-[#e8703b] bg-orange-50/20 ring-2 ring-orange-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-900">{t.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full border shadow-2xs" style={{ backgroundColor: t.primary }} />
                      <span className="w-5 h-5 rounded-full border shadow-2xs" style={{ backgroundColor: t.secondary }} />
                    </div>
                  </div>

                  {isSelected && <CheckCircle2 className="w-5 h-5 text-[#e8703b]" />}
                </div>
              );
            })}
          </div>

          {/* Custom Primary Color Picker */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">Custom Brand Accent Color</div>
              <div className="text-[11px] text-slate-500">Fine-tune the primary highlight hex color code</div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.customPrimaryColor || "#e8703b"}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, customPrimaryColor: e.target.value }))
                }
                className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono font-bold text-slate-700">
                {settings.customPrimaryColor || "#e8703b"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: CUSTOM NAVBAR LINKS ─────────────────────────────────────── */}
      {activeTab === "navbar" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#e8703b]" />
                Dynamic Navbar Links Manager
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add custom navigation buttons, external campaign links, or promotional tags to the main site menu
              </p>
            </div>

            <button
              onClick={handleAddNavLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#e8703b] hover:bg-[#d65f29] rounded-xl shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Link</span>
            </button>
          </div>

          {settings.customNavLinks.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
              <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
              <p className="text-xs font-semibold">No custom navbar links added yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Custom Link" to append promotional links.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settings.customNavLinks.map((link, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Link Name</label>
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => handleUpdateNavLink(idx, "name", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Link Path / URL</label>
                      <input
                        type="text"
                        value={link.path}
                        onChange={(e) => handleUpdateNavLink(idx, "path", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Badge Text (Optional)</label>
                      <input
                        type="text"
                        value={link.badgeText || ""}
                        onChange={(e) => handleUpdateNavLink(idx, "badgeText", e.target.value)}
                        placeholder="e.g. HOT, NEW, 20% OFF"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveNavLink(idx)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition self-end sm:self-center"
                    title="Remove Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 5: RUNNING ADVERTISING TICKER ───────────────────────────────── */}
      {activeTab === "banner" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#e8703b]" />
                Running Advertising Ticker Banner
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Top announcement ticker displayed above the website navbar with smooth animated scrolling text
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Enable Running Banner</span>
              <input
                type="checkbox"
                checked={settings.advertisingBanner?.enabled ?? true}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    advertisingBanner: {
                      ...prev.advertisingBanner,
                      enabled: e.target.checked,
                    },
                  }))
                }
                className="w-5 h-5 text-[#e8703b] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800">Announcement / Offer Ticker Text</label>
              <textarea
                rows={2}
                value={settings.advertisingBanner?.text || ""}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    advertisingBanner: {
                      ...prev.advertisingBanner,
                      text: e.target.value,
                    },
                  }))
                }
                placeholder="Enter running announcement text..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8703b] mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800">Target Link Path</label>
                <input
                  type="text"
                  value={settings.advertisingBanner?.link || "/products"}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      advertisingBanner: {
                        ...prev.advertisingBanner,
                        link: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800">Background Color / Gradient CSS</label>
                <input
                  type="text"
                  value={settings.advertisingBanner?.bg || "linear-gradient(90deg, #e8703b 0%, #d65f29 100%)"}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      advertisingBanner: {
                        ...prev.advertisingBanner,
                        bg: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl mt-1"
                />
              </div>
            </div>

            {/* Live Ticker Preview */}
            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Live Banner Ticker Preview</span>
              <div
                style={{ background: settings.advertisingBanner?.bg || "#e8703b" }}
                className="py-2.5 px-4 rounded-xl text-white text-xs font-bold overflow-hidden whitespace-nowrap shadow-sm"
              >
                <div className="animate-marquee inline-block">
                  {settings.advertisingBanner?.text || "Announcement Text Preview"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeveloperMode;
