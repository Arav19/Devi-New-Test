interface ChatMessageProps {
  message: {
    content: string;
    role: 'user' | 'assistant';
  };
  isTyping?: boolean;
}

export default function ChatMessage({ message, isTyping }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} max-w-full`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 overflow-hidden ${
          isUser
            ? 'bg-purple-800/70 border border-purple-500/20 text-gray-100'
            : 'bg-white/90 border border-purple-500/20 text-black'
        }`}
      >
        {isTyping ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400/70 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-yellow-400/70 rounded-full animate-bounce [animation-delay:-.3s]" />
            <div className="w-2 h-2 bg-yellow-400/70 rounded-full animate-bounce [animation-delay:-.5s]" />
          </div>
        ) : (
          <p className="text-base leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.content}</p>
        )}
      </div>
    </div>
  );
}
