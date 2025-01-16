import React from 'react';
import EndChatButton from './EndChatButton';
import CreditsButton from './CreditsButton';
import HeaderImage from './HeaderImage';

export default function Header() {
  return (
    <header className="sticky top-0 h-[72px] bg-[#311e52] shadow-[2px_-2px_10px_rgba(3,3,3,0.1)] px-5">
      <div className="flex items-center justify-between h-full">
        <EndChatButton />
        <HeaderImage />
        <CreditsButton />
      </div>
    </header>
  );
}