import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

export default function LoginButton() {
  const { user, isRegistered, loading } = useAuthStatus();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return null;
  }

  // Only show Logout if user is both authenticated AND registered
  if (user && isRegistered) {
    return (
      <button
        onClick={handleLogout}
        className="w-full border-2 border-[#342362] text-[#342362] py-3 rounded-lg hover:bg-[#342362] hover:text-white transition-colors"
      >
        Logout
      </button>
    );
  }

  // Show Login for everyone else (unauthenticated OR unregistered)
  return (
    <button
      onClick={() => router.push('/login')}
      className="w-full border-2 border-[#342362] text-[#342362] py-3 rounded-lg hover:bg-[#342362] hover:text-white transition-colors"
    >
      Login
    </button>
  );
}
