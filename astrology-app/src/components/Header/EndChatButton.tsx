import { useRouter } from 'next/navigation';
import { useAuthStatus } from '@/hooks/useAuthStatus';

export default function EndChatButton() {
  const router = useRouter();
  const { user } = useAuthStatus();

  const handleEndChat = () => {
    if (user?.uid) {
      const storageKey = `chat_history_${user.uid}`;
      localStorage.removeItem(storageKey);
    }
    router.push('/');
  };

  return (
    <button 
      onClick={handleEndChat}
      className="flex items-center justify-center gap-2 px-3 h-[34px] border border-[#f4a86a] rounded-lg text-[#f4a86a]"
    >
      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0z" fill="none"></path>
        <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
      </svg>
    </button>
  );
}