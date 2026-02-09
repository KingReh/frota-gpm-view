import { useRef, useCallback } from 'react';

interface SwipeDismissOptions {
  onDismiss: () => void;
  direction?: 'down' | 'up' | 'left' | 'right';
  threshold?: number; // px to trigger dismiss
}

export function useSwipeDismiss({ onDismiss, direction = 'down', threshold = 80 }: SwipeDismissOptions) {
  const startY = useRef(0);
  const startX = useRef(0);
  const currentOffset = useRef(0);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startX.current = e.touches[0].clientX;
    currentOffset.current = 0;
    isDragging.current = false;
    if (elementRef.current) {
      elementRef.current.style.transition = 'none';
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - startY.current;
    const deltaX = e.touches[0].clientX - startX.current;

    let offset = 0;
    const isVertical = direction === 'down' || direction === 'up';

    if (isVertical) {
      // Only start dragging if vertical movement > horizontal
      if (!isDragging.current && Math.abs(deltaY) < Math.abs(deltaX)) return;
      offset = direction === 'down' ? Math.max(0, deltaY) : Math.max(0, -deltaY);
    } else {
      if (!isDragging.current && Math.abs(deltaX) < Math.abs(deltaY)) return;
      offset = direction === 'right' ? Math.max(0, deltaX) : Math.max(0, -deltaX);
    }

    if (offset > 5) {
      isDragging.current = true;
    }

    if (!isDragging.current) return;

    currentOffset.current = offset;
    if (elementRef.current) {
      const opacity = Math.max(0, 1 - offset / (threshold * 1.5));
      const translate = isVertical
        ? `translateY(${direction === 'down' ? offset : -offset}px)`
        : `translateX(${direction === 'right' ? offset : -offset}px)`;
      elementRef.current.style.transform = translate;
      elementRef.current.style.opacity = String(opacity);
    }
  }, [direction, threshold]);

  const onTouchEnd = useCallback(() => {
    if (!elementRef.current) return;

    if (currentOffset.current >= threshold) {
      elementRef.current.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
      const isVertical = direction === 'down' || direction === 'up';
      if (isVertical) {
        elementRef.current.style.transform = `translateY(${direction === 'down' ? '100%' : '-100%'})`;
      } else {
        elementRef.current.style.transform = `translateX(${direction === 'right' ? '100%' : '-100%'})`;
      }
      elementRef.current.style.opacity = '0';
      setTimeout(onDismiss, 200);
    } else {
      elementRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease';
      elementRef.current.style.transform = 'translate(0)';
      elementRef.current.style.opacity = '1';
    }
    isDragging.current = false;
  }, [direction, threshold, onDismiss]);

  return {
    ref: elementRef,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
