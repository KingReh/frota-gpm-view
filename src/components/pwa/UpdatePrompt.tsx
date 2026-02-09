import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function UpdatePrompt() {
    const [showUpdate, setShowUpdate] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    useEffect(() => {
        // Check if SW is already waiting
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                if (registration.waiting) {
                    setWaitingWorker(registration.waiting);
                    setShowUpdate(true);
                }
            });

            // Listen for new SW updates
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

            // We need to add this listener to the registration
            // This is a simplified approach; in production, you might want a more robust way to get the registration
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

            // Reload page when new SW takes control
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    };

    if (!showUpdate) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="fixed bottom-4 right-4 z-[100] md:w-auto"
            >
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
                            className="h-8 text-xs bg-white text-blue-600 hover:bg-blue-50"
                        >
                            <RefreshCw className="w-3 h-3 mr-1.5" />
                            Atualizar
                        </Button>
                        <button
                            onClick={() => setShowUpdate(false)}
                            className="p-1 hover:bg-white/20 rounded-md transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
