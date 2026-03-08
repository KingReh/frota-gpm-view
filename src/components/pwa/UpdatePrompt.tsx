import { useEffect } from 'react';

export default function UpdatePrompt() {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const autoUpdate = (worker: ServiceWorker) => {
            worker.postMessage({ type: 'SKIP_WAITING' });
        };

        navigator.serviceWorker.ready.then((registration) => {
            if (registration.waiting) {
                autoUpdate(registration.waiting);
            }
        });

        navigator.serviceWorker.getRegistration().then(reg => {
            if (!reg) return;
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            autoUpdate(newWorker);
                        }
                    });
                }
            });
        });

        // Reload silently when new SW takes control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }, []);

    return null;
}
