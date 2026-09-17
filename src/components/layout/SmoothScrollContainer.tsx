import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SmoothScrollContext } from '@/hooks/useSmoothScroll';

// Register GSAP plugins once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

interface SmoothScrollContainerProps {
  children: React.ReactNode;
  contentKey?: string | number; // used to trigger refresh when tabs/filters change
  className?: string;
}

export function SmoothScrollContainer({
  children,
  contentKey,
  className = '',
}: SmoothScrollContainerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [smoother, setSmoother] = useState<ScrollSmoother | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const location = useLocation();

  // Detect touch device / reduced motion
  useEffect(() => {
    const checkTouch = () => {
      const isTouch =
        window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;
      setIsTouchDevice(isTouch);
    };
    checkTouch();
  }, []);

  // Initialize ScrollSmoother
  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;

    // Create GSAP context for clean garbage collection
    const ctx = gsap.context(() => {
      // Clean up any stale smoother instance
      const existing = ScrollSmoother.get();
      if (existing) {
        existing.kill();
      }

      if (prefersReducedMotion) {
        // Reduced motion: standard scrolling without smoothing
        setSmoother(null);
        return;
      }

      try {
        const sm = ScrollSmoother.create({
          wrapper: wrapperRef.current,
          content: contentRef.current,
          // Refined smooth timing: 1.0s on desktop gives luxury feel without sluggishness
          smooth: isCoarse ? 0 : 1.05,
          // Disable smooth touch to ensure 120Hz native touch responsiveness on mobile
          smoothTouch: 0,
          // Enable data-speed and data-lag parallax attributes
          effects: !isCoarse,
          normalizeScroll: false,
          ignoreMobileResize: true,
        });

        setSmoother(sm);
      } catch (err) {
        console.warn('ScrollSmoother init warning:', err);
      }
    }, wrapperRef);

    return () => {
      ctx.revert();
      const existing = ScrollSmoother.get();
      if (existing) {
        existing.kill();
      }
      setSmoother(null);
    };
  }, [location.pathname]);

  // Unified debounced refresh scheduler to eliminate layout thrashing
  const scheduleRefresh = useCallback((delay = 150) => {
    if (typeof window === 'undefined') return;
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      // Execute in requestAnimationFrame to align with display refresh cycle
      requestAnimationFrame(() => {
        if (contentRef.current) {
          ScrollTrigger.refresh();
        }
      });
    }, delay);
  }, []);

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize route changes: wait 350ms for PageTransition (300ms) to complete
  // so GSAP measures geometry only when the DOM tree is at absolute resting state.
  useEffect(() => {
    scheduleRefresh(350);
    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [location.pathname, scheduleRefresh]);

  // Refresh on contentKey changes (tab switch, filter changes) with unified debounce
  useEffect(() => {
    if (contentKey !== undefined) {
      scheduleRefresh(120);
    }
  }, [contentKey, scheduleRefresh]);

  // ResizeObserver for dynamic content height adjustments using the unified debouncer
  useEffect(() => {
    if (!contentRef.current) return;

    const ro = new ResizeObserver(() => {
      scheduleRefresh(150);
    });

    ro.observe(contentRef.current);

    return () => {
      ro.disconnect();
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [scheduleRefresh]);

  const scrollTo = useCallback((target: string | number | HTMLElement, smooth = true, position = 'top top') => {
    const sm = ScrollSmoother.get();
    if (sm) {
      sm.scrollTo(target, smooth, position);
    } else {
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' });
      } else if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
      }
    }
  }, []);

  const refresh = useCallback(() => {
    scheduleRefresh(0);
  }, [scheduleRefresh]);

  const pause = useCallback((isPaused: boolean) => {
    const sm = ScrollSmoother.get();
    if (sm) {
      sm.paused(isPaused);
    }
  }, []);

  return (
    <SmoothScrollContext.Provider
      value={{
        smoother,
        scrollTo,
        refresh,
        pause,
        isTouchDevice,
      }}
    >
      <div
        id="smooth-wrapper"
        ref={wrapperRef}
        className={`w-full overflow-hidden ${className}`}
      >
        <div
          id="smooth-content"
          ref={contentRef}
          className="w-full min-h-screen flex flex-col will-change-transform"
        >
          {children}
        </div>
      </div>
    </SmoothScrollContext.Provider>
  );
}
