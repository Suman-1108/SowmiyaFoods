import React from "react";
import { Sparkles } from "lucide-react";

const marqueeItems = [
  "சத்தம் சகம் தரும் - Sowmiya Foods",
  "தரமும் அம்மாவின் கைமணமும் ஒன்றிணைந்ததே... ராமர் பிராண்ட்!",
  "ஆரோக்கியமே செல்வம், Sowmiya Foods",
  "இயற்கையான சுவை, தரமான பொருட்கள்",
  "சத்தான உணவு, சிறந்த வாழ்க்கை",
  "Sowmiya Foods - உங்கள் வீட்டு சமையலுக்கு நல்ல தேர்வு",
];

const TextMarquee = () => {
  return (
    <div className="w-full bg-blue-900 py-3 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {/* First set of items */}
        {marqueeItems.map((item, index) => (
          <div
            key={`first-${index}`}
            className="flex items-center mx-8 text-white text-sm sm:text-base font-medium"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mr-2 flex-shrink-0" />
            <span>{item}</span>
          </div>
        ))}
        {/* Duplicate set for seamless loop */}
        {marqueeItems.map((item, index) => (
          <div
            key={`second-${index}`}
            className="flex items-center mx-8 text-white text-sm sm:text-base font-medium"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mr-2 flex-shrink-0" />
            <span>{item}</span>
          </div>
        ))}
        {/* Third set for smoother loop */}
        {marqueeItems.map((item, index) => (
          <div
            key={`third-${index}`}
            className="flex items-center mx-8 text-white text-sm sm:text-base font-medium"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mr-2 flex-shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextMarquee;