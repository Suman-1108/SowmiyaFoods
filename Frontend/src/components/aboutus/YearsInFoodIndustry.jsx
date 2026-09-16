import React, { useEffect, useRef, useState } from "react";
import { Clock, MapPin, Factory, Leaf, Heart, Shield } from "lucide-react";

const YearsInFoodIndustry = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({ years: 0, products: 0, cities: 0 });
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Animate counters
          const duration = 2000;
          const steps = 60;
          const interval = duration / steps;

          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            setCounters({
              years: Math.floor(30 * progress),
              products: Math.floor(50 * progress),
              cities: Math.floor(25 * progress),
            });
            if (step >= steps) clearInterval(timer);
          }, interval);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const content = {
    en: {
      title: "30 Years of Excellence",
      subtitle: "A Legacy of Trust & Quality",
      description: `Our company Sowmiya Foods started manufacturing semiya under the name of Ramar brand 30 years ago and established its foothold in nearby places. In a short span of time, we have started manufacturing and distributing popular products like Roasted sooji, whole wheat flour, Ragi flour, rice flour, gram flour, bajji mix, idiyappam flour, murukku flour, samba Ravai, adai dosa mix, Chinese noodles etc. using high quality raw materials.

We increase sales by going from city to village in South Tamil Nadu through direct sales, reaching every household with our authentic products.

Importantly, we manufacture and sell semiya in accurate weights of 200g, 500g without reducing weight from the high quality - something we've been doing exclusively in Tamil Nadu for 30 years.`,
      stats: [
        { icon: Clock, value: "years", suffix: "+", label: "Years of Service" },
        { icon: Factory, value: "products", suffix: "+", label: "Products" },
        { icon: MapPin, value: "cities", suffix: "+", label: "Cities Covered" },
      ],
      features: [
        { icon: Leaf, title: "No Chemicals", desc: "No artificial additives or preservatives" },
        { icon: Heart, title: "Health First", desc: "Made with health-conscious recipes" },
        { icon: Shield, title: "Quality Assured", desc: "Rigorous quality control at every step" },
      ],
    },
    ta: {
      title: "சிறந்த தரத்தின் 30 ஆண்டுகள்",
      subtitle: "நம்பிக்கை & தரத்தின் பாரம்பரியம்",
      description: `30 வருடங்களுக்கு முன்பு எங்கள் Sowmya Foods நிறுவனம் ராமர் பிராண்ட் என்ற பெயரில் சேமியா உற்பத்தியை துவங்கி, அனைத்து முக்கிய இடங்களில் கால் பதித்தோம்.

சில காலங்களிலேயே மக்கள் விரும்பி உண்ணும் கேழ்வரகு மாவு, அரிசி மாவு, கடலை மாவு, பஜ்ஜி மாவு, இடியாப்ப மாவு, முறுக்கு மாவு, சம்பா கோதுமை கிச்சடி, அடை தோசை மாவு, சைனீஸ் நூடுல்ஸ் போன்றவற்றை உயர் தரமான மூலப் பொருள்கள் கொண்டு தயாரித்து விற்பனையை அதிகரித்து, நேரடி விற்பனை என்ற முறையில் தென் தமிழகத்தின் நகரம் முதல் கிராமம் வரை சென்று விநியோகம் செய்து வருகிறோம்.

முக்கியமாக சேமியா, உயர்த் தரத்தில் எடைக் குறைப்பு செய்யாமல் சரியான எடையில் 200கி, 500கி என்று தமிழ்நாட்டில் 30 ஆண்டுகள் நாங்கள் மட்டுமே பேக்கிங் செய்து விற்பனை செய்கிறோம் என்பதில் பெரும் மகிழ்ச்சி அடைகிறோம்.`,
      stats: [
        { icon: Clock, value: "years", suffix: "+", label: "ஆண்டுகள் சேவை" },
        { icon: Factory, value: "products", suffix: "+", label: "தயாரிப்புகள்" },
        { icon: MapPin, value: "cities", suffix: "+", label: "நகரங்கள்" },
      ],
      features: [
        { icon: Leaf, title: "ரசாயனங்கள் இல்லை", desc: "செயற்கை சேர்க்கைகள் இல்லை" },
        { icon: Heart, title: "ஆரோக்கியம் முதலில்", desc: "ஆரோக்கியத்தை கருத்தில் கொண்டு தயாரிக்கப்படுகிறது" },
        { icon: Shield, title: "தரம் உறுதி", desc: "ஒவ்வொரு படியிலும் கண்டிப்பான தர கட்டுப்பாடு" },
      ],
    },
  };

  const data = content[lang];

  return (
    <section ref={sectionRef} className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-amber-900 mb-3">
            {data.title}
          </h2>
          <p className="text-xl text-amber-700 italic">{data.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Image Side */}
          <div className={`relative group transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-200">
              <img
                src="https://res.cloudinary.com/dbuyr00w6/image/upload/v1760424610/WhatsApp_Image_2025-10-14_at_09.38.22_9dc0ca5a_hgmw8p.jpg"
                alt="30 Years Celebration"
                className="w-full h-[400px] lg:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay with grain pattern */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-transparent" />
              
              {/* Stats Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 grid grid-cols-3 gap-4">
                {data.stats.map((stat, index) => (
                  <div key={index} className="text-center bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/30">
                    <stat.icon className="w-6 h-6 text-amber-300 mx-auto mb-2" />
                    <div className="text-2xl lg:text-3xl font-bold text-white">
                      {counters[stat.value]}{stat.suffix}
                    </div>
                    <div className="text-xs text-amber-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-amber-400 rounded-full opacity-20 blur-3xl" />
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-orange-400 rounded-full opacity-20 blur-3xl" />
          </div>

          {/* Content Side */}
          <div className={`space-y-8 transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
            {/* Description */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-amber-100">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                {data.description}
              </p>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4">
              {data.features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 text-center border border-amber-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-amber-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {["ISO Certified", "FSSAI Approved", "GMP Compliant"].map((badge, index) => (
                <div
                  key={index}
                  className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium border border-amber-200"
                >
                  ✓ {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YearsInFoodIndustry;