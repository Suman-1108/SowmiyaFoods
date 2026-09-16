import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Flame,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDiwaliPopupConfig } from "../../api/settingApi";
import axiosInstance from "../../api/axiosInstance";
import logo from "../../assets/logo.png";

/**
 * 6 Rich Festival Color Palettes for Diverse Multi-Color Flower Big Bangs
 */
const FLOWER_PALETTES = {
  rainbow: [
    "#FF1744", "#FF9100", "#FFEA00", "#00E676",
    "#00E5FF", "#2979FF", "#D500F9", "#FF4081",
    "#FF6D00", "#76FF03", "#FFD700", "#F50057",
    "#00B0FF", "#FF3D00", "#C51162", "#AEEA00",
  ],
  carnival: [
    "#FF007F", "#00F0FF", "#FFE600", "#FF5400",
    "#7000FF", "#00FF66", "#FF0055", "#00B4D8",
    "#FFBE0B", "#FB5607", "#FF006E", "#8338EC",
    "#3A86FF", "#38B000", "#FF70A6", "#FFD166",
  ],
  rose_gold: [
    "#FF1493", "#FFD700", "#FF4081", "#FFA000",
    "#FF69B4", "#FFC107", "#E91E63", "#FFE082",
    "#F06292", "#FFD54F", "#C2185B", "#FFECB3",
    "#FF80AB", "#FFB300", "#D81B60", "#FFF8E1",
  ],
  emerald_sapphire: [
    "#00E676", "#00E5FF", "#00C853", "#2979FF",
    "#69F0AE", "#00B0FF", "#1DE9B6", "#448AFF",
    "#00E676", "#00B4D8", "#76FF03", "#48CAE4",
    "#05D550", "#0077B6", "#B9F6CA", "#90E0EF",
  ],
  saffron_marigold: [
    "#FF6D00", "#FFD700", "#E8703B", "#FFEA00",
    "#FF3D00", "#FFC400", "#F4511E", "#FFB300",
    "#FF9100", "#FFEE58", "#DD2C00", "#FFF176",
    "#FFAB00", "#FF9E80", "#E65100", "#FFE57F",
  ],
  purple_cyan: [
    "#D500F9", "#00E5FF", "#AA00FF", "#18FFFF",
    "#E040FB", "#00B0FF", "#7C4DFF", "#80D8FF",
    "#651FFF", "#84FFFF", "#9C27B0", "#00E5FF",
    "#BA68C8", "#B388FF", "#8E24AA", "#E1BEE7",
  ],
};

const THEME_GLOWS = {
  rainbow: { glow: "rgba(255, 215, 0, 0.95)", ring: "#FFEA00" },
  carnival: { glow: "rgba(255, 0, 127, 0.95)", ring: "#00F0FF" },
  rose_gold: { glow: "rgba(255, 20, 147, 0.95)", ring: "#FFD700" },
  emerald_sapphire: { glow: "rgba(0, 230, 118, 0.95)", ring: "#00E5FF" },
  saffron_marigold: { glow: "rgba(232, 112, 59, 0.95)", ring: "#FFD700" },
  purple_cyan: { glow: "rgba(213, 0, 249, 0.95)", ring: "#00E5FF" },
};

/**
 * FlowerSkyShot
 * Launches in a fluid, continuous aerodynamic arc
 * and explodes into a DELICATE, COMPACT FLOWER BLAST (small/mini size) at apex!
 */
