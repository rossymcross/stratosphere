import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export const AnimatedBackground = () => {
  // Generate static star positions to avoid hydration mismatches
  
  const smallStars = useMemo(() => Array.from({ length: 500 }).map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    opacity: Math.random() * 0.5 + 0.5
  })), []);

  const mediumStars = useMemo(() => Array.from({ length: 200 }).map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 4}s`,
    opacity: Math.random() * 0.5 + 0.5
  })), []);

  const largeStars = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    opacity: Math.random() * 0.4 + 0.6
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#020B14]">
      {/* Deep Space Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#041C2C] via-[#020c17] to-[#000000] opacity-90" />

      {/* Stars Layer - Rotating */}
      <motion.div 
        className="absolute inset-[-50%] z-0"
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 400, 
          ease: "linear", 
          repeat: Infinity 
        }}
      >
        {smallStars.map((star, i) => (
          <div
            key={`small-${i}`}
            className="absolute w-[1.5px] h-[1.5px] bg-white rounded-full animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              opacity: star.opacity,
              animationDuration: '4s',
              animationDelay: star.animationDelay
            }}
          />
        ))}
        {mediumStars.map((star, i) => (
          <div
            key={`med-${i}`}
            className="absolute w-[2.5px] h-[2.5px] bg-white rounded-full animate-pulse shadow-[0_0_4px_rgba(255,255,255,0.6)]"
            style={{
              top: star.top,
              left: star.left,
              opacity: star.opacity,
              animationDuration: '6s',
              animationDelay: star.animationDelay
            }}
          />
        ))}
        {largeStars.map((star, i) => (
          <div
            key={`large-${i}`}
            className="absolute w-[3.5px] h-[3.5px] bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            style={{
              top: star.top,
              left: star.left,
              opacity: star.opacity,
              animationDuration: '3s',
              animationDelay: star.animationDelay
            }}
          />
        ))}
      </motion.div>

      {/* Galaxy Nebulas */}
      {/* Blob 1 (Teal - Top Left) */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[100px] animate-drift-slow opacity-40"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#71D2EB] to-transparent animate-pulse-slow" />
      </div>
      
      {/* Blob 2 (Deep Blue/Purple - Center Right) */}
      <div 
        className="absolute top-[30%] right-[-10%] w-[700px] h-[700px] rounded-full mix-blend-screen filter blur-[120px] animate-drift-medium opacity-30"
      >
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#4a00e0] via-[#8e2de2] to-transparent opacity-40 animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Blob 3 (Coral/Pink - Bottom Left) */}
      <div 
        className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[100px] animate-drift-slow opacity-30"
        style={{ animationDelay: '2s' }}
      >
         <div className="w-full h-full rounded-full bg-gradient-to-t from-[#FFBC7D] to-[#E21C21] opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Blob 4 (Center Galaxy Core) */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full mix-blend-overlay filter blur-[120px] opacity-10 pointer-events-none"
      >
        <div className="w-full h-full rounded-full bg-white animate-pulse-slow" />
      </div>
    </div>
  );
};
