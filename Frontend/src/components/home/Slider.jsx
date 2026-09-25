import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, Headphones, CreditCard, Sparkles } from "lucide-react";

// Product images
import wheatFlour1 from "../../assets/Atta_1.png";
import ramarNoodles2 from "../../assets/noodles_1.png";
import ramarNoodles3 from "../../assets/noodles_2.png";
import ramarPuliyotharai from "../../assets/CutMango_1.png";
import milletPodi from "../../assets/milletpodi_1.png";
import murukkuMaavu from "../../assets/murukku_maavu.png";
import instantParotta from "../../assets/instant_parottaaa.png";

// ==========================================
// Promotional Category Grid Cards
// ==========================================
const CATEGORY_CARDS = [
  {
    id: "snacks",
    category: "Flour Items",
    tamilBadge: "முறுக்கு மாவு",
    subtitle: "Authentic & Crunchy",
    title: "Crispy Murukku Flour",
    tagline: "Easy to prepare crunchy festival murukku",
    btnText: "Order Now",
    image: murukkuMaavu,
    gradient: "from-[#0A3D1E] via-[#14532D] to-[#052E16]",
    borderColor: "border-emerald-500/40",
    glowColor: "bg-emerald-400/30",
    textLight: true,
    accentPill: "text-emerald-200 font-extrabold tracking-wide drop-shadow-xs",
    btnClass: "bg-gradient-to-r from-amber-400 to-yellow-400 text-emerald-950 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-emerald-950/40 font-bold",
    colSpan: "lg:col-span-1",
  },
  {
    id: "parotta",
    category: "Instant Products",
    tamilBadge: "திடீர் புரோட்டா",
    subtitle: "Hot, Flaky & Layered",
    title: "Instant Parotta",
    tagline: "Tastemaker masala inside for a delicious meal",
    btnText: "Explore",
    image: instantParotta,
    gradient: "from-[#831843] via-[#9D174D] to-[#500724]",
    borderColor: "border-fuchsia-400/40",
    glowColor: "bg-pink-500/30",
    textLight: true,
    accentPill: "text-pink-200 font-extrabold tracking-wide drop-shadow-xs",
    btnClass: "bg-gradient-to-r from-amber-400 to-yellow-400 text-pink-950 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-pink-950/40 font-bold",
    colSpan: "lg:col-span-1",
  },
  {
    id: "flour",
    category: "Flour Items",
    tamilBadge: "ஆரோக்கிய மாவு",
    subtitle: "100% Pure Whole Grain",
    title: "Premium Atta & Flour",
    tagline: "Ultra-soft rotis packed with natural nutrients",
    btnText: "Shop Flour Range",
    image: wheatFlour1,
    gradient: "from-[#C2410C] via-[#EA580C] to-[#9A3412]",
    borderColor: "border-orange-400/30",
    glowColor: "bg-orange-300/25",
    textLight: true,
    accentPill: "text-white font-extrabold tracking-wide drop-shadow-xs",
    btnClass: "bg-white text-[#C2410C] hover:bg-orange-50 shadow-lg shadow-orange-950/30",
    colSpan: "lg:col-span-2",
  },
  {
    id: "noodles",
    category: "Noodles",
    tamilBadge: "சுவையான நூடுல்ஸ்",
    subtitle: "Instant & Delightful",
    title: "Special Ramar Noodles",
    tagline: "Quick comfort meal made with superior wheat",
    btnText: "Explore Noodles",
    image: ramarNoodles3,
    gradient: "from-[#FFFDF7] via-[#FAF3E0] to-[#F5E6CC]",
    borderColor: "border-amber-200/90",
    glowColor: "bg-orange-400/15",
    textLight: false,
    accentPill: "text-orange-700 font-extrabold tracking-wide",
    btnClass: "bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white hover:from-[#d94e09] hover:to-[#a72a08] shadow-lg shadow-orange-900/20",
    colSpan: "lg:col-span-2",
  },
  {
    id: "millets",
    category: "Millet",
    tamilBadge: "சத்தான சிறுதானியம்",
    subtitle: "Nutrient Rich & Pure",
    title: "Organic Millets",
    tagline: "Ancient grains for modern vitality",
    btnText: "Discover",
    image: milletPodi,
    gradient: "from-[#78350F] via-[#92400E] to-[#451A03]",
    borderColor: "border-amber-600/35",
    glowColor: "bg-amber-400/25",
    textLight: true,
    accentPill: "text-amber-200 font-extrabold tracking-wide drop-shadow-xs",
    btnClass: "bg-amber-100 text-amber-950 hover:bg-white shadow-lg shadow-amber-950/40 font-bold",
    colSpan: "lg:col-span-1",
  },
  {
    id: "pickles",
    category: "Pickles",
    tamilBadge: "பாட்டி வைத்திய ஊறுகாய்",
    subtitle: "Spicy & Tangy Heritage",
    title: "Traditional Pickles",
    tagline: "Aged to perfection with sesame oil",
    btnText: "Explore",
    image: ramarPuliyotharai,
    gradient: "from-[#7F1D1D] via-[#991B1B] to-[#450A0A]",
    borderColor: "border-rose-500/35",
    glowColor: "bg-rose-500/25",
    textLight: true,
    accentPill: "text-rose-200 font-extrabold tracking-wide drop-shadow-xs",
    btnClass: "bg-white text-rose-900 hover:bg-rose-50 shadow-lg shadow-rose-950/40",
    colSpan: "lg:col-span-1",
  },
];

