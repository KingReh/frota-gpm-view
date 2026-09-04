"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, ChevronUp, RefreshCw, Copy, Check, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FALLBACK_TIPS = [
  "Mantenha sempre a distância de segurança do veículo à frente.",
  "Verifique a pressão dos pneus semanalmente para economizar combustível.",
  "Use o freio motor em descidas longas para poupar os freios.",
  "Evite acelerações bruscas para preservar a bateria e o motor.",
  "Sinalize com antecedência todas as suas manobras.",
  "Verifique o nível de óleo e fluidos regularmente.",
  "Em dias de chuva, reduza a velocidade e acenda os faróis.",
  "Respeite sempre os limites de velocidade da via.",
  "Use o cinto de segurança, inclusive no banco traseiro.",
  "Planeje rotas com antecedência para evitar congestionamentos e poupar combustível.",
  "Alinhamento e balanceamento periódicos evitam desgaste irregular dos pneus.",
  "Não apoie o pé no pedal da embreagem enquanto dirige para não desgastar o sistema."
];

export const DrivingTipsToast = () => {
  const [tipsList, setTipsList] = useState<string[]>(FALLBACK_TIPS);
  const [tipIndex, setTipIndex] = useState(0);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('driving-tip-dismissed') === 'true');
  const [isVisible, setIsVisible] = useState(false);
  const [hasPwaPrompt, setHasPwaPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isMobile = useIsMobile();

  // Ticker interaction state (mobile)
  const trackRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [scrubX, setScrubX] = useState<number | null>(null);
  const dragStateRef = useRef<{ startX: number; startOffset: number; maxOffset: number; hasMoved: boolean } | null>(null);

  const currentTip = tipsList[tipIndex] || FALLBACK_TIPS[0];

  const handleDismiss = () => {
    setIsVisible(false);
    setIsExpanded(false);
    sessionStorage.setItem('driving-tip-dismissed', 'true');
    setDismissed(true);
  };

  const handleNextTip = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 450);
    setTipIndex((prev) => (prev + 1) % tipsList.length);
  };

  const handleCopy = async () => {
    if (!currentTip) return;
    try {
      await navigator.clipboard.writeText(currentTip);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const getCurrentTranslateX = (): number => {
    const el = trackRef.current;
    if (!el) return 0;
    const transform = window.getComputedStyle(el).transform;
    if (!transform || transform === 'none') return 0;
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
    const maxOffset = -(content.scrollWidth / 2);
    dragStateRef.current = { startX: e.clientX, startOffset: currentX, maxOffset, hasMoved: false };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* noop */ }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state) return;
    const delta = e.clientX - state.startX;
    if (Math.abs(delta) > 5) {
      state.hasMoved = true;
    }
    let next = state.startOffset + delta;
    if (next > 0) next = 0;
    if (next < state.maxOffset) next = state.maxOffset;
    setScrubX(next);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (state && !state.hasMoved) {
      // It was a quick tap without drag -> toggle full tooltip card
      setIsExpanded((prev) => !prev);
    }
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
          setTipsList((prev) => [data.tip, ...prev.filter(t => t !== data.tip)]);
          setTipIndex(0);
        } else {
          setTipIndex(Math.floor(Math.random() * FALLBACK_TIPS.length));
        }
      } catch {
        setTipIndex(Math.floor(Math.random() * FALLBACK_TIPS.length));
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

  if (!isVisible || !currentTip) return null;

  // ============== MOBILE: Discrete bottom ticker bar with Tooltip Dica do Dia ==============
  if (isMobile) {
    return (
      <>
        <AnimatePresence>
          {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
              bottom: hasPwaPrompt ? (isIOS ? 200 : 195) : 0,
            }}
            className={cn(
              "fixed left-0 right-0 z-[55] transition-[bottom] duration-300",
              "bg-card/95 backdrop-blur-md border-t border-border",
              "shadow-[0_-4px_24px_rgba(0,0,0,0.2)]"
            )}
          >
            {/* Top micro glowing accent edge */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-primary/80 via-primary/30 to-transparent pointer-events-none" />

            {/* Target element: Compact High-Density Ticker Bar */}
            <div className="relative flex items-center gap-1.5 h-9 px-2 overflow-hidden select-none">
              {/* Tooltip 'Dica do Dia' Button / Badge (fixed on left) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className={cn(
                      "flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-md transition-all z-20 cursor-pointer",
                      "bg-primary/10 hover:bg-primary/20 active:scale-95 border border-primary/20",
                      isExpanded && "bg-primary/20 border-primary/40 ring-1 ring-primary/40"
                    )}
                    aria-label="Dica do Dia - toque para ver completa"
                  >
                    <div className="relative flex items-center justify-center">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary whitespace-nowrap">
                      Dica do Dia
                    </span>
                    <ChevronUp className={cn("w-3 h-3 text-primary/70 transition-transform duration-200", isExpanded && "rotate-180")} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[11px] font-medium">
                  {isExpanded ? "Fechar dica completa" : "Toque para ver a dica completa"}
                </TooltipContent>
              </Tooltip>

              {/* Ticker sliding track */}
              <div
                className="flex-1 overflow-hidden relative touch-pan-y cursor-grab active:cursor-grabbing py-1"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                title="Arraste para deslizar ou toque para abrir a dica completa"
              >
                {/* Left Edge Fade Mask */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-card via-card/90 to-transparent z-10" />

                {/* Animated scrolling track */}
                <div
                  ref={trackRef}
                  className={cn(
                    "flex animate-ticker whitespace-nowrap will-change-transform",
                    (isPaused || isExpanded) && "is-paused"
                  )}
                  style={scrubX !== null ? { transform: `translateX(${scrubX}px)` } : undefined}
                >
                  <div ref={contentRef} className="flex items-center">
                    <span className="text-[11px] text-foreground font-medium pr-12 flex items-center gap-2">
                      <span>{currentTip}</span>
                      <span className="text-primary/50 text-[10px]">✦</span>
                    </span>
                    <span className="text-[11px] text-foreground font-medium pr-12 flex items-center gap-2" aria-hidden="true">
                      <span>{currentTip}</span>
                      <span className="text-primary/50 text-[10px]">✦</span>
                    </span>
                  </div>
                </div>

                {/* Right Edge Fade Mask */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-card via-card/90 to-transparent z-10" />
              </div>

              {/* Controls on the right (Pause/Play, Refresh, Dismiss) */}
              <div className="flex items-center gap-0.5 shrink-0 pl-1 z-20 bg-card/95">
                {/* Play/Pause Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPaused((prev) => !prev);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-95 transition-all"
                  aria-label={isPaused ? "Retomar rolagem da dica" : "Pausar rolagem da dica"}
                  title={isPaused ? "Retomar" : "Pausar"}
                >
                  {isPaused ? <Play className="w-3 h-3 text-primary" /> : <Pause className="w-3 h-3" />}
                </button>

                {/* Next Tip Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextTip();
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-95 transition-all"
                  aria-label="Próxima dica"
                  title="Próxima dica"
                >
                  <RefreshCw className={cn("w-3 h-3", isSpinning && "animate-spin")} />
                </button>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all ml-0.5"
                  aria-label="Dispensar dica"
                  title="Dispensar dica"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Tooltip 'Dica do Dia' Modal Card rendered in Portal (100% Opaque, No Conflict with Hero) */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isExpanded && (
            <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 pb-[calc(56px+env(safe-area-inset-bottom,0px))]">
              {/* Backdrop overlay: softened opacity allowing ambient context without harsh darkening */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsExpanded(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] cursor-pointer"
              />

              {/* Floating Card: Refined semi-translucent surface with high-density backdrop blur */}
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className={cn(
                  "relative w-full max-w-md z-10",
                  "bg-card/88 backdrop-blur-xl text-card-foreground border border-border/80 rounded-2xl",
                  "shadow-[0_16px_40px_rgba(0,0,0,0.35)] p-4"
                )}
              >
                <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                {/* Card Header */}
                <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-border/80">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                        Dica do Dia
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded">
                        {tipIndex + 1}/{tipsList.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleNextTip}
                      className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 active:scale-95 transition-all cursor-pointer"
                      title="Alternar para a próxima dica"
                    >
                      <RefreshCw className={cn("w-3 h-3", isSpinning && "animate-spin")} />
                      <span>Outra dica</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsExpanded(false)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      aria-label="Minimizar dica"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tip Text - completely opaque, 100% legible */}
                <p className="text-sm font-medium text-foreground leading-relaxed px-1 py-1">
                  {currentTip}
                </p>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-border/60">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-all active:scale-95 border border-border/40 cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-semibold">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar texto</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="text-xs text-muted-foreground hover:text-destructive px-2.5 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      Dispensar hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsExpanded(false)}
                      className="text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-3.5 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

// ============== DESKTOP: Original floating card with cycling support ==============
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
            "bg-card/90 backdrop-blur-xl border border-border",
            "p-4 rounded-xl shadow-xl",
            "flex items-start gap-4 group"
          )}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-transparent opacity-50 pointer-events-none" />

            <div className="shrink-0 p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <Zap className="w-5 h-5" />
            </div>

            <div className="flex-1 pt-1 min-w-0 overflow-visible">
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-2">
                  Dica do Dia
                  <span className="w-1 h-1 rounded-full bg-primary/50 animate-pulse" />
                  <span className="text-[10px] text-muted-foreground font-mono font-normal">
                    ({tipIndex + 1}/{tipsList.length})
                  </span>
                </h4>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleNextTip}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                    title="Próxima dica"
                    aria-label="Próxima dica"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isSpinning && "animate-spin")} />
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                    aria-label="Fechar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed font-medium break-words whitespace-normal">
                {currentTip}
              </p>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

