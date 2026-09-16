import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AboutHero from "../components/aboutus/AboutHero";
import AboutGoal from "../components/aboutus/AboutGoal";
import YearsInFoodIndustry from "../components/aboutus/YearsInFoodIndustry";
import Journey from "../components/aboutus/Journey";
import PromoterHistory from "../components/aboutus/PromoterHistory";
import GrainParticles from "../components/aboutus/GrainParticles";
const AboutUs = () => {
  const [lang, setLang] = useState("en");

  const toggleLang = () => setLang(lang === "en" ? "ta" : "en");
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="relative overflow-hidden">
      <Navbar />
      
      {/* Floating Grain Particles Background */}
      <GrainParticles />
      
      {/* Language Toggle */}
      <div className="fixed top-24 right-4 z-50">
        <button
          onClick={toggleLang}
          className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full hover:from-amber-700 hover:to-amber-800 transition-all duration-300 shadow-lg backdrop-blur-sm font-medium"
        >
          {lang === "en" ? "தமிழ்" : "English"}
        </button>
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        <AboutHero lang={lang} />
        <AboutGoal lang={lang} />
        <Journey lang={lang} />
        <PromoterHistory lang={lang} />
        <YearsInFoodIndustry lang={lang} />
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;