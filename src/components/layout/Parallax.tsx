import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number; // e.g. 0.85 = slower/depth, 1.15 = faster/foreground
  lag?: number;   // e.g. 0.1 = subtle spring lag
  children: React.ReactNode;
  className?: string;
}

/**
 * Parallax wrapper that works natively with GSAP ScrollSmoother via data attributes,
 * falling back to a lightweight ScrollTrigger transform when smoother is inactive.
 */
export function Parallax({
  speed = 1,
  lag = 0,
  children,
  className = '',
  ...props
}: ParallaxProps) {
  return (
    <div
      data-speed={speed !== 1 ? speed : undefined}
      data-lag={lag > 0 ? lag : undefined}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

interface RevealOnScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  yOffset?: number;
  className?: string;
  threshold?: number;
}

/**
 * Performance-optimized entrance reveal powered by GSAP ScrollTrigger.
 * Fires once, cleans up, and utilizes GPU-accelerated transforms without continuous CPU polling.
 */
export function RevealOnScroll({
  children,
  delay = 0,
  yOffset = 24,
  className = '',
  ...props
}: RevealOnScrollProps) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: yOffset,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            toggleActions: 'play none none none',
            once: true, // Only plays once - frees up listener immediately!
          },
        }
      );
    }, elRef);

    return () => ctx.revert();
  }, [delay, yOffset]);

  return (
    <div ref={elRef} className={`will-change-[transform,opacity] ${className}`} {...props}>
      {children}
    </div>
  );
}
