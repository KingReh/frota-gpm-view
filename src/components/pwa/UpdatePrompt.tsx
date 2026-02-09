import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSwipeDismiss } from '@/hooks/useSwipeDismiss';

export default function UpdatePrompt() {
    const [showUpdate, setShowUpdate] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    const handleDismiss = useCallback(() => setShowUpdate(false), []);
    const { ref: swipeRef, handlers } = useSwipeDismiss({ onDismiss: handleDismiss, direction: 'right' });

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                if (registration.waiting) {
                    setWaitingWorker(registration.waiting);
                    setShowUpdate(true);
                }
            });

            const handleUpdateFound = (event: Event) => {
                const registration = (event.target as ServiceWorkerRegistration);
                const newWorker = registration.installing;

                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            setWaitingWorker(newWorker);
                            setShowUpdate(true);
                        }
                    });
                }
            };

            navigator.serviceWorker.getRegistration().then(reg => {
                if (reg) {
                    reg.addEventListener('updatefound', handleUpdateFound);
                }
            });
        }
    }, []);

    const handleUpdate = () => {
        if (waitingWorker) {
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
            setShowUpdate(false);
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    };

    if (!showUpdate) return null;

    return (
        <AnimatePresence>
            <motion.div
                ref={swipeRef}
                {...handlers}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="fixed bottom-4 right-4 z-[100] md:w-auto touch-pan-y cursor-grab active:cursor-grabbing"
            >
                {/* Swipe hint */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-1 h-6 rounded-full bg-white/20 md:hidden" />
                <div className="bg-blue-600/90 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-2xl flex items-center gap-4 text-white">
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">Nova versão disponível</span>
                        <span className="text-xs text-blue-100">Atualize para continuar</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleUpdate}
                            className="h-8 text-xs bg-white text-blue-600 hover:bg-blue-50 active:bg-blue-100"
                        >
                            <RefreshCw className="w-3 h-3 mr-1.5" />
                            Atualizar
                        </Button>
                        <button
                            onClick={handleDismiss}
                            className="p-1 hover:bg-white/20 active:bg-white/30 rounded-md transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
