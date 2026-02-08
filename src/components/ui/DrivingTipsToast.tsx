"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DRIVING_TIPS = [
  "Mantenha sempre a distância de segurança do veículo à frente.",
  "Verifique a pressão dos pneus semanalmente para economizar combustível.",
  "Use o freio motor em descidas longas para poupar os freios.",
  "Evite acelerações bruscas para preservar a bateria e o motor.",
  "Sinalize com antecedência todas as suas manobras.",
  "Verifique o nível de óleo e fluidos regularmente.",
  "Em dias de chuva, reduza a velocidade e acenda os faróis.",
  "Faça o rodízio de pneus a cada 10.000 km.",
  "Respeite sempre os limites de velocidade da via.",
  "Mantenha o sistema de arrefecimento sempre limpo.",
  "Evite carregar peso desnecessário no veículo.",
  "Troque as marchas no tempo certo para otimizar o consumo.",
  "Atenção redobrada em cruzamentos e rotatórias.",
  "Realize a manutenção preventiva conforme o manual.",
  "Use o cinto de segurança, inclusive no banco traseiro."
];

export const DrivingTipsToast = () => {
  const [tip, setTip] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [hasPwaPrompt, setHasPwaPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Select a random tip on mount
    const randomTip = DRIVING_TIPS[Math.floor(Math.random() * DRIVING_TIPS.length)];
    setTip(randomTip);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Delay appearance slightly for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
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

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className={cn(
            "fixed left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:bottom-8 md:right-8 z-50 w-full max-w-lg px-4 pointer-events-none transition-all duration-500 ease-in-out",
            hasPwaPrompt
              ? (isIOS ? "bottom-[225px] md:bottom-[180px]" : "bottom-[210px] md:bottom-[205px]")
              : "bottom-4 md:bottom-8"
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
            className={cn(
              "pointer-events-auto relative overflow-hidden",
              "bg-black/40 backdrop-blur-xl border border-white/10",
              "p-4 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
              "flex items-start gap-4 group"
            )}
          >
            {/* Ambient Glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-transparent opacity-50 pointer-events-none" />

            {/* Icon */}
            <div className="shrink-0 p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <Zap className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1 flex items-center gap-2">
                  Dica do Dia
                  <span className="w-1 h-1 rounded-full bg-primary/50 animate-pulse" />
                </h4>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed font-medium">
                {tip}
              </p>
            </div>

            {/* Bottom Progress/Border Accent */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
