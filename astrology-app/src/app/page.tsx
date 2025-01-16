'use client';

import { useRouter } from 'next/navigation';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import StarField from '@/components/StarField';
import Logo from '@/components/Logo';
import GoldenButton from '@/components/GoldenButton';
import Testimonial from '@/components/Testimonial';
import SectionTitle from '@/components/SectionTitle';
import FAQ from '@/components/FAQ';
import Navigation from '@/components/Navigation';
import RangoliPattern from '@/components/RangoliPattern';
import ContactSection from '@/components/ContactSection';
import { testimonials } from '@/data/testimonials';
import { faqData } from '@/data/faqData';
import PageTransition from '@/components/PageTransition';
import { auth } from '@/lib/firebase';
import React, { useMemo, useEffect, useRef } from 'react';
import AnimatedStat from '@/components/AnimatedStat';
import { useTimeOnPage, trackEvent, useSectionVisibility } from '@/hooks/useAnalytics';
import { track } from '@vercel/analytics';
// import { Play } from 'lucide-react';

const MemoizedStarField = React.memo(StarField);

export default function Home() {
  const router = useRouter();
  const { user, isRegistered, loading } = useAuthStatus();
  const videoRef = useRef<HTMLVideoElement>(null);

  useTimeOnPage();
  useSectionVisibility('about');
  useSectionVisibility('how-it-works');
  useSectionVisibility('testimonials');
  useSectionVisibility('faq');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Play video when it's loaded
    video.addEventListener('loadedmetadata', () => {
      video.play().catch(err => console.log('Initial play failed:', err));
    });

    // Set up intersection observer for scroll behavior
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            video.play().catch(err => console.log('Scroll play failed:', err));
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
    };
  }, []);

  // Add memoized props for StarField
  const starFieldProps = useMemo(() => ({
    starCount: 100,  // More stars for landing page
    largeStarChance: 0.1,
    maxStarSize: 3,
    safeZone: {
      top: 20,
      bottom: 20,
      left: 10,
      right: 10
    }
  }), []);

  const stats = [
    { 
      baseline: 28500,
      max: 10000000,
      label: "Questions Answered",
      minInterval: 10000,
      maxInterval: 120000
    },
    { 
      baseline: 970,
      max: 1000000,
      label: "Happy Users",
      minInterval: 120000,
      maxInterval: 400000
    }
  ];

  const handleStartChat = () => {
    trackEvent('button_click', {
      button_name: 'chat_now',
      location: 'homepage'
    });
    track('Chat Now');
    if (user && isRegistered) {
      router.push('/chat');
    } else {
      router.push('/login?redirect=chat');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAuthClick = () => {
    trackEvent('button_click', {
      button_name: user && isRegistered ? 'sign_out' : 'sign_in',
      location: 'homepage'
    });
    track('Sign In');
    if (user && isRegistered) {
      handleLogout();
    } else {
      router.push('/login');
    }
  };

  if (loading) return null;

  return (
    <PageTransition>
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[#220038] via-[#150030] to-[#220038] text-white">
        <MemoizedStarField {...starFieldProps} />
        <Navigation />
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:pb-32">
          {/* Adjust RangoliPattern position */}
          <div className="absolute inset-0 flex items-center justify-center">
            <RangoliPattern />
          </div>
          
          {/* Main content wrapper */}
          <div className="text-center z-10 sm:mt-auto">
            <Logo />
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] bg-clip-text text-transparent">
              Ask Devi
            </h1>
            <p className="text-[1.2rem] text-yellow-100/80 mb-10 max-w-2xl mx-auto leading-tight">
              Your Personal Vedic Astrologer,<br />
              Always at Your Fingertips
            </p>
            <div className="flex gap-4 justify-center">
              <GoldenButton 
                variant="solid"
                onClick={handleStartChat}
              >
                Chat Now
              </GoldenButton>   
              <GoldenButton 
                variant="outline" 
                onClick={handleAuthClick}
              >
                {user && isRegistered ? 'Sign Out' : 'Sign In'}
              </GoldenButton>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="pt-6 pb-12 sm:py-24 px-4 relative">
          <SectionTitle>See How It Works</SectionTitle>
          <div className="max-w-[400px] mx-auto bg-purple-900/30 rounded-2xl overflow-hidden backdrop-blur-sm border border-purple-500/20">
            <div className="aspect-[9/16] relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                loop
                autoPlay
                controls={false}
              >
                <source src="/videos/demo-final.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-12 sm:py-24 px-12 relative">
          <div className="max-w-4xl mx-auto text-center">
            <SectionTitle>From Devi, To You</SectionTitle>
            <p className="text-base text-purple-200 leading-relaxed">
              Namaste! I&apos;m Devi, your personal Vedic astrologer, where ancient wisdom meets modern innovation. 
              I&apos;m here to guide you through life&apos;s uncertainties with personalized astrological insights, 
              whether you&apos;re seeking clarity in love, career, health, or spiritual growth. 
              My goal is to help you live a joyful, peaceful, and successful life by combining 
              centuries-old Vedic knowledge with the precision of cutting-edge artificial intelligence. 
              {/* With me, you&apos;re not just receiving predictions—you&apos;re gaining a trusted companion on your 
              life&apos;s journey, ready to illuminate your path and empower you to make better decisions 
              for a more fulfilled existence.  */}
            </p>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-24 px-4 relative">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center md:max-w-2xl">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-8 bg-purple-900/20 rounded-lg backdrop-blur-sm border border-purple-500/20 w-full max-w-xs">
                <AnimatedStat
                  baselineValue={stat.baseline}
                  maxValue={stat.max}
                  label={stat.label}
                  minInterval={stat.minInterval}
                  maxInterval={stat.maxInterval}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 px-4 relative overflow-hidden">
          <SectionTitle>What Our Users Say</SectionTitle>
          <div className="relative">
            
            <div className="flex gap-5 overflow-x-auto pb-8 px-4 mx-4 snap-x snap-mandatory 
              [-webkit-overflow-scrolling:touch] scroll-smooth
              [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="snap-start flex-shrink-0 w-[280px] first:ml-0">
                  <Testimonial {...testimonial} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 px-8 relative">
          <SectionTitle>Frequently Asked Questions</SectionTitle>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqData.map((faq, index) => (
              <FAQ key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <ContactSection />

        {/* Footer */}
        <footer id="contact" className="py-8 px-4 border-t border-purple-500/20">
          <div className="max-w-6xl mx-auto text-center text-purple-300/60 text-sm">
            <p>© {new Date().getFullYear()} Ask Devi. All rights reserved.</p>
            <p className="mt-2">
              Combining ancient wisdom with modern technology to guide your spiritual journey.
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
