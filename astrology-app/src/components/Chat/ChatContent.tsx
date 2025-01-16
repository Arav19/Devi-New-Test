'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import ChatMessage from '@/components/Chat/ChatMessage';
import ChatInput from '@/components/Chat/ChatInput';
import { ChatMessage as ChatMessageType, GPTMessage } from '@/types';
import { getDoc, doc, collection, addDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { X } from 'lucide-react';
import Image from 'next/image';

// Helper functions
const shouldClearChat = (chatStartTime: number): boolean => {
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  const currentTime = Date.now();
  return (currentTime - chatStartTime) >= SIX_HOURS;
};

const getChatHistory = (userId: string): { messages: ChatMessageType[], startTime: number } => {
  if (typeof window === 'undefined' || !userId) return { messages: [], startTime: Date.now() };
  
  const storageKey = `chat_history_${userId}`;
  const timeKey = `chat_start_time_${userId}`;
  
  const stored = localStorage.getItem(storageKey);
  const startTime = parseInt(localStorage.getItem(timeKey) || Date.now().toString());
  
  return {
    messages: stored ? JSON.parse(stored) : [],
    startTime
  };
};

const saveChatHistory = (messages: ChatMessageType[], userId: string, startTime?: number) => {
  if (typeof window === 'undefined' || !userId) return;
  
  const storageKey = `chat_history_${userId}`;
  const timeKey = `chat_start_time_${userId}`;
  
  localStorage.setItem(storageKey, JSON.stringify(messages));
  if (startTime) {
    localStorage.setItem(timeKey, startTime.toString());
  }
};

export default function ChatContent() {
  const router = useRouter();
  const { user, isRegistered, loading } = useAuthStatus();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialTyping, setIsInitialTyping] = useState(false);
  const initialGreetingSent = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatStartTime, setChatStartTime] = useState<number>(Date.now());
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const lastSavedMessageCount = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveChatToDatabase = async (
    messages: ChatMessageType[], 
    reason: 'timeout' | 'manual' | 'refresh' | 'auto',
    startTime: number
  ) => {
    if (!user || messages.length === 0) return;

    try {
      if (!currentChatId) {
        const chatRef = await addDoc(collection(db, 'chats'), {
          userId: user.uid,
          createdAt: new Date(startTime).toISOString(),
          lastUpdated: new Date().toISOString(),
          endReason: reason,
          messages: messages,
          chatStartTime: startTime,
          isActive: true,
          saveCount: 1
        });
        console.log('New chat created:', chatRef.id);
        lastSavedMessageCount.current = messages.length;
        setCurrentChatId(chatRef.id);
        localStorage.setItem(`current_chat_${user.uid}`, chatRef.id);
      } else {
        await updateDoc(doc(db, 'chats', currentChatId), {
          userId: user.uid,
          lastUpdated: new Date().toISOString(),
          endReason: reason,
          messages: messages,
          isActive: reason === 'auto',
          saveCount: increment(1)
        });
        console.log('Chat updated:', currentChatId, 'Reason:', reason);
        lastSavedMessageCount.current = messages.length;
      }
    } catch (error) {
      console.error('Save failed:', error, {
        currentChatId,
        userId: user.uid,
        reason,
        messageCount: messages.length
      });
    }
  };

  // Load chat history and send initial greeting
  useEffect(() => {
    if (loading) return;
    
    if (!user || !isRegistered) {
      router.push('/login?redirect=chat');
      return;
    }

    const loadChatAndGreet = async () => {
      const { messages: existingMessages, startTime } = getChatHistory(user.uid);
      
      if (shouldClearChat(startTime) && existingMessages.length > 0) {
        await saveChatToDatabase(existingMessages, 'timeout', startTime);
        localStorage.removeItem(`chat_history_${user.uid}`);
        localStorage.removeItem(`chat_start_time_${user.uid}`);
        localStorage.removeItem(`current_chat_${user.uid}`);
        setCurrentChatId(null);
        initialGreetingSent.current = false;
      } else if (existingMessages.length > 0) {
        setMessages(existingMessages);
        setChatStartTime(startTime);
        const storedChatId = localStorage.getItem(`current_chat_${user.uid}`);
        if (storedChatId) {
          setCurrentChatId(storedChatId);
          console.log('Restored chat ID:', storedChatId);
        }
        initialGreetingSent.current = true;
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const { firstName, preferredLanguage } = userData;

        setIsInitialTyping(true);
        
        setTimeout(() => {
          if (!initialGreetingSent.current) {
            setIsInitialTyping(false);
            
            const greeting = preferredLanguage === 'hinglish' 
              ? `Namaste ${firstName}🙏\nMain hoon Devi, aapki personal Vedic astrologer. Chahe pyaar, career, health, ya personal growth ho, aap mujhse kuch bhi pooch sakte hain😊\nChaliye, shuruaat karein…`
              : `Hello ${firstName}🙏\nI'm Devi, your personal Vedic astrologer. Which secrets of your stars would you like to explore today? Whether it's love, career, health, or personal growth, feel free to ask me anything😊\nLet's begin...`;

            const greetingMessage: ChatMessageType = {
              id: Date.now().toString(),
              content: greeting,
              role: 'assistant',
            };
            
            const newStartTime = Date.now();
            setChatStartTime(newStartTime);
            setMessages([greetingMessage]);
            saveChatHistory([greetingMessage], user.uid, newStartTime);
            initialGreetingSent.current = true;
          }
        }, 5000);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    loadChatAndGreet();
  }, [user, isRegistered, loading, router]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (user && messages.length > 0) {
      saveChatHistory(messages, user.uid, chatStartTime);
    }
  }, [messages, user, chatStartTime]);

  const handleGetResponse = async (
    message: string, 
    currentMessages: ChatMessageType[]
  ) => {
    setIsLoading(true);
    
    try {
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
          userId: user?.uid,
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

      await saveChatToDatabase([...currentMessages, assistantMessage], 'auto', chatStartTime);
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

  const handleEndChat = async () => {
    try {
      if (messages.length > 0) {
        await saveChatToDatabase(messages, 'manual', chatStartTime);
      }
      
      if (user?.uid) {
        localStorage.removeItem(`chat_history_${user.uid}`);
        localStorage.removeItem(`chat_start_time_${user.uid}`);
        localStorage.removeItem(`current_chat_${user.uid}`);
      }
      setCurrentChatId(null);

      router.push('/');
    } catch (error) {
      console.error('Error ending chat:', error);
      router.push('/');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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

          <div>
            {/* <GoldenButton 
              variant="outline" 
              className="text-sm"
              width="px-3"
              height="py-1.5"
            >
              Free Trial
            </GoldenButton> */}
          </div>
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
