'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import TopBar from '@/components/TopBar';

const menuItems = [
  { label: 'Home', href: '#' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' }
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TopBar onMenuClick={() => setIsOpen(true)} />

      {/* Overlay Menu */}
      <div className={`fixed inset-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 p-2 text-yellow-400 hover:text-yellow-300"
          >
            <X className="w-6 h-6" />
          </button>
          
          <nav className="h-full flex items-center justify-center">
            <ul className="space-y-8 text-center">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-2xl text-yellow-100 hover:text-yellow-400 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}