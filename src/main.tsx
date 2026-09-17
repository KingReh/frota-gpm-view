import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Progressive Web App - Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/OneSignalSDKWorker.js', { scope: '/' })
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
