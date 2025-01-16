'use client';

import { Menu } from 'lucide-react';
// import GoldenButton from './GoldenButton';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-[#220038]/10 backdrop-blur-sm border-b border-purple-500/20 z-40">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-full bg-purple-900/50 backdrop-blur-sm border border-purple-500/20 hover:bg-purple-900/70 transition-colors"
        >
          <Menu className="w-6 h-6 text-yellow-400" />
        </button>
        {/* <div>
          <GoldenButton 
            variant="outline" 
            className="text-sm"
            width="px-3"
            height="py-1.5"
          >
            Free Trial
          </GoldenButton>
        </div> */}
      </div>
    </div>
  );
};
