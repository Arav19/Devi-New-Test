'use client';

import { useEffect, useState } from 'react';

export default function OrientationLock() {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (window.innerWidth > 768) return; // Only for mobile
      setIsLandscape(window.orientation === 90 || window.orientation === -90);
    };

    window.addEventListener('orientationchange', checkOrientation);
    checkOrientation(); // Initial check

    return () => window.removeEventListener('orientationchange', checkOrientation);
  }, []);

  if (!isLandscape) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#220038] via-[#150030] to-[#220038] text-white z-[9999] 
      flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 mb-4 animate-bounce">
        📱
      </div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] 
        text-transparent bg-clip-text mb-2">
        Please Rotate Your Device
      </h2>
      <p className="text-sm text-gray-400 mt-2 backdrop-blur-sm">
        This app works best in portrait mode
      </p>
    </div>
  );
}