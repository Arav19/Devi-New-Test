'use client';

import React from 'react';

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

export const useTimeOnPage = () => {
  React.useEffect(() => {
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const timeSpent = Math.round((endTime - startTime) / 1000); // Convert to seconds
      
      trackEvent('time_on_homepage', {
        time_spent_seconds: timeSpent
      });
    };
  }, []);
};

export const useSectionVisibility = (sectionId: string) => {
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackEvent('section_view', {
              section_id: sectionId
            });
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of section is visible
    );

    const element = document.getElementById(sectionId);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [sectionId]);
};