import React from 'react';

export default function CreditsButton() {
  return (
    <button className="flex items-center justify-center gap-2 px-3 h-[34px] border border-[#ffa963] rounded-lg text-[#f8b078] shadow-[-2px_2px_0px_rgba(0,0,0,0.25)]">
      <span className="text-sm">5</span>
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0z" fill="none"></path>
        <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"></path>
      </svg>
    </button>
  );
}