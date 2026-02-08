import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Progressive Web App - Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(registration => {
                console.log('SW registered successfully with scope: ', registration.scope);

                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 1000 * 60 * 60); // Check every hour
            })
            .catch(error => {
                console.error('SW registration failed: ', error);
            });
    });
}
