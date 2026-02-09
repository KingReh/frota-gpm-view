import { useState, useCallback, useRef, useEffect } from 'react';

const ALERT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Generate a short notification beep using Web Audio API
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 880;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    // Second tone (higher, delayed)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1320;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc2.start(ctx.currentTime + 0.18);
    osc2.stop(ctx.currentTime + 0.4);

    // Cleanup
    setTimeout(() => ctx.close(), 1000);
  } catch (e) {
    console.warn('Could not play notification sound:', e);
  }
}

export function useBalanceUpdateAlert() {
  const [recentlyUpdated, setRecentlyUpdated] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAlert = useCallback(() => {
    playNotificationSound();
    setRecentlyUpdated(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setRecentlyUpdated(false);
    }, ALERT_DURATION_MS);
  }, []);

  const dismissAlert = useCallback(() => {
    setRecentlyUpdated(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { recentlyUpdated, triggerAlert, dismissAlert };
}
