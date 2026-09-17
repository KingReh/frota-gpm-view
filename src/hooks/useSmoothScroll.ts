import { createContext, useContext } from 'react';
import type { ScrollSmoother } from 'gsap/ScrollSmoother';

export interface SmoothScrollContextType {
  smoother: ScrollSmoother | null;
  scrollTo: (target: string | number | HTMLElement, smooth?: boolean, position?: string) => void;
  refresh: () => void;
  pause: (isPaused: boolean) => void;
  isTouchDevice: boolean;
}

export const SmoothScrollContext = createContext<SmoothScrollContextType>({
  smoother: null,
  scrollTo: () => {},
  refresh: () => {},
  pause: () => {},
  isTouchDevice: false,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);
