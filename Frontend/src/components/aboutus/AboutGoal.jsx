import React, { useEffect, useRef, useState } from "react";
import { Target, Eye, Users, Sprout } from "lucide-react";

const AboutGoal = ({ lang }) => {
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

  const content = {
    en: {
      title: "Our Mission & Vision",
      mission: {
        title: "Our Mission",
        text: "To provide healthy, authentic food products that bring traditional South Indian flavors to every household while maintaining the highest standards of quality and purity.",
      },
      vision: {
        title: "Our Vision",
        text: "To become the most trusted name in traditional South Indian food products, known for our commitment to health, taste, and customer satisfaction across generations.",
      },
      values: [
        { icon: Target, title: "Quality First", desc: "Uncompromising standards" },
        { icon: Eye, title: "Transparency", desc: "Honest ingredients" },
        { icon: Users, title: "Community", desc: "Supporting local farmers" },
        { icon: Sprout, title: "Sustainability", desc: "Eco-friendly practices" },
      ],
    },
    ta: {
      title: "எங்கள் இலக்கு & நோக்கம்",
      mission: {
        title: "எங்கள் இலக்கு",
        text: "உயர்ந்த தரம் மற்றும் தூய்மையின் அடிப்படையில், பாரம்பரிய தென்னிந்திய சுவைகளை ஒவ்வொரு வீட்டிற்கும் கொண்டு வரும் ஆரோக்கியமான, நம்பகமான உணவுப் பொருட்களை வழங்குவது.",
      },
      vision: {
        title: "எங்கள் நோக்கம்",
        text: "தலைமுறைகளாக ஆரோக்கியம், சுவை மற்றும் வாடிக்கையாளர் திருப்திக்கான எங்கள் அர்ப்பணிப்பால் அறியப்படும், பாரம்பரிய தென்னிந்திய உணவுப் பொருட்களில் மிகவும் நம்பகமான பெயராக மாறுவது.",
      },
      values: [
        { icon: Target, title: "தரம் முதலில்", desc: "சமர்ப்பிக்கா தரங்கள்" },
        { icon: Eye, title: "வெளிப்படைத்தன்மை", desc: "நேர்மையான பொருட்கள்" },
        { icon: Users, title: "சமூகம்", desc: "உள்ளூர் விவசாயிகளுக்கு ஆதரவு" },
        { icon: Sprout, title: "நிலைத்தன்மை", desc: "சுற்றுச்சூழல் நட்பு முறைகள்" },
      ],
    },
  };

  const data = content[lang];

  return (
    <section ref={sectionRef} className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-12 bg-amber-400" />
            <Sprout className="w-6 h-6 text-amber-600" />
            <div className="h-px w-12 bg-amber-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900">{data.title}</h2>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Mission Card */}
          <div className={`relative group transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-200 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-amber-100 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-amber-900">{data.mission.title}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">{data.mission.text}</p>
              
              {/* Decorative wheat elements */}
              <div className="absolute bottom-4 right-4 opacity-10">
                <svg width="60" height="60" viewBox="0 0 60 60">
                  {[...Array(3)].map((_, i) => (
                    <ellipse key={i} cx={20 + i * 10} cy="30" rx="4" ry="15" fill="#D4A574" transform={`rotate(${-10 + i * 10} ${20 + i * 10} 30)`} />
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Vision Card */}
          <div className={`relative group transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-2xl transform -rotate-1 group-hover:-rotate-2 transition-transform" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-amber-100 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-amber-900">{data.vision.title}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">{data.vision.text}</p>
              
              {/* Decorative wheat elements */}
              <div className="absolute bottom-4 right-4 opacity-10">
                <svg width="60" height="60" viewBox="0 0 60 60">
                  {[...Array(3)].map((_, i) => (
                    <ellipse key={i} cx={20 + i * 10} cy="30" rx="4" ry="15" fill="#D4A574" transform={`rotate(${-10 + i * 10} ${20 + i * 10} 30)`} />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          {data.values.map((value, index) => (
            <div
              key={index}
              className="group bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-amber-100 hover:bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <value.icon className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="font-bold text-amber-900 mb-2">{value.title}</h4>
              <p className="text-sm text-gray-600">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutGoal;