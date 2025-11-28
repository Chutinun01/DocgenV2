import React from 'react';

export const DogLogo = ({ className = "w-full h-full" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      
      {/* Ears (Black Triangles with rounded corners) */}
      <path d="M10 50 Q 5 20 40 10 L 80 50 Z" fill="black" />
      <path d="M190 50 Q 195 20 160 10 L 120 50 Z" fill="black" />

      {/* Head Background (White) */}
      <circle cx="100" cy="110" r="60" fill="white" />

      {/* Face Features Container */}
      
      {/* Eyes (Black Circles) */}
      <circle cx="65" cy="95" r="12" fill="black" />
      <circle cx="135" cy="95" r="12" fill="black" />

      {/* Nose (Black Triangle/Heart shape) */}
      <path d="M85 130 Q 100 145 115 130 L 100 115 Z" fill="black" stroke="black" strokeWidth="4" strokeLinejoin="round" />

      {/* Mouth (W shape) */}
      <path d="M70 145 Q 85 160 100 145 Q 115 160 130 145" fill="none" stroke="black" strokeWidth="6" strokeLinecap="round" />

      {/* Document Body (Grey Rectangle below chin) */}
      <rect x="65" y="160" width="70" height="80" fill="#9CA3AF" />
      
      {/* Document Lines (White) */}
      <line x1="75" y1="175" x2="125" y2="175" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <line x1="75" y1="190" x2="125" y2="190" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <line x1="75" y1="205" x2="110" y2="205" stroke="white" strokeWidth="4" strokeLinecap="round" />

    </svg>
  );
};

export default DogLogo;