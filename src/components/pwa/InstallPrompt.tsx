import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // Check if running in standalone mode (already installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://');

        if (isStandalone) return;

        // Check if user has dismissed the prompt recently (e.g., in the last 7 days)
        const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
        if (lastDismissed) {
            const days = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
            if (days < 7) return;
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // For Android/Chrome
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Show iOS prompt after a delay if meaningful interaction has happened (simulated here by small delay)
        if (isIosDevice) {
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowPrompt(false);
            }
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    };

    useEffect(() => {
        const event = new CustomEvent('pwa-prompt-visibility', { detail: showPrompt });
        window.dispatchEvent(event);
    }, [showPrompt]);

    if (!showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
            >
                <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                                <img src="/icons/icon-192.svg" alt="Logo" className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Instalar App</h3>
                                <p className="text-sm text-zinc-400">Acesso rápido como um aplicativo nativo em seu dispositivo móvel ou desktop.</p>
                            </div>
                        </div>
                        <button onClick={handleDismiss} className="text-zinc-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {isIOS ? (
                        <div className="text-sm text-zinc-300 space-y-2 bg-white/5 p-3 rounded-lg border border-white/5">
                            <p className="flex items-center gap-2">
                                1. Toque em <Share size={16} className="text-blue-400" /> na barra inferior
                            </p>
                            <p className="flex items-center gap-2">
                                2. Selecione <span className="text-white font-medium">Adicionar à Tela de Início</span> <PlusSquare size={16} />
                            </p>
                        </div>
                    ) : (
                        <Button
                            onClick={handleInstallClick}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/25"
                        >
                            Instalar Agora
                        </Button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
