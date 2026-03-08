import { useEffect } from 'react';

let refreshing = false;

export default function UpdatePrompt() {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        // Only reload once per session to prevent infinite loops
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    }, []);

    return null;
}
