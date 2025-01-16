'use client';

export default function RangoliPattern() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
      <div className="relative w-[120vh] h-[120vh] max-w-[100vw] max-h-[100vw] animate-spin-slow mt-16">
        <svg viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M400 50 L400 750 M50 400 L750 400 M168 168 L632 632 M632 168 L168 632" 
            stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="400" cy="400" r="300" stroke="white" strokeWidth="2" />
          <circle cx="400" cy="400" r="200" stroke="white" strokeWidth="2" />
          <path d="M400 100 Q 550 400 400 700 Q 250 400 400 100" 
            stroke="white" strokeWidth="2" fill="none" />
          <path d="M100 400 Q 400 250 700 400 Q 400 550 100 400" 
            stroke="white" strokeWidth="2" fill="none" />
          <path d="M250 250 Q 400 300 550 250 Q 500 400 550 550 Q 400 500 250 550 Q 300 400 250 250" 
            stroke="white" strokeWidth="2" fill="none" />
        </svg>
      </div>
    </div>
  );
};

