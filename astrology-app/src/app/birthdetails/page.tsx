'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as mapboxgl from 'mapbox-gl';
import StarField from '@/components/StarField';
import React from 'react';
import { useRouter } from 'next/navigation';

const MemoizedStarField = React.memo(StarField);

interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function BirthDetails() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    birthTime: '',
  });

  const handleLocationSelect = (result: any) => {
    setLocation({
      name: result.place_name,
      latitude: result.center[1],
      longitude: result.center[0]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!formData.firstName || !formData.lastName || !formData.birthDate || !formData.birthTime || !location) {
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const birthChartResponse = await fetch('/api/birthchart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.birthDate,
          time: formData.birthTime,
          location: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        })
      });

      if (!birthChartResponse.ok) {
        throw new Error('Failed to generate birth chart');
      }

      const birthChartDetails = await birthChartResponse.json();
      
      // Store birth chart in localStorage
      localStorage.setItem('tempBirthChart', JSON.stringify({
        chart: birthChartDetails,
        name: `${formData.firstName} ${formData.lastName}`,
        timestamp: new Date().getTime()
      }));

      // Redirect to chat
      router.push('/chat');

    } catch (error) {
      console.error('Birth chart error:', error);
      setError('Failed to generate birth chart');
    } finally {
      setLoading(false);
    }
  };

  const initializeGeocoder = () => {
    if (!MAPBOX_TOKEN || !geocoderContainerRef.current) return;

    if (geocoderContainerRef.current) {
      geocoderContainerRef.current.innerHTML = '';
    }

    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapboxgl as any,
      types: 'place',
    });

    geocoder.on('result', (e) => handleLocationSelect(e.result));
    geocoder.addTo(geocoderContainerRef.current);
    geocoderRef.current = geocoder;
  };

  useEffect(() => {
    initializeGeocoder();
  }, []);

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

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#220038] via-[#150030] to-[#220038] text-white overflow-hidden">
      <MemoizedStarField {...starFieldProps} />
      
      <main className="relative z-50 px-4 pt-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] text-transparent bg-clip-text mb-2">
              Enter Birth Details
            </h1>
            <p className="text-gray-400">
              Help us create your kundli for accurate readings
            </p>
          </div>
          
          <div className="bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-white placeholder:text-white/50 focus:outline-none focus:border-purple-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-white placeholder:text-white/50 focus:outline-none focus:border-purple-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Birth Date</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Birth Time</label>
                  <input
                    type="time"
                    required
                    value={formData.birthTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Birth Place</label>
                <div 
                  ref={geocoderContainerRef} 
                  className={`geocoder-container ${attemptedSubmit && !location ? 'border-red-500' : ''}`}
                />
              </div>

              {attemptedSubmit && error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full px-8 py-2.5 rounded-lg font-medium transition-all duration-200
                  ${!loading 
                    ? 'bg-purple-800/80 hover:bg-purple-800 text-white' 
                    : 'bg-purple-800/40 text-white/50 cursor-not-allowed'
                  }
                `}
              >
                {loading ? 'Generating...' : 'Get Reading'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}