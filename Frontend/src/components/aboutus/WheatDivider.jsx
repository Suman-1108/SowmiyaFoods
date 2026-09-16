import React from "react";

const WheatDivider = ({ flip = false }) => {
  return (
    <div className={`relative py-8 overflow-hidden ${flip ? "rotate-180" : ""}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="w-full h-24"
      >
        <defs>
          <linearGradient id="wheatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4A574" />
            <stop offset="50%" stopColor="#E8C9A0" />
            <stop offset="100%" stopColor="#D4A574" />
          </linearGradient>
        </defs>
        
        {/* Left wheat ears */}
        {[...Array(6)].map((_, i) => (
          <g key={`left-${i}`} transform={`translate(${i * 40 + 20}, 60)`}>
            <ellipse cx="0" cy="-30" rx="4" ry="12" fill="url(#wheatGradient)" opacity="0.8" />
            <ellipse cx="0" cy="-10" rx="5" ry="14" fill="url(#wheatGradient)" opacity="0.9" />
            <ellipse cx="0" cy="12" rx="5" ry="14" fill="url(#wheatGradient)" opacity="0.9" />
            <ellipse cx="0" cy="34" rx="4" ry="12" fill="url(#wheatGradient)" opacity="0.8" />
            <line x1="0" y1="-40" x2="0" y2="50" stroke="#B8956A" strokeWidth="2" />
          </g>
        ))}
        
        {/* Center flour bag/octa shape */}
        <g transform="translate(600, 60)">
          <polygon
            points="0,-30 26,-10 26,20 0,40 -26,20 -26,-10"
            fill="#FFF8E7"
            stroke="#D4A574"
            strokeWidth="2"
          />
          <text
            x="0"
            y="8"
            textAnchor="middle"
            className="text-[10px] fill-amber-700 font-bold"
            style={{ fontSize: "10px" }}
          >
            RAMAR
          </text>
        </g>
        
        {/* Right wheat ears */}
        {[...Array(6)].map((_, i) => (
          <g key={`right-${i}`} transform={`translate(${1140 - i * 40}, 60)`}>
            <ellipse cx="0" cy="-30" rx="4" ry="12" fill="url(#wheatGradient)" opacity="0.8" />
            <ellipse cx="0" cy="-10" rx="5" ry="14" fill="url(#wheatGradient)" opacity="0.9" />
            <ellipse cx="0" cy="12" rx="5" ry="14" fill="url(#wheatGradient)" opacity="0.9" />
            <ellipse cx="0" cy="34" rx="4" ry="12" fill="url(#wheatGradient)" opacity="0.8" />
            <line x1="0" y1="-40" x2="0" y2="50" stroke="#B8956A" strokeWidth="2" />
          </g>
        ))}
        
        {/* Decorative line */}
        <line x1="0" y1="60" x2="1200" y2="60" stroke="#E8C9A0" strokeWidth="1" strokeDasharray="5,5" opacity="0.5" />
      </svg>
    </div>
  );
};

export default WheatDivider;