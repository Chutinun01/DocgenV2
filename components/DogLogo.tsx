import React from 'react';

export const DogLogo = ({ className = "w-full h-full" }: { className?: string }) => {
  return (
    <img 
      src="/logo.png" 
      alt="App Logo" 
      className={`object-contain ${className}`}
    />
  );
};

export default DogLogo;