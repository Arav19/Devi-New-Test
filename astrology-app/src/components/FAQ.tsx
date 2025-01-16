'use client';

import { useState } from 'react';

interface FAQProps {
  question: string;
  answer: string;
}

export default function FAQ({ question, answer }: FAQProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-purple-700/30">
      <button
        className="w-full py-4 text-left flex justify-between items-center group"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <span className="text-purple-100 group-hover:text-purple-50 transition-colors">
          {question}
        </span>
        <span 
          className={`text-purple-400 transition-transform duration-200 ${
            isOpen ? 'rotate-0' : 'rotate-90'
          }`}
        >
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div 
          id={`faq-answer-${question.toLowerCase().replace(/\s+/g, '-')}`}
          className="pb-4 text-purple-300 animate-fadeIn"
        >
          {answer}
        </div>
      )}
    </div>
  );
}