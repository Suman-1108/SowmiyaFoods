import React, { useEffect, useRef, useState } from "react";
import { Quote, GraduationCap, Briefcase, Award, History } from "lucide-react";

const PromoterHistory = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const text = {
    en: {
      title: "Promoter History",
      subtitle: "The Vision Behind Ramar",
      cards: [
        {
          icon: GraduationCap,
          title: "Educational Foundation",
          description: "After completing a degree in Business Management, our founder laid the groundwork for a values-driven enterprise.",
        },
        {
          icon: Briefcase,
          title: "Academic Experience",
          description: "Served as an Assistant Professor in a college for 5 years, instilling discipline and commitment to excellence.",
        },
        {
          icon: History,
          title: "The Beginning",
          description: "Started the journey over 30 years ago under the brand name Ramar with traditional vermicelli, rice flour, gram flour, and more.",
        },
        {
          icon: Award,
          title: "Trust Earned",
          description: "Built trust across major cities in South Tamil Nadu through consistent quality and timely delivery of healthy products.",
        },
      ],
      quote: "By offering competitive prices without compromising on taste, aroma, and quality, Ramar Foods has grown into a trusted and reliable brand.",
    },
    ta: {
      title: "நிறுவனர் வரலாறு",
      subtitle: "ராமரின் பின்னணியில் உள்ள பார்வை",
      cards: [
        {
          icon: GraduationCap,
          title: "கல்வி அடிப்படை",
          description: "வணிக மேலாண்மை பட்டம் பெற்ற பிறகு, மதிப்புகளை அடிப்படையாகக் கொண்ட நிறுவனத்திற்கான அடித்தளம் அமைக்கப்பட்டது.",
        },
        {
          icon: Briefcase,
          title: "கல்வி அனுபவம்",
          description: "5 ஆண்டுகள் கல்லூரியில் உதவி பேராசிரியராக பணியாற்றி, நற்பண்புகள் மற்றும் சிறந்த தரத்திற்கான அர்ப்பணிப்பை வளர்த்துக் கொண்டார்.",
        },
        {
          icon: History,
          title: "தொடக்கம்",
          description: "30 ஆண்டுகளுக்கு முன்பு ராமர் பிராண்ட் என்ற பெயரில் சேமியா, அரிசி மாவு, கடலை மாவு போன்ற பாரம்பரிய பொருட்களுடன் பயணம் தொடங்கியது.",
        },
        {
          icon: Award,
          title: "நம்பிக்கை பெற்றது",
          description: "தென் தமிழ்நாட்டின் முக்கியமான நகரங்களில் சரியான நேரத்தில் ஆரோக்கியமான தயாரிப்புகளை வழங்கி நம்பிக்கையை நிலைநாட்டியது.",
        },
      ],
      quote: "விலையை குறைக்காமல், சுவை, மணம் மற்றும் தரத்தில் சமர்ப்பிக்காமல், ராமர் ஃபுட்ஸ் நம்பகமான பிராண்டாக வளர்ந்துள்ளது.",
    },
  };

  const data = text[lang];

  return (
    <section ref={sectionRef} className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2">{data.title}</h2>
          <p className="text-amber-700 italic">{data.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Cards Grid */}
          <div className="grid gap-6">
            {data.cards.map((card, index) => (
              <div
                key={index}
                className={`flex gap-4 p-5 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-100 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-x-1 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 mb-1">{card.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Image & Quote */}
          <div className={`relative transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
            {/* Image Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-200">
              <img
                src="https://res.cloudinary.com/dbuyr00w6/image/upload/v1760347327/WhatsApp_Image_2025-10-13_at_11.59.07_3d5623f6_v2dcq7.jpg"
                alt="Promoter"
                className="w-full h-[500px] object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/80 via-transparent to-transparent" />
              
              {/* Quote Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <Quote className="w-8 h-8 text-amber-300 mb-2 opacity-70" />
                <p className="text-white text-lg italic leading-relaxed">"{data.quote}"</p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full opacity-30 blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full opacity-30 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoterHistory;