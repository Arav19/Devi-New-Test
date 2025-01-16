import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useAuthStatus() {
  const { user, loading: authLoading } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRegistration() {
      if (!user) {
        setIsRegistered(false);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setIsRegistered(userDoc.exists());
      } catch (error) {
        console.error('Error checking registration:', error);
        setIsRegistered(false);
      } finally {
        setLoading(false);
      }
    }

    checkRegistration();
  }, [user]);

  return { user, isRegistered, loading: loading || authLoading };
}