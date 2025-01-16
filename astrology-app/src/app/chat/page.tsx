'use client';

import React, { useMemo } from 'react';
import ChatContent from '@/components/Chat/ChatContent';
// import ChatContentDemo from '@/components/Chat/ChatContentDemo';
import StarField from '@/components/StarField';
import PageTransition from '@/components/PageTransition';

const MemoizedStarField = React.memo(StarField);

export default function ChatPage() {
  // const [isDemo, setIsDemo] = useState(false);

  // useEffect(() => {
  //   const storedChart = localStorage.getItem('tempBirthChart');
  //   if (storedChart) {
  //     setIsDemo(true);
  //   }
  // }, []);

  const starFieldProps = useMemo(() => ({
    starCount: 75,
    largeStarChance: 0.075,
    maxStarSize: 2.5,
    safeZone: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  }), []);

  return (
    <PageTransition>
      <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-[#220038] via-[#150030] to-[#220038] text-white">
        <MemoizedStarField {...starFieldProps} />
        <ChatContent />
        {/* {isDemo ? <ChatContentDemo /> : <ChatContent />} */}
      </div>
    </PageTransition>
  );
}
