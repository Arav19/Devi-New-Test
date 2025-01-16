'use client';

import Image from 'next/image';

export default function Logo() {
  return (
    <div className="w-48 h-48 mx-auto mb-4 relative animate-float">
      <Image 
        src="/devi-logo.png"
        alt="Ask Devi Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}