// ==========================================
// Value Proposition Trust Bar
// ==========================================
const TRUST_FEATURES = [
  {
    icon: Truck,
    title: "Fast Shipping",
    subtitle: "Doorstep Courier Delivery Across India",
  },
  {
    icon: ShieldCheck,
    title: "Quality Guarantee",
    subtitle: "100% Traditional, Natural & Authentic",
  },
  {
    icon: Headphones,
    title: "Direct Support",
    subtitle: "WhatsApp & Call Assistance Anytime",
  },
  {
    icon: CreditCard,
    title: "Secure Checkout",
    subtitle: "UPI, Cards, Wallets & NetBanking",
  },
];

const Slider = () => {
  const navigate = useNavigate();

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFE6] relative overflow-hidden">
      {/* Decorative ambient background blur lights */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-8 h-0.5 bg-[#E05A1B]" />
              <span className="text-[#E05A1B] text-xs sm:text-sm font-bold tracking-wider uppercase">
                Featured Categories
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1a1a2e] tracking-tight">
              Shop By Category
            </h2>
            <p className="text-gray-600 mt-2 max-w-xl text-sm sm:text-base">
              Handpicked authentic South Indian delicacies, prepared fresh with traditional heritage.
            </p>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-amber-50 text-[#E05A1B] font-bold text-sm sm:text-base shadow-sm hover:shadow-md border border-amber-200/60 transition-all duration-300 group cursor-pointer"
          >
            <span>View all products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* ========================================== */}
        {/* Promotional Category Cards Grid */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {CATEGORY_CARDS.map((card) => {
            const isTextLight = card.textLight;
            const isColSpan2 = card.colSpan?.includes("col-span-2");

            return (
              <div
                key={card.id}
                onClick={() => navigate(`/products?category=${encodeURIComponent(card.category)}`)}
                className={`group relative overflow-hidden rounded-3xl p-6 sm:p-7 flex flex-col justify-between min-h-[290px] h-[300px] sm:h-[315px] lg:h-[325px] cursor-pointer bg-gradient-to-br ${card.gradient} border ${card.borderColor} shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1.5 ${card.colSpan}`}
              >
                {/* Soft Ambient Radial Light Behind Image */}
                <div
                  className={`absolute right-4 bottom-4 w-52 h-52 ${card.glowColor} rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-125`}
                />

                {/* Subtle Geometric Corner Motif */}
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full border border-white/10 pointer-events-none" />

                {/* Floating Product Pack with High-Depth Lighting */}
                <div
                  className={`absolute pointer-events-none z-10 flex items-end justify-end transition-all duration-700 ease-out group-hover:scale-110 group-hover:-rotate-3 ${isColSpan2
                      ? "right-2 sm:right-6 -bottom-3 sm:-bottom-4 w-[48%] sm:w-[46%] lg:w-[44%] h-[85%] sm:h-[90%]"
                      : "-right-3 sm:-right-4 -bottom-3 sm:-bottom-4 w-[62%] sm:w-[66%] lg:w-[70%] max-w-[270px] h-[82%] sm:h-[88%]"
                    }`}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-contain object-right-bottom drop-shadow-[0_18px_30px_rgba(0,0,0,0.35)]"
                  />
                </div>

                {/* Content Overlay */}
                <div className="relative z-20 flex flex-col justify-between h-full w-full pointer-events-none">
                  <div className="pointer-events-auto max-w-[74%] sm:max-w-[70%] lg:max-w-[65%]">
                    {/* Tamil Badge Text */}
                    <div className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold mb-2 transition-transform duration-300 group-hover:scale-105 select-none ${card.accentPill}`}>
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{card.tamilBadge}</span>
                    </div>

                    {/* Subtitle */}
                    <span
                      className={`text-xs font-bold uppercase tracking-wider block mb-1 ${isTextLight ? "text-amber-200/90" : "text-[#C2410C]"
                        }`}
                    >
                      {card.subtitle}
                    </span>

                    {/* Main Title */}
                    <h3
                      className={`text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight drop-shadow-xs ${isTextLight ? "text-white" : "text-gray-950"
                        }`}
                    >
                      {card.title}
                    </h3>

                    {/* Tagline */}
                    <p
                      className={`mt-1.5 text-xs line-clamp-2 leading-relaxed ${isTextLight ? "text-white/75" : "text-stone-600"
                        }`}
                    >
                      {card.tagline}
                    </p>
                  </div>

                  {/* Action Pill CTA */}
                  <div className="pointer-events-auto mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products?category=${encodeURIComponent(card.category)}`);
                      }}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 transform group-hover:scale-105 cursor-pointer ${card.btnClass}`}
                    >
                      <span>{card.btnText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================== */}
        {/* Value Proposition Trust Bar */}
        {/* ========================================== */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-amber-200/60 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_FEATURES.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/80 backdrop-blur-xs border border-amber-100 shadow-xs hover:shadow-md hover:bg-white transition-all duration-300"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-[#E05A1B] flex items-center justify-center flex-shrink-0 shadow-xs border border-amber-200/60">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm sm:text-[15px] leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-gray-500 text-xs mt-0.5 leading-snug">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Slider;