const FlowerSkyShot = ({
  left = "20%",
  delay = 0,
  angle = 20, // launch tilt in degrees
  targetX = 140, // horizontal drift distance during flight (px)
  targetY = "-76vh", // apex height (middle or top of screen)
  theme = "rainbow", // "rainbow" | "carnival" | "rose_gold" | "emerald_sapphire" | "saffron_marigold" | "purple_cyan"
  size = "small", // "mini" | "small" | "medium"
}) => {
  const palette = FLOWER_PALETTES[theme] || FLOWER_PALETTES.rainbow;
  const themeMeta = THEME_GLOWS[theme] || THEME_GLOWS.rainbow;
  const glowColor = themeMeta.glow;

  const sizeConfig = {
    mini: {
      container: "w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px]",
      flash: "w-8 h-8",
      outerRing: "w-14 h-14",
      innerRing: "w-9 h-9",
      head: "w-2 h-2",
      flame: "w-1 h-5",
      tail: "w-0.5 h-7",
      pollenDist: "-38px",
      pistil: "w-3 h-3",
    },
    small: {
      container: "w-[140px] h-[140px] sm:w-[165px] sm:h-[165px] md:w-[190px] md:h-[190px]",
      flash: "w-10 h-10",
      outerRing: "w-18 h-18",
      innerRing: "w-11 h-11",
      head: "w-2 h-2",
      flame: "w-1 h-6",
      tail: "w-0.5 h-8",
      pollenDist: "-48px",
      pistil: "w-3.5 h-3.5",
    },
    medium: {
      container: "w-[160px] h-[160px] sm:w-[190px] sm:h-[190px] md:w-[220px] md:h-[220px]",
      flash: "w-12 h-12",
      outerRing: "w-22 h-22",
      innerRing: "w-13 h-13",
      head: "w-2.5 h-2.5",
      flame: "w-1.5 h-7",
      tail: "w-1 h-10",
      pollenDist: "-58px",
      pistil: "w-4 h-4",
    },
  }[size] || {
    container: "w-[140px] h-[140px] sm:w-[165px] sm:h-[165px] md:w-[190px] md:h-[190px]",
    flash: "w-10 h-10",
    outerRing: "w-18 h-18",
    innerRing: "w-11 h-11",
    head: "w-2 h-2",
    flame: "w-1 h-6",
    tail: "w-0.5 h-8",
    pollenDist: "-48px",
    pistil: "w-3.5 h-3.5",
  };

  return (
    <div
      className="absolute bottom-0 pointer-events-none z-20"
      style={{
        left,
        "--angle": `${angle}deg`,
        "--target-x": `${targetX}px`,
        "--target-y": targetY,
        "--pollen-dist": sizeConfig.pollenDist,
      }}
    >
      {/* 🚀 1. Fluid, Continuous Aerodynamic Rocket Flight */}
      <div
        className="relative flex flex-col items-center animate-flower-rocket"
        style={{ animationDelay: `${delay}s` }}
      >
        {/* Glowing Head */}
        <div className={`${sizeConfig.head} rounded-full bg-white shadow-[0_0_18px_#fff,0_0_28px_#ffb703]`} />
        {/* Core Sizzling Flame */}
        <div className={`${sizeConfig.flame} bg-gradient-to-t from-transparent via-amber-400 to-white rounded-full shadow-[0_0_14px_#ff9100]`} />
        {/* Trailing angled sparks */}
        <div className={`${sizeConfig.tail} bg-gradient-to-t from-transparent via-orange-500/90 to-amber-300 blur-[0.5px]`} />
      </div>

      {/* 🌸 2. BIG BANG Flower Blast Detonating Exactly at Apex */}
      <div
        className={`absolute top-0 left-0 ${sizeConfig.container} flex items-center justify-center animate-flower-bloom-container`}
        style={{ animationDelay: `${delay}s` }}
      >
        {/* Big Flash Center */}
        <div
          className={`absolute ${sizeConfig.flash} rounded-full bg-white/95 blur-xl animate-flower-flash`}
          style={{ animationDelay: `${delay}s` }}
        />

        {/* Dual Expanding Shockwave Rings */}
        <div
          className={`absolute ${sizeConfig.outerRing} rounded-full border-2 animate-flower-ring-outer`}
          style={{
            borderColor: themeMeta.ring,
            animationDelay: `${delay}s`,
          }}
        />
        <div
          className={`absolute ${sizeConfig.innerRing} rounded-full border-2 border-white animate-flower-ring-inner`}
          style={{ animationDelay: `${delay}s` }}
        />

        {/* 🌺 Layer 1: Outer Big Bang Flower Petals (16 Petals in Vivid Colors) */}
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full absolute inset-0 animate-flower-petals-outer"
          style={{
            filter: `drop-shadow(0 0 14px ${glowColor})`,
            animationDelay: `${delay}s`,
          }}
        >
          {palette.map((color, i) => {
            const rot = (i * 360) / 16;
            return (
              <g key={`outer-${i}`} transform={`rotate(${rot} 120 120)`}>
                {/* Pointed Flower Petal */}
                <path
                  d="M120 120 C 108 85, 102 38, 120 12 C 138 38, 132 85, 120 120 Z"
                  fill={color}
                  opacity="0.95"
                />
                {/* Radiant star sparkle tip */}
                <circle cx="120" cy="12" r="3.2" fill="#FFFFFF" />
              </g>
            );
          })}
        </svg>

        {/* 🌼 Layer 2: Middle Blooming Petals (12 Petals) */}
        <svg
          viewBox="0 0 240 240"
          className="w-[82%] h-[82%] absolute animate-flower-petals-middle"
          style={{
            filter: `drop-shadow(0 0 10px ${glowColor})`,
            animationDelay: `${delay}s`,
          }}
        >
          {[...Array(12)].map((_, i) => {
            const rot = (i * 360) / 12 + 15;
            const midColor = palette[(i + 4) % palette.length];
            return (
              <g key={`mid-${i}`} transform={`rotate(${rot} 120 120)`}>
                <path
                  d="M120 120 C 110 90, 106 50, 120 28 C 134 50, 130 90, 120 120 Z"
                  fill={midColor}
                  opacity="0.9"
                />
                <circle cx="120" cy="28" r="2.8" fill="#FFFFFF" />
              </g>
            );
          })}
        </svg>

        {/* 🌸 Layer 3: Inner Golden Petals (8 Petals) */}
        <svg
          viewBox="0 0 240 240"
          className="w-[60%] h-[60%] absolute animate-flower-petals-inner"
          style={{
            filter: "drop-shadow(0 0 8px #FFD700)",
            animationDelay: `${delay}s`,
          }}
        >
          {[...Array(8)].map((_, i) => {
            const rot = (i * 360) / 8 + 22.5;
            const innerColor = palette[(i + 8) % palette.length];
            return (
              <g key={`inner-${i}`} transform={`rotate(${rot} 120 120)`}>
                <path
                  d="M120 120 C 113 96, 110 68, 120 46 C 130 68, 127 96, 120 120 Z"
                  fill={innerColor}
                  opacity="0.95"
                />
                <circle cx="120" cy="46" r="2.4" fill="#FFFFFF" />
              </g>
            );
          })}
        </svg>

        {/* ✨ Layer 4: Radiating Sparkling Pollen & Drifting Embers (24 Sparks) */}
        {[...Array(24)].map((_, i) => {
          const pAngle = (i * 360) / 24;
          const pColor = palette[i % palette.length];
          return (
            <div
              key={`pollen-${i}`}
              className="absolute w-2 h-2 rounded-full opacity-0 animate-flower-pollen-drift"
              style={{
                backgroundColor: pColor,
                boxShadow: `0 0 10px ${pColor}`,
                transform: `rotate(${pAngle}deg) translateY(${sizeConfig.pollenDist})`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}

        {/* 🌟 Radiant Core Pistil */}
        <div
          className={`absolute ${sizeConfig.pistil} rounded-full bg-white shadow-[0_0_22px_#fff,0_0_38px_#ffd700] animate-flower-core`}
          style={{ animationDelay: `${delay}s` }}
        />
      </div>
    </div>
  );
};

/**
 * DiwaliPopup / Festival Popup
 * - Triggers seamlessly after SplashScreen finishes.
 * - Features angled rockets flying with realistic trajectories and bursting into BIG BANG FLOWER BLASTS!
 * - Displays in varied festive colors (Golden Chrysanthemum, Rose, Emerald, Marigold, Rainbow).
 * - Styled in clean Sowmiya Foods brand colors with adaptive card side and image aspect ratio.
 */
const DiwaliPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flowerAnimationKey, setFlowerAnimationKey] = useState(0);
  const [bannerUrl, setBannerUrl] = useState("");
  const [imageRatio, setImageRatio] = useState("auto");
  const [popupData, setPopupData] = useState({
    headline: "Celebrate With Pure & Traditional Taste!",
    description:
      "Freshly stone-ground flours, authentic millet mixes, noodles & traditional favorites prepared with 100% natural ingredients for your festive cooking.",
    badge: "Special Celebration",
    buttonText: "Shop Festive Offers",
    buttonLink: "/all-products?category=Diwali%20Special",
    footerText: "Pure & Authentic Ingredients",
    isEnabled: true,
  });

  const navigate = useNavigate();

  const getDirectImageUrl = (url) => {
    if (!url) return url;
    if (url.startsWith("/")) {
      return `${axiosInstance.defaults.baseURL}${url}`;
    }
    if (url.includes("ibb.co/")) {
      const match = url.match(/ibb\.co\/([a-zA-Z0-9]+)$/);
      if (match) {
        return `https://i.ibb.co/${match[1]}/1.png`;
      }
    }
    return url;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceShow =
      params.get("festival") === "true" ||
      params.get("diwali") === "true" ||
      params.get("popup") === "true";

    const hasSeenPopup = sessionStorage.getItem("diwaliPopupShown");

    if (hasSeenPopup && !forceShow) return;

    const hasSeenSplash = sessionStorage.getItem("sowmiya_splash_seen");

    const launchPopup = () => {
      setTimeout(() => {
        setFlowerAnimationKey((currentKey) => currentKey + 1);
        setIsOpen(true);
        setIsAnimating(true);
        if (!forceShow) {
          sessionStorage.setItem("diwaliPopupShown", "true");
        }
      }, 400);
    };

    if (hasSeenSplash || forceShow) {
      const timer = setTimeout(launchPopup, 500);
      return () => clearTimeout(timer);
    } else {
      const handleSplashDone = () => {
        launchPopup();
      };
      window.addEventListener("sowmiya_splash_finished", handleSplashDone);
      return () =>
        window.removeEventListener("sowmiya_splash_finished", handleSplashDone);
    }
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getDiwaliPopupConfig();
        if (config) {
          const params = new URLSearchParams(window.location.search);
          const forceShow =
            params.get("festival") === "true" ||
            params.get("diwali") === "true" ||
            params.get("popup") === "true";

          // If popup is disabled by admin and not forced by URL param, close immediately
          if (config.isEnabled === false && !forceShow) {
            setIsOpen(false);
            setIsAnimating(false);
          }

          setPopupData({
            headline: config.headline || "Celebrate With Pure & Traditional Taste!",
            description:
              config.description ||
              "Freshly stone-ground flours, authentic millet mixes, noodles & traditional favorites prepared with 100% natural ingredients for your festive cooking.",
            badge: config.badge || "Special Celebration",
            buttonText: config.buttonText || "Shop Festive Offers",
            buttonLink: config.buttonLink || "/all-products?category=Diwali%20Special",
            footerText: config.footerText || "Pure & Authentic Ingredients",
            isEnabled: config.isEnabled !== undefined ? Boolean(config.isEnabled) : true,
          });

          if (config.bannerUrl) {
            const processedUrl = getDirectImageUrl(config.bannerUrl);
            setBannerUrl(processedUrl || config.bannerUrl || "");
          }
        }
      } catch (err) {
        console.warn("Failed to fetch Diwali popup config:", err);
      }
    };
    fetchConfig();
  }, []);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      const ratio = naturalWidth / naturalHeight;
      if (ratio > 1.35) {
        setImageRatio("wide");
      } else if (ratio < 0.85) {
        setImageRatio("portrait");
      } else {
        setImageRatio("square");
      }
    }
  };

  const closePopup = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  const handleShopNow = () => {
    closePopup();
    navigate(popupData.buttonLink || "/all-products?category=Diwali%20Special");
  };

  if (!isOpen) return null;

  const isSplitSide = imageRatio === "portrait" || imageRatio === "square";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 overflow-hidden">
      {/* 🎆 MULTI-ALTITUDE COMPACT ANGLED ROCKETS (MINI & SMALL FLOWER BLASTS) 🎆 */}
      <div
        key={flowerAnimationKey}
        className="absolute inset-0 pointer-events-none overflow-hidden z-20"
      >
        {/* Rocket 1: Left Middle -> Shoots straight then turns +24° -> MINI delicate rainbow blossom */}
        <FlowerSkyShot
          left="8%"
          delay={0.1}
          angle={24}
          targetX={120}
          targetY="-44vh"
          theme="rainbow"
          size="mini"
        />

        {/* Rocket 2: Right Top -> Shoots straight then turns -28° -> SMALL rose gold flower */}
        <FlowerSkyShot
          left="92%"
          delay={0.8}
          angle={-28}
          targetX={-160}
          targetY="-76vh"
          theme="rose_gold"
          size="small"
        />

        {/* Rocket 3: Right Middle -> Shoots straight then turns -20° -> MINI emerald sapphire bloom */}
        <FlowerSkyShot
          left="82%"
          delay={1.5}
          angle={-20}
          targetX={-110}
          targetY="-46vh"
          theme="emerald_sapphire"
          size="mini"
        />

        {/* Rocket 4: Left Top -> Shoots straight then turns +22° -> SMALL saffron marigold bloom */}
        <FlowerSkyShot
          left="16%"
          delay={2.2}
          angle={22}
          targetX={140}
          targetY="-78vh"
          theme="saffron_marigold"
          size="small"
        />

        {/* Rocket 5: Center-Left Middle -> Shoots straight then turns -16° -> MINI carnival spark bloom */}
        <FlowerSkyShot
          left="28%"
          delay={2.9}
          angle={-16}
          targetX={-70}
          targetY="-48vh"
          theme="carnival"
          size="mini"
        />

        {/* Rocket 6: Center-Right Top -> Shoots straight then turns +18° -> SMALL amethyst cyan flower */}
        <FlowerSkyShot
          left="72%"
          delay={3.6}
          angle={18}
          targetX={95}
          targetY="-74vh"
          theme="purple_cyan"
          size="small"
        />

        {/* Rocket 7: Center Upper-Mid -> Shoots straight then tilts -10° -> MINI rainbow finale bloom */}
        <FlowerSkyShot
          left="50%"
          delay={4.3}
          angle={-10}
          targetX={-55}
          targetY="-62vh"
          theme="rainbow"
          size="mini"
        />
      </div>

      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={closePopup}
      />

      {/* Main Popup Modal Card */}
      <div
        className={`relative w-full transition-all duration-500 z-30 ${
          isSplitSide ? "max-w-xl md:max-w-2xl" : "max-w-lg md:max-w-2xl"
        } ${
          isAnimating
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-8"
        }`}
      >
        {/* Glowing Warm Halo around Card */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400/40 via-[#e8703b]/40 to-yellow-400/40 rounded-3xl blur-lg opacity-80 animate-pulse pointer-events-none" />

        {/* Card Body in Sowmiya Foods Site Theme */}
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-amber-200/90 flex flex-col">
          {/* Close Button */}
          <button
            onClick={closePopup}
            className="absolute top-3.5 right-3.5 z-30 w-8 h-8 sm:w-9 sm:h-9 bg-white/95 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full flex items-center justify-center backdrop-blur-md border border-gray-200/90 transition-all cursor-pointer shadow-sm hover:scale-105"
            title="Close popup"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ═══════════ IF BANNER IMAGE IS PRESENT ═══════════ */}
          {bannerUrl ? (
            <div
              className={`w-full flex flex-col ${
                isSplitSide ? "md:flex-row items-stretch" : ""
              }`}
            >
              {/* Image Container (Adjusts to Card Side / Ratio with Zero Cropping) */}
              <div
                className={`relative flex items-center justify-center bg-[#fdf9f4] overflow-hidden ${
                  isSplitSide
                    ? "w-full md:w-1/2 p-3 sm:p-4 min-h-[260px] md:min-h-[340px]"
                    : "w-full p-3 sm:p-4 max-h-[50vh] sm:max-h-[55vh]"
                }`}
              >
                <img
                  src={bannerUrl}
                  alt="Festival Banner"
                  onLoad={handleImageLoad}
                  className="max-w-full h-auto max-h-[48vh] rounded-2xl object-contain shadow-2xs"
                  onError={(e) => {
                    console.warn("Diwali banner failed to load:", bannerUrl);
                    e.currentTarget.style.display = "none";
                  }}
                />

                {/* Festive Tag */}
                <div className="absolute bottom-4 left-4 z-10">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-[#e8703b] border border-orange-200 shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#e8703b]" />
                    Festive Special
                  </span>
                </div>
              </div>

              {/* Side Content in Site Colors */}
              <div
                className={`p-5 sm:p-7 flex flex-col justify-between ${
                  isSplitSide
                    ? "w-full md:w-1/2 bg-white"
                    : "w-full bg-[#fffbf6] border-t border-amber-100"
                }`}
              >
                <div>
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-[#e8703b] border border-orange-200/90 mb-2.5">
                    <Flame className="w-3.5 h-3.5 text-[#e8703b] fill-[#e8703b]" />
                    <span>{popupData.badge || "Special Celebration"}</span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
                    {popupData.headline || "Celebrate With Pure & Traditional Taste!"}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    {popupData.description ||
                      "Freshly stone-ground flours, authentic millet mixes, noodles & traditional favorites prepared with 100% natural ingredients for your festive cooking."}
                  </p>
                </div>

                {/* CTA Action Button */}
                <div className="mt-5 pt-2">
                  <button
                    onClick={handleShopNow}
                    className="w-full py-3 px-4 rounded-xl bg-[#e8703b] hover:bg-[#d45f2a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all active:scale-98 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{popupData.buttonText || "Shop Festive Offers"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2.5 px-1">
                    <span>{popupData.footerText || "Pure & Authentic Ingredients"}</span>
                    <button
                      onClick={closePopup}
                      className="text-gray-400 hover:text-gray-600 underline cursor-pointer"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ═══════════ FALLBACK FESTIVE CARD IF NO BANNER ═══════════ */
            <div className="p-7 sm:p-9 flex flex-col items-center text-center bg-gradient-to-b from-[#fffbf6] to-white relative overflow-hidden">
              {/* Logo container */}
              <div className="w-20 h-20 mb-3.5 flex items-center justify-center rounded-2xl bg-white border border-amber-200/90 p-3 shadow-sm">
                <img
                  src={logo}
                  alt="Sowmiya Foods"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#e8703b] border border-orange-200/90 mb-2.5">
                <Flame className="w-3.5 h-3.5 text-[#e8703b] fill-[#e8703b]" />
                <span>{popupData.badge || "Happy Festive Season!"}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {popupData.headline || "Authentic Taste, Festival Special"}
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md leading-relaxed">
                {popupData.description ||
                  "Enjoy freshly ground traditional flours, wholesome millet mixes & delicious noodles crafted with 100% natural ingredients."}
              </p>

              {/* Shop CTA */}
              <button
                onClick={handleShopNow}
                className="w-full max-w-xs mt-6 py-3 rounded-xl bg-[#e8703b] hover:bg-[#d45f2a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{popupData.buttonText || "Explore Festive Collection"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🌸 KEYFRAMES FOR ANGLED FLIGHT & BIG BANG FLOWER EXPLOSION 🌸 */}
      <style>{`
        /* 1. Fluid, continuous aerodynamic rocket flight (no stuttering, smooth unbroken arc) */
        @keyframes flowerRocketFlight {
          0% {
            transform: translate(0, 0) rotate(0deg) scaleY(1);
            opacity: 1;
            animation-timing-function: cubic-bezier(0.25, 0.4, 0.25, 1);
          }
          /* Phase A: Shoots up smoothly and starts gentle banking */
          14% {
            transform: translate(calc(var(--target-x, 0px) * 0.2), calc(var(--target-y, -60vh) * 0.32)) rotate(calc(var(--angle, 0deg) * 0.6)) scaleY(1.18);
            opacity: 1;
            animation-timing-function: cubic-bezier(0.2, 0.1, 0.25, 1);
          }
          /* Phase B: In full flight smoothly reaching apex without any hitches */
          32.5% {
            transform: translate(var(--target-x, 0px), var(--target-y, -60vh)) rotate(var(--angle, 0deg)) scaleY(0.7);
            opacity: 1;
          }
          33% {
            transform: translate(var(--target-x, 0px), var(--target-y, -60vh)) scale(0);
            opacity: 0;
          }
          100% {
            transform: translate(var(--target-x, 0px), var(--target-y, -60vh)) scale(0);
            opacity: 0;
          }
        }

        /* 2. Compact Flower Container blooming directly at rocket apex (detonates at 33%) */
        @keyframes flowerBloomContainer {
          0%, 32% {
            opacity: 0;
            transform: translate(calc(var(--target-x, 0px) - 50%), calc(var(--target-y, -60vh) - 50%)) scale(0);
          }
          33% {
            opacity: 1;
            transform: translate(calc(var(--target-x, 0px) - 50%), calc(var(--target-y, -60vh) - 50%)) scale(0.15);
          }
          38% {
            opacity: 1;
            transform: translate(calc(var(--target-x, 0px) - 50%), calc(var(--target-y, -60vh) - 50%)) scale(0.7);
          }
          50% {
            opacity: 1;
            transform: translate(calc(var(--target-x, 0px) - 50%), calc(var(--target-y, -60vh) - 50%)) scale(0.85);
          }
          72% {
            opacity: 0.95;
            transform: translate(calc(var(--target-x, 0px) - 50%), calc(var(--target-y, -60vh) - 50% + 8px)) scale(0.88);
          }
          88% {
            opacity: 0.6;
            transform: translate(calc(var(--target-x, 0px) - 50%), calc(var(--target-y, -60vh) - 50% + 16px)) scale(0.9);
          }
          96%, 100% {
            opacity: 0;
            transform: translate(calc(var(--target-x, 0px) - 50%), calc(var(--target-y, -60vh) - 50% + 22px)) scale(0.92);
          }
        }

        /* 3. Central Compact flash */
        @keyframes flowerFlash {
          0%, 32% {
            opacity: 0;
            transform: scale(0);
          }
          34% {
            opacity: 1;
            transform: scale(1.4);
          }
          42% {
            opacity: 0;
            transform: scale(2.0);
          }
          100% {
            opacity: 0;
          }
        }

        /* 4. Shockwave Outer Ring */
        @keyframes flowerRingOuter {
          0%, 32% {
            opacity: 0;
            transform: scale(0.05);
          }
          36% {
            opacity: 0.95;
            transform: scale(0.75);
          }
          50% {
            opacity: 0;
            transform: scale(1.5);
          }
          100% {
            opacity: 0;
          }
        }

        /* 5. Shockwave Inner Ring */
        @keyframes flowerRingInner {
          0%, 33% {
            opacity: 0;
            transform: scale(0.05);
          }
          37% {
            opacity: 0.9;
            transform: scale(0.85);
          }
          48% {
            opacity: 0;
            transform: scale(1.6);
          }
          100% {
            opacity: 0;
          }
        }

        /* 6. Outer Big Bang Flower Petals Blooming */
        @keyframes flowerPetalsOuter {
          0%, 32% {
            opacity: 0;
            transform: scale(0.02) rotate(-22deg);
          }
          38% {
            opacity: 1;
            transform: scale(0.72) rotate(0deg);
          }
          52% {
            opacity: 1;
            transform: scale(0.88) rotate(14deg);
          }
          75% {
            opacity: 0.9;
            transform: scale(0.92) rotate(22deg);
          }
          92% {
            opacity: 0.4;
            transform: scale(0.95) rotate(28deg);
          }
          100% {
            opacity: 0;
          }
        }

        /* 7. Middle Flower Petals Blooming */
        @keyframes flowerPetalsMiddle {
          0%, 32% {
            opacity: 0;
            transform: scale(0.02) rotate(22deg);
          }
          39% {
            opacity: 1;
            transform: scale(0.68) rotate(0deg);
          }
          53% {
            opacity: 0.95;
            transform: scale(0.82) rotate(-14deg);
          }
          75% {
            opacity: 0.85;
            transform: scale(0.86) rotate(-22deg);
          }
          92% {
            opacity: 0.35;
            transform: scale(0.9) rotate(-28deg);
          }
          100% {
            opacity: 0;
          }
        }

        /* 8. Inner Golden Petals Blooming */
        @keyframes flowerPetalsInner {
          0%, 33% {
            opacity: 0;
            transform: scale(0.02) rotate(-12deg);
          }
          40% {
            opacity: 1;
            transform: scale(0.65) rotate(0deg);
          }
          55% {
            opacity: 1;
            transform: scale(0.78) rotate(12deg);
          }
          75% {
            opacity: 0.85;
            transform: scale(0.82) rotate(18deg);
          }
          90% {
            opacity: 0.3;
            transform: scale(0.86) rotate(24deg);
          }
          100% {
            opacity: 0;
          }
        }

        /* 9. Pollen Sparks Drifting Downward */
        @keyframes flowerPollenDrift {
          0%, 33% {
            opacity: 0;
            transform: scale(0) translateY(0);
          }
          38% {
            opacity: 1;
            transform: scale(1.25) translateY(calc(var(--pollen-dist, -95px) * 0.75));
          }
          58% {
            opacity: 1;
            transform: scale(1.05) translateY(var(--pollen-dist, -95px)) translateX(10px);
          }
          80% {
            opacity: 0.75;
            transform: scale(0.75) translateY(calc(var(--pollen-dist, -95px) * 1.3)) translateX(20px);
          }
          94%, 100% {
            opacity: 0;
            transform: scale(0.2) translateY(calc(var(--pollen-dist, -95px) * 1.5)) translateX(28px);
          }
        }

        /* 10. Center Glowing Core */
        @keyframes flowerCore {
          0%, 32% {
            opacity: 0;
            transform: scale(0);
          }
          35% {
            opacity: 1;
            transform: scale(1.7);
          }
          52% {
            opacity: 1;
            transform: scale(1.15);
          }
          75% {
            opacity: 0.85;
            transform: scale(0.9);
          }
          90%, 100% {
            opacity: 0;
            transform: scale(0.2);
          }
        }

        .animate-flower-rocket {
          animation: flowerRocketFlight 4.6s linear infinite;
        }

        .animate-flower-bloom-container {
          animation: flowerBloomContainer 4.6s ease-out infinite;
        }

        .animate-flower-flash {
          animation: flowerFlash 4.6s ease-out infinite;
        }

        .animate-flower-ring-outer {
          animation: flowerRingOuter 4.6s ease-out infinite;
        }

        .animate-flower-ring-inner {
          animation: flowerRingInner 4.6s ease-out infinite;
        }

        .animate-flower-petals-outer {
          animation: flowerPetalsOuter 4.6s cubic-bezier(0.2, 0.7, 0.25, 1) infinite;
        }

        .animate-flower-petals-middle {
          animation: flowerPetalsMiddle 4.6s cubic-bezier(0.2, 0.7, 0.25, 1) infinite;
        }

        .animate-flower-petals-inner {
          animation: flowerPetalsInner 4.6s cubic-bezier(0.2, 0.7, 0.25, 1) infinite;
        }

        .animate-flower-pollen-drift {
          animation: flowerPollenDrift 4.6s ease-out infinite;
        }

        .animate-flower-core {
          animation: flowerCore 4.6s ease-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DiwaliPopup;