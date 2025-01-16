'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ChatMessage from '@/components/Chat/ChatMessage';
import ChatInput from '@/components/Chat/ChatInput';
import { ChatMessage as ChatMessageType, GPTMessage } from '@/types';
import { X } from 'lucide-react';
import Image from 'next/image';

export default function ChatContentDemo() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialTyping, setIsInitialTyping] = useState(false);
  const initialGreetingSent = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const storedChart = localStorage.getItem('tempBirthChart');
    if (!storedChart) {
      router.push('/');
      return;
    }

    const sendInitialGreeting = () => {
      setIsInitialTyping(true);
      
      setTimeout(() => {
        if (!initialGreetingSent.current) {
          setIsInitialTyping(false);
          
          const greeting = "Hello! I'm Devi, your personal Vedic astrologer. I've analyzed your birth chart and I'm ready to provide insights about your life. Feel free to ask me anything about your career, relationships, or personal growth 😊";

          const greetingMessage: ChatMessageType = {
            id: Date.now().toString(),
            content: greeting,
            role: 'assistant',
          };
          
          setMessages([greetingMessage]);
          initialGreetingSent.current = true;
        }
      }, 2000);
    };

    sendInitialGreeting();
  }, [router]);

  const handleGetResponse = async (
    message: string, 
    currentMessages: ChatMessageType[]
  ) => {
    setIsLoading(true);
    
    try {
      const storedChart = localStorage.getItem('tempBirthChart');
      if (!storedChart) throw new Error('Birth chart not found');
      
      const { chart, name } = JSON.parse(storedChart);
      const gptMessages: GPTMessage[] = currentMessages.map(({ content, role }) => ({
        content,
        role
      }));

      const response = await fetch('/api/devi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          messages: gptMessages,
          birthChart: chart,
          name,
          isDemo: true
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const assistantMessage: ChatMessageType = {
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const newMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
    };

    setMessages(prev => [...prev, newMessage]);
    handleGetResponse(message, [...messages, newMessage]);
  };

  const handleEndChat = () => {
    localStorage.removeItem('tempBirthChart');
    router.push('/');
  };

  return (
    <div className="flex flex-col h-[100dvh] fixed inset-0 overscroll-none">
      <div className="fixed top-0 left-0 right-0 h-16 
        bg-gradient-to-r from-purple-950/80 via-[#220038]/80 to-purple-950/80 
        backdrop-blur-sm border-b border-purple-500/20 z-40">
        <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={handleEndChat}
            className="p-2 rounded-full bg-purple-900/50 backdrop-blur-sm border border-purple-500/20 hover:bg-purple-900/70 transition-colors"
          >
            <X className="w-6 h-6 text-yellow-400" />
          </button>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image
              src="/devi-logo.png"
              alt="Logo"
              width={60}
              height={60}
              className="w-auto h-12"
            />
          </div>

          <div />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-4 overscroll-contain">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isInitialTyping && (
            <ChatMessage 
              message={{ content: '', role: 'assistant' }} 
              isTyping={true} 
            />
          )}
          
          {isLoading && (
            <ChatMessage 
              message={{ content: '', role: 'assistant' }} 
              isTyping={true} 
            />
          )}
          
          <span ref={messagesEndRef} className="h-0" />
        </div>
      </div>

      <div className="border-t border-purple-500/20 bg-[#220038]/10 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
