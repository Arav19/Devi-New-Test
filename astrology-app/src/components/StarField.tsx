'use client';

import React from 'react';

interface StarFieldProps {
  starCount?: number;
  safeZone?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  largeStarChance?: number;  // 0 to 1
  maxStarSize?: number;
}

export default function StarField({ 
  starCount = 300,
  safeZone = {
    top: 30,
    bottom: 45,
    left: 25,
    right: 75
  },
  largeStarChance = 0.1,
  maxStarSize = 3
}: StarFieldProps) {
  const isSafeZone = (x: number, y: number) => {
    return !(x > safeZone.left && x < safeZone.right && y > safeZone.top && y < safeZone.bottom);
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(starCount)].map((_, i) => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        if (!isSafeZone(x, y)) return null;
        
        const size = Math.random() * maxStarSize + 1;
        const isLarge = Math.random() > (1 - largeStarChance);
        
        return (
          <div
            key={i}
            className="absolute animate-twinkle"
            style={{
              width: `${isLarge ? size * 2 : size}px`,
              height: `${isLarge ? size * 2 : size}px`,
              top: `${y}%`,
              left: `${x}%`,
              animationDelay: `${Math.random() * 5}s`,
              background: isLarge 
                ? 'radial-gradient(circle, rgba(255,215,0,1) 0%, rgba(255,223,186,0.8) 50%, rgba(255,255,255,0) 100%)'
                : 'radial-gradient(circle, rgba(255,223,186,1) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
              boxShadow: isLarge 
                ? '0 0 8px rgba(255,215,0,0.8), 0 0 12px rgba(255,215,0,0.4)'
                : '0 0 4px rgba(255,223,186,0.8)',
              borderRadius: '50%',
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        );
      })}
    </div>
  );
};
