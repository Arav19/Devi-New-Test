'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as mapboxgl from 'mapbox-gl';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { track } from '@vercel/analytics';
import { trackEvent } from '@/hooks/useAnalytics';

interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

interface RegistrationFormProps {
  phoneNumber: string;
  userId: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function RegistrationForm({ phoneNumber, userId }: RegistrationFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectToChatPage = searchParams.get('redirect') === 'chat';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const [unknownBirthTime, setUnknownBirthTime] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    birthTime: '',
    gender: '',
    preferredLanguage: '',
    relationshipStatus: '',
    occupation: ''
  });

  const handleLocationSelect = (result: any) => {
    setLocation({
      name: result.place_name,
      latitude: result.center[1],
      longitude: result.center[0]
    });
  };

  const isStep1Valid = () => {
    return formData.firstName && 
           formData.lastName && 
           formData.birthDate && 
           formData.birthTime && 
           location;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (isStep1Valid()) {
      setStep(2);
      setAttemptedSubmit(false);
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleSubmit = async (e: React.FormEvent, isSkip = false) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    console.log('submitting');

    // If it's a skip submission, bypass the validation
    if (!isSkip && (!formData.gender || !formData.relationshipStatus || !formData.occupation)) {
      console.log('stuff not set');
      setError('Please fill in all required fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // For skip, use updated form data
      const submissionData = isSkip ? {
        ...formData,
        gender: 'other',
        preferredLanguage: 'hinglish',
        relationshipStatus: 'other',
        occupation: 'other'
      } : formData;

      // Calculate birth chart using API route
      const birthChartResponse = await fetch('/api/birthchart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: submissionData.birthDate,
          time: submissionData.birthTime,
          location: {
            latitude: location?.latitude || 0,
            longitude: location?.longitude || 0
          }
        })
      });

      if (!birthChartResponse.ok) {
        throw new Error('Failed to generate birth chart');
      }

      const birthChartDetails = await birthChartResponse.json();

      const userData = {
        userId,
        phoneNumber,
        ...submissionData,  // Use the updated data
        birthPlace: location,
        birthChart: birthChartDetails,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', userId), userData);
      router.push(redirectToChatPage ? '/chat' : '/');
    } catch (error) {
      console.error('Registration error:', error);
      setError('Failed to create user profile');
    } finally {
      setLoading(false);
    }
  };

  const initializeGeocoder = () => {
    if (!MAPBOX_TOKEN || !geocoderContainerRef.current) return;

    // Clear the container
    if (geocoderContainerRef.current) {
      geocoderContainerRef.current.innerHTML = '';
    }

    // Initialize new geocoder
    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapboxgl as any,
      types: 'place',
      countries: 'IN',  // Limit to India
      worldview: 'in',  // Use Indian worldview
      language: 'en'  // Keep English as language
    });

    geocoder.on('result', (e) => handleLocationSelect(e.result));
    geocoder.addTo(geocoderContainerRef.current);
    geocoderRef.current = geocoder;
  };

  useEffect(() => {
    if (step === 1) {
      initializeGeocoder();
    }
  }, [step]);

  return (
    <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-6">
      {step === 2 && (
        <div className="text-center mb-6">
          <p className="text-base text-purple-200">
            Help us customize your readings, or skip for now
          </p>
        </div>
      )}

      {step === 1 ? (
        // Step 1: Basic Details
        <>
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

          <div className="grid grid-cols-2 gap-4 space-y-0">
            <div>
              <label className="block text-sm font-medium text-gray-200">Birth Date</label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Birth Time</label>
              <input
                type="time"
                required
                value={formData.birthTime}
                onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                disabled={unknownBirthTime}
                className="w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500/30 disabled:opacity-50"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id="unknownTime"
                  checked={unknownBirthTime}
                  onChange={(e) => {
                    setUnknownBirthTime(e.target.checked);
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, birthTime: '12:00' }));
                    }
                  }}
                  className="mr-2"
                />
                <label htmlFor="unknownTime" className="text-sm text-gray-200">
                  I Don&apos;t Know
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Birth Place</label>
            <div 
              ref={geocoderContainerRef} 
              className={`geocoder-container ${attemptedSubmit && !location ? 'border-red-500' : ''}`}
            />
          </div>
        </>
      ) : (
        // Step 2: Personal Details
        <>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Gender</label>
            <select
              required
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500/30"
            >
              <option value="" className="bg-purple-900">Select Gender</option>
              <option value="female" className="bg-purple-900">Female</option>
              <option value="male" className="bg-purple-900">Male</option>
              <option value="other" className="bg-purple-900">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Preferred Language</label>
            <select
              required
              value={formData.preferredLanguage}
              onChange={(e) => setFormData(prev => ({ ...prev, preferredLanguage: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500/30"
            >
              <option value="" className="bg-purple-900">Select Language</option>
              <option value="hinglish" className="bg-purple-900">Hinglish</option>
              <option value="english" className="bg-purple-900">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Relationship Status</label>
            <select
              required
              value={formData.relationshipStatus}
              onChange={(e) => setFormData(prev => ({ ...prev, relationshipStatus: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500/30"
            >
              <option value="" className="bg-purple-900">Select Status</option>
              <option value="single" className="bg-purple-900">Single</option>
              <option value="dating" className="bg-purple-900">Dating</option>
              <option value="married" className="bg-purple-900">Married</option>
              <option value="other" className="bg-purple-900">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Occupation</label>
            <select
              required
              value={formData.occupation}
              onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-white focus:outline-none focus:border-purple-500/30"
            >
              <option value="" className="bg-purple-900">Select Occupation</option>
              <option value="employed" className="bg-purple-900">Employed</option>
              <option value="self-employed" className="bg-purple-900">Self-Employed</option>
              <option value="homemaker" className="bg-purple-900">Homemaker</option>
              <option value="student" className="bg-purple-900">Student</option>
              <option value="other" className="bg-purple-900">Other</option>
            </select>
          </div>
        </>
      )}

      {attemptedSubmit && error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <div className="flex gap-4">
        {step === 2 && (
          <>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
              }}
              className="w-full px-8 py-2.5 rounded-lg font-medium transition-all duration-200 bg-purple-800/40 hover:bg-purple-800/60 text-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={(e) => {
                track('Skip');
                trackEvent('button_click', {
                  button_name: 'skip', 
                  location: 'registration_form'
                });
                handleSubmit(e, true);
              }}
              className="w-full px-8 py-2.5 rounded-lg font-medium transition-all duration-200 bg-purple-800/80 hover:bg-purple-800 text-white"
            >
              Skip
            </button>
          </>
        )}
        <button
          type="submit"
          disabled={loading}
          onClick={() => {
            track(step === 1 ? 'Next' : 'Register');
            trackEvent('button_click', {
              button_name: step === 1 ? 'next' : 'register', 
              location: 'registration_form'
            });
          }}
          className={`
            w-full px-8 py-2.5 rounded-lg font-medium transition-all duration-200
            ${!loading 
              ? 'bg-purple-800/80 hover:bg-purple-800 text-white' 
              : 'bg-purple-800/40 text-white/50 cursor-not-allowed'
            }
          `}
        >
          {loading ? 'Creating...' : step === 1 ? 'Next' : 'Register'}
        </button>
      </div>
    </form>
  );
}