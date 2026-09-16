import React, { useEffect, useRef, useState } from "react";
import { Calendar, TrendingUp, Award, Globe } from "lucide-react";

const Journey = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const milestones = [
    {
      year: "1994",
      icon: Calendar,
      title: { en: "Humble Beginnings", ta: "தொடக்கம்" },
      description: {
        en: "Started as a small family business under the Ramar brand with traditional vermicelli production",
        ta: "ராமர் பிராண்டின் கீழ் சிறு குடும்ப வணிகமாக சேமியா தயாரிப்புடன் தொடங்கியது",
      },
    },
    {
      year: "2000",
      icon: TrendingUp,
      title: { en: "Expansion Phase", ta: "விரிவாக்கம்" },
      description: {
        en: "Expanded product range to include wheat flour, ragi flour, and various traditional mixes",
        ta: "கோதுமை மாவு, கேழ்வரகு மாவு மற்றும் பல வகை பாரம்பரிய மிக்ஸ்களை உள்ளடக்கிய பொருள் வரம்பை விரிவுபடுத்தியது",
      },
    },
    {
      year: "2010",
      icon: Award,
      title: { en: "Quality Recognition", ta: "தர அங்கீகாரம்" },
      description: {
        en: "Gained recognition for uncompromising quality and became a trusted name across South Tamil Nadu",
        ta: "சமர்ப்பிக்காத தரத்திற்காக அங்கீகாரம் பெற்று தென் தமிழ்நாடு முழுவதும் நம்பகமான பெயரானது",
      },
    },
    {
      year: "2024",
      icon: Globe,
      title: { en: "Modern Era", ta: "நவீன காலம்" },
      description: {
        en: "Embracing modern technology while maintaining traditional recipes and values",
        ta: "பாரம்பரிய சமையல் மற்றும் மதிப்புகளை பேணிக்காத்து நவீன தொழில்நுட்பத்தை ஏற்றுக்கொள்ளுதல்",
      },
    },
  ];

  return (
    <section ref={sectionRef} className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
            {lang === "en" ? "Our Journey" : "எங்கள் பயணம்"}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {lang === "en"
              ? "Three decades of dedication, quality, and trust in bringing authentic South Indian flavors to your home"
              : "உங்கள் வீட்டிற்கு நம்பகமான தென்னிந்திய சுவைகளை கொண்டு வரும் அர்ப்பணிப்பு, தரம் மற்றும் நம்பிக்கையின் மூன்று தசாப்தங்கள்"}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-amber-300 via-orange-300 to-amber-300 hidden md:block" />

          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={`relative flex items-center mb-12 transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Desktop Layout */}
              <div className={`hidden md:flex w-full ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                {/* Content Side */}
                <div className={`w-1/2 ${index % 2 === 0 ? "pr-12 text-right" : "pl-12 text-left"}`}>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
                    <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? "justify-end" : "justify-start"}`}>
                      <h3 className="text-xl font-bold text-amber-900">{milestone.title[lang]}</h3>
                      <milestone.icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <p className="text-gray-600 mb-2">{milestone.description[lang]}</p>
                  </div>
                </div>

                {/* Center Node */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <span className="text-white font-bold text-sm">{milestone.year}</span>
                  </div>
                </div>

                {/* Empty Side */}
                <div className="w-1/2" />
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden flex w-full flex-row items-start gap-4">
                {/* Year Node */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xs">{milestone.year}</span>
                  </div>
                  {index !== milestones.length - 1 && (
                    <div className="w-0.5 h-24 bg-amber-300 mx-auto mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <milestone.icon className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-bold text-amber-900">{milestone.title[lang]}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{milestone.description[lang]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#D4A574" strokeWidth="2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#D4A574" strokeWidth="1" />
        </svg>
      </div>
      <div className="absolute bottom-20 right-10 w-32 h-32 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#D4A574" strokeWidth="2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#D4A574" strokeWidth="1" />
        </svg>
      </div>
    </section>
  );
};

export default Journey;