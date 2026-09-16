import React from "react";
import { Leaf, ShieldCheck, Truck, Sparkles, CheckCircle2 } from "lucide-react";

const WhyChooseUs = () => {
  const features = [
    {
      title: "100% Natural Grains",
      tamilTitle: "100% தூய இயற்கை தானியங்கள்",
      desc: "No artificial preservatives, no synthetic color. Just farm-fresh real grains, traditionally stone-milled.",
      icon: Leaf,
      badgeText: "Traditional Milled",
      accent: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
      dotColor: "bg-emerald-500",
    },
    {
      title: "Strict Quality Tested",
      tamilTitle: "உயர்ந்த தரக் கட்டுப்பாடு",
      desc: "Every batch undergoes rigorous food-safety and moisture checks to guarantee pure authentic taste.",
      icon: ShieldCheck,
      badgeText: "Certified Safe",
      accent: "from-[#e8703b] to-amber-600",
      bgLight: "bg-orange-50 text-[#e8703b] border-orange-200/80",
      dotColor: "bg-[#e8703b]",
    },
    {
      title: "Prompt Doorstep Delivery",
      tamilTitle: "விரைவான வீட்டு விநியோகம்",
      desc: "Freshly packed and dispatched within 24 hours. Safe hygienic packaging delivered right to your home.",
      icon: Truck,
      badgeText: "Express Dispatch",
      accent: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50 text-blue-600 border-blue-200/80",
      dotColor: "bg-blue-500",
    },
  ];

  return (
    <section className="relative pt-20 pb-20 sm:pt-28 sm:pb-28 md:pt-32 md:pb-32 bg-[#FAF6F0] overflow-hidden">
      {/* 🌊 TOP SINGLE WAVE DIVIDER */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none pointer-events-none z-10">
        <svg
          className="relative block w-full h-12 sm:h-16 md:h-20 lg:h-24"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0 L1440,0 L1440,40 C1200,80 960,10 720,50 C480,90 240,15 0,45 Z"
            fill="#ffffffaf"
          />
        </svg>
      </div>

      {/* Decorative ambient subtle background glows */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#e8703b]/10 text-[#e8703b] border border-[#e8703b]/25 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Commitment · எங்கள் உறுதிமொழி</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Why Sowmiya Foods?
          </h2>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Three wholesome reasons families across Tamil Nadu and beyond have made Ramar & Sowmiya Foods a trusted kitchen staple.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-[#ECE3D6] hover:border-[#e8703b]/40 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top row: Icon with soft badge + Pill */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-13 h-13 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 shadow-2xs ${feature.bgLight}`}>
                      <IconComponent className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#ECE3D6]">
                      {feature.badgeText}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 group-hover:text-[#e8703b] transition-colors">
                    {feature.title}
                  </h3>

                  {/* Tamil Subtitle */}
                  <p className="text-xs font-semibold text-amber-800/90 mb-3">
                    {feature.tamilTitle}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                {/* Bottom decorative accent line */}
                <div className="mt-6 pt-4 border-t border-[#EAE1D3] flex items-center justify-between text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Guaranteed Freshness
                  </span>
                  <span className={`w-2 h-2 rounded-full ${feature.dotColor}`}></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🌊 BOTTOM SINGLE WAVE DIVIDER */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none z-10">
        <svg
          className="relative block w-full h-12 sm:h-16 md:h-20 lg:h-24"
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,120 L1440,120 L1440,80 C1200,40 960,110 720,70 C480,30 240,105 0,75 Z"
            fill="#fffbf5e1"
          />
        </svg>
      </div>
    </section>
  );
};

export default WhyChooseUs;