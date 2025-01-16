'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RegistrationForm from '@/components/Auth/RegistrationForm';
import StarField from '@/components/StarField';
// import Image from 'next/image';
import React from 'react';

const MemoizedStarField = React.memo(StarField);

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');

  // Memoize the StarField props
  const starFieldProps = useMemo(() => ({
    starCount: 50,
    largeStarChance: 0.05,
    maxStarSize: 2,
    safeZone: {
      top: 25,
      bottom: 50,
      left: 20,
      right: 80
    }
  }), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phone = params.get('phone');
    if (phone) {
      setPhoneNumber(phone);
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#220038] via-[#150030] to-[#220038] text-white overflow-hidden">
      <MemoizedStarField {...starFieldProps} />
      
      <main className="relative z-50 px-4 pt-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] text-transparent bg-clip-text mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-400">
              A few more details to get you started
            </p>
          </div>
          
          <div className="bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
            <RegistrationForm phoneNumber={phoneNumber} userId={user.uid} />
          </div>
        </div>
      </main>
    </div>
  );
}