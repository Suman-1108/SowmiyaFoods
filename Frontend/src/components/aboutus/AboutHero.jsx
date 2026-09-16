import React, { useRef, useState, useEffect } from "react";
import { Wheat, Award, Heart, Leaf } from "lucide-react";

const AboutHero = ({ lang }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const text = {
    en: {
      title: "Sowmiya Foods - Ramar Brand",
      subtitle: "A Legacy of Taste & Trust",
      description:
        "For over 30 years, we have been dedicated to providing high-quality, authentic food products that bring the traditional taste of South India to every home. Our commitment to purity and excellence has made us a trusted name in households across Tamil Nadu.",
      highlights: [
        { icon: Wheat, text: "100% Natural Grains" },
        { icon: Award, text: "Premium Quality" },
        { icon: Heart, text: "Trusted by Families" },
        { icon: Leaf, text: "No Preservatives" },
      ],
    },
    ta: {
      title: "சௌமியா ஃபுட்ஸ் - ராமர் பிராண்ட்",
      subtitle: "சுவை மற்றும் நம்பகத்தன்மையின் பாரம்பரியம்",
      description:
        "30 ஆண்டுகளுக்கும் மேலாக, தென்னிந்தியாவின் பாரம்பரிய சுவையை ஒவ்வொரு வீட்டிற்கும் கொண்டு வரும் உயர்தர, நம்பகமான உணவுப் பொருட்களை வழங்குவதில் நாங்கள் அர்ப்பணிப்புடன் செயல்படுகிறோம். தூய்மை மற்றும் சிறந்த தரத்திற்கான எங்கள் உறுதிப்பாடு, தமிழ்நாடு முழுவதும் பல குடும்பங்களால் நம்பகமான பெயராக எங்களை ஆக்கியுள்ளது.",
      highlights: [
        { icon: Wheat, text: "100% இயற்கை தானியங்கள்" },
        { icon: Award, text: "உயர்தரத் தரம்" },
        { icon: Heart, text: "குடும்பங்களால் நம்பப்படுகிறது" },
        { icon: Leaf, text: "செயற்கை சேர்க்கைகள் இல்லை" },
      ],
    },
  };

  // Toggle play / pause
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Toggle mute / unmute
  const handleMute = () => {
    const video = videoRef.current;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
            <Wheat className="w-5 h-5 text-amber-700" />
            <span className="text-amber-800 font-medium text-sm">
              {lang === "en" ? "Since 1994" : "1994 முதல்"}
            </span>
            <Wheat className="w-5 h-5 text-amber-700" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-amber-900 mb-4">
            {text[lang].title}
          </h1>
          <p className="text-xl text-amber-700 italic font-serif">
            {text[lang].subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Video Section */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-200">
              <video
                ref={videoRef}
                src="https://res.cloudinary.com/dbuyr00w6/video/upload/v1760349561/InSlide_04102025_202455805_f7vqqh.mp4"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
              
              {/* Video Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              
              {/* Control Buttons */}
              <div className="absolute bottom-6 left-6 flex gap-3">
                <button
                  onClick={handlePlayPause}
                  className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm hover:bg-white/30 transition-all border border-white/30"
                >
                  {isPlaying ? (lang === "en" ? "⏸ Pause" : "⏸ இடைநிறுத்து") : (lang === "en" ? "▶ Play" : "▶ இயக்கு")}
                </button>
                <button
                  onClick={handleMute}
                  className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm hover:bg-white/30 transition-all border border-white/30"
                >
                  {isMuted ? (lang === "en" ? "🔊 Unmute" : "🔊 ஒலி") : (lang === "en" ? "🔇 Mute" : "🔇 அமைதி")}
                </button>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-300 rounded-full opacity-50 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-yellow-300 rounded-full opacity-40 blur-3xl" />
          </div>

          {/* Description Section */}
          <div className={`space-y-8 transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100">
              <p className="text-lg text-gray-700 leading-relaxed">
                {text[lang].description}
              </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-4">
              {text[lang].highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                >
                  <highlight.icon className="w-8 h-8 text-amber-600 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-amber-900 font-semibold text-sm">
                    {highlight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Wheat SVG */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {[...Array(5)].map((_, i) => (
            <g key={i} transform={`translate(${40 + i * 30}, 100) rotate(${-20 + i * 10})`}>
              <ellipse cx="0" cy="-40" rx="6" ry="20" fill="#D4A574" />
              <ellipse cx="0" cy="-10" rx="8" ry="25" fill="#C9A86C" />
              <ellipse cx="0" cy="25" rx="8" ry="25" fill="#C9A86C" />
              <ellipse cx="0" cy="55" rx="6" ry="20" fill="#D4A574" />
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
};

export default AboutHero;