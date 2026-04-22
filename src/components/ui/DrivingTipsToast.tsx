"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

const FALLBACK_TIPS = [
  "Mantenha sempre a distância de segurança do veículo à frente.",
  "Verifique a pressão dos pneus semanalmente para economizar combustível.",
  "Use o freio motor em descidas longas para poupar os freios.",
  "Evite acelerações bruscas para preservar a bateria e o motor.",
  "Sinalize com antecedência todas as suas manobras.",
  "Verifique o nível de óleo e fluidos regularmente.",
  "Em dias de chuva, reduza a velocidade e acenda os faróis.",
  "Respeite sempre os limites de velocidade da via.",
  "Use o cinto de segurança, inclusive no banco traseiro."
];

export const DrivingTipsToast = () => {
  const [tip, setTip] = useState<string>("");
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('driving-tip-dismissed') === 'true');
  const [isVisible, setIsVisible] = useState(false);
  const [hasPwaPrompt, setHasPwaPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const isMobile = useIsMobile();

  // Ticker interaction state (mobile)
  const trackRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrubX, setScrubX] = useState<number | null>(null);
  const dragStateRef = useRef<{ startX: number; startOffset: number; maxOffset: number } | null>(null);

  // Hold-to-preview modal state (mobile)
  const [showHoldModal, setShowHoldModal] = useState(false);
  const holdTimerRef = useRef<number | null>(null);

  const handleLabelHoldStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    holdTimerRef.current = window.setTimeout(() => {
      setShowHoldModal(true);
    }, 250);
  };

  const handleLabelHoldEnd = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setShowHoldModal(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('driving-tip-dismissed', 'true');
    setDismissed(true);
  };

  const getCurrentTranslateX = (): number => {
    const el = trackRef.current;
    if (!el) return 0;
    const transform = window.getComputedStyle(el).transform;
    if (!transform || transform === 'none') return 0;
    // matrix(a, b, c, d, tx, ty)
    const match = transform.match(/matrix.*\((.+)\)/);
    if (!match) return 0;
    const parts = match[1].split(',').map(p => parseFloat(p.trim()));
    return parts.length >= 6 ? parts[4] : 0;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const content = contentRef.current;
    if (!track || !content) return;
    const currentX = getCurrentTranslateX();
    setScrubX(currentX);
    setIsPaused(true);
    // Half of the duplicated track width = single phrase width (negative max offset)
    const maxOffset = -(content.scrollWidth / 2);
    dragStateRef.current = { startX: e.clientX, startOffset: currentX, maxOffset };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* noop */ }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state) return;
    const delta = e.clientX - state.startX;
    let next = state.startOffset + delta;
    // Clamp between maxOffset (end) and 0 (start)
    if (next > 0) next = 0;
    if (next < state.maxOffset) next = state.maxOffset;
    setScrubX(next);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = null;
    setIsPaused(false);
    setScrubX(null);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-driving-tips');
        if (!error && data?.tip) {
          setTip(data.tip);
        } else {
          setTip(FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)]);
        }
      } catch {
        setTip(FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)]);
      }
    };

    fetchTip();

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('driving-tip-dismissed')) {
        setIsVisible(true);
      }
    }, 1000);

    const handlePwaVisibility = (e: CustomEvent) => {
      setHasPwaPrompt(e.detail);
    };

    window.addEventListener('pwa-prompt-visibility', handlePwaVisibility as EventListener);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pwa-prompt-visibility', handlePwaVisibility as EventListener);
    };
  }, []);

  if (!isVisible || !tip) return null;

  // ============== MOBILE: Discrete bottom ticker bar ==============
  if (isMobile) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
              bottom: hasPwaPrompt ? (isIOS ? 200 : 195) : 0,
            }}
            className={cn(
              "fixed left-0 right-0 z-[55] transition-[bottom] duration-300",
              "bg-black/70 backdrop-blur-md border-t border-white/10",
              "shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
            )}
          >
            <div className="relative flex items-center gap-2 h-8 px-2 overflow-hidden">
              {/* Icon + Label (fixed on left) - hold to preview tip */}
              <div
                className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-white/10 z-10 bg-black/70 cursor-pointer select-none touch-none"
                onPointerDown={handleLabelHoldStart}
                onPointerUp={handleLabelHoldEnd}
                onPointerLeave={handleLabelHoldEnd}
                onPointerCancel={handleLabelHoldEnd}
                onContextMenu={(e) => e.preventDefault()}
              >
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/60">
                  Dica
                </span>
              </div>

              {/* Ticker track */}
              <div
                className="flex-1 overflow-hidden relative touch-pan-y select-none cursor-grab active:cursor-grabbing"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div
                  ref={trackRef}
                  className={cn(
                    "flex animate-ticker whitespace-nowrap",
                    isPaused && "is-paused"
                  )}
                  style={scrubX !== null ? { transform: `translateX(${scrubX}px)` } : undefined}
                >
                  <div ref={contentRef} className="flex">
                    <span className="text-[11px] text-gray-200 font-medium pr-16">
                      {tip}
                    </span>
                    <span className="text-[11px] text-gray-200 font-medium pr-16" aria-hidden="true">
                      {tip}
                    </span>
                  </div>
                </div>
                {/* Edge fade */}
                <div className="pointer-events-none absolute inset-y-0 right-8 w-6 bg-gradient-to-l from-black/70 to-transparent" />
              </div>

              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                className="shrink-0 text-white/50 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors z-10"
                aria-label="Dispensar dica"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ============== DESKTOP: Original floating card ==============
  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className={cn(
            "fixed left-8 z-[60] w-full max-w-lg px-4 pointer-events-none transition-all duration-500 ease-in-out",
            hasPwaPrompt ? "bottom-[205px]" : "bottom-8"
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 200, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_e, info) => {
              if (Math.abs(info.offset.x) > 100) {
                handleDismiss();
              }
            }}
            className={cn(
              "pointer-events-auto relative overflow-visible",
              "bg-black/40 backdrop-blur-xl border border-white/10",
              "p-4 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
              "flex items-start gap-4 group"
            )}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-transparent opacity-50 pointer-events-none" />

            <div className="shrink-0 p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <Zap className="w-5 h-5" />
            </div>

            <div className="flex-1 pt-1 min-w-0 overflow-visible">
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1 flex items-center gap-2">
                  Dica do Dia
                  <span className="w-1 h-1 rounded-full bg-primary/50 animate-pulse" />
                </h4>
                <button
                  onClick={handleDismiss}
                  className="text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed font-medium break-words whitespace-normal">
                {tip}
              </p>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
