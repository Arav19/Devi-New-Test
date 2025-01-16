'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { auth } from '@/lib/firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import StarField from '@/components/StarField';
import React from 'react';
import { trackEvent } from '@/hooks/useAnalytics';
import { track } from '@vercel/analytics';

// Move MemoizedStarField outside the component
const MemoizedStarField = React.memo(StarField);

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const verifyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectToChatPage = searchParams.get('redirect') === 'chat';

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
  }), []); // Empty dependency array means these props never change

  // 1. Track reCAPTCHA lifecycle
  useEffect(() => {
    //console.log('🔍 Checking reCAPTCHA state...');
    
    // Only initialize if we don't have a verifier AND the container exists
    if (!recaptchaVerifier.current && document.getElementById('recaptcha-container')) {
      //console.log('🔄 Creating new reCAPTCHA instance...');
      try {
        recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            //console.log('✅ reCAPTCHA verified successfully');
          },
          'expired-callback': () => {
            //console.log('⚠️ reCAPTCHA token expired');
            setError('Security check expired. Please try again.');
          },
          'error-callback': (error: Error) => {
            console.error('❌ reCAPTCHA error:', error);
          }
        });
        //console.log('✅ reCAPTCHA initialized');
      } catch (err) {
        console.error('❌ reCAPTCHA initialization failed:', err);
      }
    } else {
      //console.log('ℹ️ reCAPTCHA already exists or container not ready');
    }

    // Only cleanup on component unmount
    return () => {
      if (recaptchaVerifier.current) {
        //console.log('🧹 Final cleanup of reCAPTCHA...');
        recaptchaVerifier.current.clear();
        recaptchaVerifier.current = null;
      }
    };
  }, []); // Empty dependency array to run only on mount/unmount

  // Add useEffect for timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }

    // Cleanup interval
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendTimer]);

  const startResendTimer = () => {
    setResendTimer(30); // Start 30 second countdown
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!recaptchaVerifier.current) {
        recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        });
      }

      const confirmation = await signInWithPhoneNumber(
        auth, 
        phoneNumber, 
        recaptchaVerifier.current
      );
      
      setConfirmationResult(confirmation);
      startResendTimer();
    } catch (err: any) {
      if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later or use a different phone number.');
      } else {
        setError('Failed to send code. Please try again.');
      }
      console.error('Error sending code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (verifyTimeoutRef.current) {
      clearTimeout(verifyTimeoutRef.current);
    }

    const code = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(code);
    
    if (code.length === 6 && /^\d{6}$/.test(code)) {
        //console.log('Code complete, preparing auto-submit');
      Promise.resolve().then(() => {
        verifyTimeoutRef.current = setTimeout(() => {
            //console.log('Auto-submitting verification code:', code);
          handleVerifyCode(undefined, code);
        }, 300);
      });
    }
  };

  const handleVerifyCode = async (e?: React.FormEvent, directCode?: string) => {
    if (e) {
      e.preventDefault();
    }

    if (verifyTimeoutRef.current) {
      clearTimeout(verifyTimeoutRef.current);
    }

    const codeToVerify = directCode || verificationCode;

    if (loading || !codeToVerify || codeToVerify.length !== 6) {
      // console.log('Verification blocked:', { 
      //   loading, 
      //   codeLength: codeToVerify?.length 
      // });
      return;
    }

    // console.log('Starting verification process');
    setError('');
    setLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error('No verification session found');
      }

      const result = await confirmationResult.confirm(codeToVerify);
      // console.log('✅ Verification successful');
      
      if (result.user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', result.user.uid));
          
          if (!userDoc.exists()) {
            // console.log('👤 User not found, redirecting to registration');
            // Only add redirect param if it was present in the original request
            const registrationUrl = `/register?phone=${encodeURIComponent(phoneNumber)}${
              redirectToChatPage ? '&redirect=chat' : ''
            }`;
            router.push(registrationUrl);
          } else {
            // console.log('👤 User found, redirecting...');
            router.push(redirectToChatPage ? '/chat' : '/');
          }
        } catch (dbError) {
          console.error('❌ Database error:', dbError);
          router.push('/');
        }
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      setError('Invalid verification code. Please try again.');
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setLoading(false);
    setConfirmationResult(null);
    setVerificationCode('');
    setPhoneNumber('');
    setError('');
    setIsValidPhone(false);
    
    if (recaptchaVerifier.current) {
      recaptchaVerifier.current.clear();
      recaptchaVerifier.current = null;
    }
  };

  const handlePhoneChange = (value: string, country: any) => {
    const formattedNumber = `+${value}`;
    setPhoneNumber(formattedNumber);
    
    const phoneNumberWithoutCountry = value.slice(country.dialCode.length);
    setIsValidPhone(phoneNumberWithoutCountry.length >= 10);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-[#220038] via-[#150030] to-[#220038] text-white">
      <MemoizedStarField {...starFieldProps} />
      
      {/* Main Content */}
      <main className="min-h-[100dvh] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <Image
              src="/devi-logo.png"
              alt="Devi Logo"
              width={70}
              height={70}
              className="mx-auto"
            />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] text-transparent bg-clip-text">
                Sign In
              </h1>
              <p className="text-gray-400 mt-2">
                The stars have been waiting for you...
              </p>
            </div>
          </div>

          {!confirmationResult ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Phone Number
                </label>
                <PhoneInput
                  country="in"
                  preferredCountries={['in', 'us']}
                  enableSearch={true}
                  searchPlaceholder="Search country..."
                  value={phoneNumber.replace('+', '')}
                  onChange={handlePhoneChange}
                  inputProps={{
                    required: true,
                    placeholder: "Enter phone number",
                  }}
                  containerStyle={{ width: '100%' }}
                  inputStyle={{
                    width: '100%',
                    height: '42px',
                    fontSize: '16px',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    color: 'white',
                    paddingLeft: '65px'
                  }}
                  buttonStyle={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: '0 8px'
                  }}
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div id="recaptcha-container" className="invisible"></div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={!isValidPhone || loading}
                  onClick={() => {
                    track('Send OTP');
                    trackEvent('button_click', {
                      button_name: 'login_otp', 
                      location: 'login_page'
                    });
                  }}
                  className={`
                    w-full px-8 py-2.5 rounded-lg font-medium transition-all duration-200
                    ${isValidPhone 
                      ? 'bg-purple-800/80 hover:bg-purple-800 text-white' 
                      : 'bg-purple-800/40 text-white/50 cursor-not-allowed'
                    }
                  `}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={(e) => handleVerifyCode(e)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  One-Time Password (OTP)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={verificationCode}
                  onChange={handleCodeChange}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-white placeholder:text-white/50 focus:outline-none focus:border-purple-500/30"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  disabled={loading}
                  autoComplete="one-time-code"
                  autoFocus
                />
                {resendTimer > 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    Resend code in {resendTimer}s
                  </p>
                )}
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={verificationCode.length !== 6 || loading}
                onClick={() => {
                  track('Verify OTP');
                  trackEvent('button_click', {
                    button_name: 'verify_otp', 
                    location: 'login_page'
                  });
                }}
                className={`
                  w-full px-8 py-2.5 rounded-lg font-medium transition-all duration-200
                  ${verificationCode.length === 6 
                    ? 'bg-purple-800/80 hover:bg-purple-800 text-white' 
                    : 'bg-purple-800/40 text-white/50 cursor-not-allowed'
                  }
                `}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-purple-300 hover:text-white transition-colors"
                >
                  Change Phone Number
                </button>
                {resendTimer === 0 && (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="text-purple-300 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
