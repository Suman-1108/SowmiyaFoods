import React, { useState, useEffect } from "react";
import logo from "../../assets/logo.png";

/**
 * SplashScreen
 * Minimalist, elegant logo-only loading splash screen.
 * - Clean site backdrop with gentle logo breathing loading animation.
 * - ON ENTER: logo fades up + scales in from slightly below/small.
 * - ON EXIT: logo scales up and fades out smoothly to reveal the store.
 */
const SplashScreen = ({ duration = 2600, onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [isZoomingOut, setIsZoomingOut] = useState(false);

  useEffect(() => {
    // Check if user already saw splash in current session (unless ?splash=true is passed)
    const hasSeenSplash = sessionStorage.getItem("sowmiya_splash_seen");
    const forceShow =
      new URLSearchParams(window.location.search).get("splash") === "true";

    if (hasSeenSplash && !forceShow) {
      setIsVisible(false);
      if (onFinish) onFinish();
      return;
    }

    // Trigger entrance animation on next frame so the transition plays
    const enterRaf = requestAnimationFrame(() => setHasEntered(true));

    // Trigger zoom-in & fade-out after duration
    const timer = setTimeout(() => {
      triggerExit();
    }, duration);

    return () => {
      cancelAnimationFrame(enterRaf);
      clearTimeout(timer);
    };
  }, [duration, onFinish]);

  const triggerExit = () => {
    setIsZoomingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("sowmiya_splash_seen", "true");
      window.dispatchEvent(new Event("sowmiya_splash_finished"));
      if (onFinish) onFinish();
    }, 550); // duration of the zoom-in and fade-out transition
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={triggerExit}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-md select-none transition-opacity duration-500 ease-out cursor-pointer ${
        isZoomingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Centered Logo Container — entrance fade/scale-up, exit zoom/fade-out */}
      <div
        className={`relative flex flex-col items-center justify-center transition-all ease-out ${
          isZoomingOut
            ? "duration-550 scale-[2.4] opacity-0 blur-sm"
            : hasEntered
            ? "duration-700 scale-100 opacity-100 translate-y-0"
            : "duration-0 scale-75 opacity-0 translate-y-4"
        }`}
      >
        {/* Soft Ambient Warm Glow behind Logo */}
        <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-r from-amber-400/25 via-[#e8703b]/25 to-yellow-400/25 blur-2xl animate-pulse pointer-events-none" />

        {/* Brand Logo Card */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white p-3.5 shadow-xl shadow-amber-500/15 border border-amber-200/80 flex items-center justify-center animate-logo-breathe">
          <img
            src={logo}
            alt="Sowmiya Foods"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Brand Name */}
        <div className="mt-4 flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-black text-[#1a365d] tracking-wider uppercase">
            Sowmiya Foods
          </span>
          <span className="text-[11px] font-semibold text-[#e8703b] tracking-[0.25em] uppercase mt-0.5">
            Pure • Fresh • Traditional
          </span>
        </div>
      </div>

      {/* Styles for gentle breathing pulse while loading */}
      <style>{`
        @keyframes logoBreathe {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 25px -5px rgba(232, 112, 59, 0.15), 0 8px 10px -6px rgba(232, 112, 59, 0.1);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 20px 35px -5px rgba(232, 112, 59, 0.28), 0 10px 15px -5px rgba(232, 112, 59, 0.2);
          }
        }
        .animate-logo-breathe {
          animation: logoBreathe 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;