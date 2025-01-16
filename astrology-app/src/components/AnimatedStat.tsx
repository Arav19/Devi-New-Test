'use client';

import { useState, useEffect } from 'react';

interface AnimatedStatProps {
  baselineValue: number;
  maxValue: number;
  label: string;
  minInterval?: number; // in milliseconds
  maxInterval?: number; // in milliseconds
}

export default function AnimatedStat({ 
  baselineValue, 
  maxValue, 
  label,
  minInterval = 10000,  // default 10000ms
  maxInterval = 120000  // default 20000ms
}: AnimatedStatProps) {
  const [count, setCount] = useState(baselineValue);

  useEffect(() => {
    if (count >= maxValue) return;

    const timeout = setTimeout(() => {
      setCount(prev => prev + 1);
    }, Math.random() * (maxInterval - minInterval) + minInterval);

    return () => clearTimeout(timeout);
  }, [count, maxValue, minInterval, maxInterval]);

  return (
    <div className="text-center">
      <div className="text-4xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FDB931] bg-clip-text text-transparent mb-2 duration-300">
        {count.toLocaleString()}+
      </div>
      <div className="text-purple-200">{label}</div>
    </div>
  );
}