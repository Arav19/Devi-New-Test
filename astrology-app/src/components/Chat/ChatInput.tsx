'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, SendHorizonal } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  "Shaadi arrange hogi ya love?",
  "Career mein success kab milega?",
  "Anxiety ka kya upaay hai?",
  "Partner ko trust karna chahiye?",
  "Love life ka future kya hai?",
  "Foreign travel kab karu?",
  "Mera promotion kab hoga?",
  "Ex wapas aayega kya?",
  "Mere andar negative kya hai?",
  "Meri health kab improve hogi?",
  "Meri shaadi kab hogi?",
  "Mera lucky number kya hai?",
  "Mere hidden talents kya hai?",
  "Sex life ka future kaisa hoga?",
  "Mera partner compatible hai kya?",
  "Crorepati banunga kya?",
  "Mera lucky colour kaunsa hai?",
  "Mere andar positive kya hai?",
  "Business start karna chahiye?",
];
const TYPING_SPEED = 80;
const PAUSE_DURATION = 1500;

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content changes
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  useEffect(() => {
    if (isInputFocused) {
      setCurrentPlaceholder(SUGGESTIONS[currentSuggestionIndex]);
      return;
    }

    let currentText = '';
    let currentIndex = 0;
    let isTyping = true;
    let timeoutId: NodeJS.Timeout;

    const animatePlaceholder = async () => {
      const currentSuggestion = SUGGESTIONS[currentSuggestionIndex];
      
      if (isTyping) {
        if (currentIndex < currentSuggestion.length) {
          currentText += currentSuggestion[currentIndex];
          setCurrentPlaceholder(currentText);
          currentIndex++;
          timeoutId = setTimeout(animatePlaceholder, TYPING_SPEED);
        } else {
          isTyping = false;
          timeoutId = setTimeout(animatePlaceholder, PAUSE_DURATION);
        }
      } else {
        if (currentText.length > 0) {
          currentText = currentText.slice(0, -1);
          setCurrentPlaceholder(currentText);
          timeoutId = setTimeout(animatePlaceholder, TYPING_SPEED);
        } else {
          isTyping = true;
          currentIndex = 0;
          setCurrentSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS.length);
          timeoutId = setTimeout(animatePlaceholder, TYPING_SPEED);
        }
      }
    };

    timeoutId = setTimeout(animatePlaceholder, TYPING_SPEED);
    return () => clearTimeout(timeoutId);
  }, [currentSuggestionIndex, isInputFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="relative w-full rounded-lg border border-purple-500/20 bg-purple-900/20 flex items-center focus-within:ring-2 focus-within:ring-purple-500/50 transition-all duration-200">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        placeholder={currentPlaceholder}
        className="w-[93%] resize-none bg-transparent px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none disabled:opacity-50"
        rows={1}
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={isLoading || !message.trim()}
        className="w-[5%] min-w-[40px] h-[40px] mx-[1%] text-yellow-400 hover:text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 mx-auto animate-spin" />
        ) : (
          <SendHorizonal className="w-6 h-6 mx-auto" />
        )}
      </button>
    </div>
  );
}
