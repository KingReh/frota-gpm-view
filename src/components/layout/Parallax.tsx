import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number; // e.g. 0.85 = slower/depth, 1.15 = faster/foreground
  lag?: number;   // subtle spring lag (capped to 0.05 for CPU efficiency)
  children: React.ReactNode;
  className?: string;
}

/**
 * Parallax wrapper that works natively with GSAP ScrollSmoother via data attributes.
 * Capped lag prevents long-running LERP calculations on CPU.
 */
export function Parallax({
  speed = 1,
  lag = 0,
  children,
  className = '',
  ...props
}: ParallaxProps) {
  // Cap lag to avoid long-tail LERP calculation on CPU
  const safeLag = lag > 0 ? Math.min(lag, 0.05) : undefined;

  return (
    <div
      data-speed={speed !== 1 ? speed : undefined}
      data-lag={safeLag}
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
 * Releases GPU layer (will-change) immediately upon completion and unbinds trigger once entered.
 */
export function RevealOnScroll({
  children,
  delay = 0,
  yOffset = 20,
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
          duration: 0.65,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            toggleActions: 'play none none none',
            once: true, // Frees up listener immediately once entered
          },
          onStart: () => {
            el.style.willChange = 'transform, opacity';
          },
          onComplete: () => {
            // Free GPU layer from browser compositing memory
            el.style.willChange = 'auto';
          },
        }
      );
    }, elRef);

    return () => ctx.revert();
  }, [delay, yOffset]);

  return (
    <div ref={elRef} className={className} {...props}>
      {children}
    </div>
  );
}

interface BatchRevealGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  itemSelector?: string;
  yOffset?: number;
  stagger?: number;
  className?: string;
}

/**
 * High-performance batch entrance coordinator using ScrollTrigger.batch.
 * Consolidates multiple child elements into a single trigger listener with staggered reveals,
 * drastically reducing ScrollTrigger instances for dense grids and cards.
 */
export function BatchRevealGroup({
  children,
  itemSelector = '.batch-reveal-item',
  yOffset = 18,
  stagger = 0.06,
  className = '',
  ...props
}: BatchRevealGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const items = container.querySelectorAll(itemSelector);
      items.forEach((item) => {
        (item as HTMLElement).style.opacity = '1';
        (item as HTMLElement).style.transform = 'none';
      });
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.batch(container.querySelectorAll(itemSelector), {
        interval: 0.1,
        batchMax: 6,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            {
              opacity: 0,
              y: yOffset,
              scale: 0.98,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger,
              ease: 'power2.out',
              overwrite: 'auto',
              onStart: () => {
                batch.forEach((node) => {
                  if (node instanceof HTMLElement) node.style.willChange = 'transform, opacity';
                });
              },
              onComplete: () => {
                batch.forEach((node) => {
                  if (node instanceof HTMLElement) node.style.willChange = 'auto';
                });
              },
            }
          );
        },
        once: true,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [itemSelector, yOffset, stagger]);

  return (
    <div ref={containerRef} className={className} {...props}>
      {children}
    </div>
  );
}

