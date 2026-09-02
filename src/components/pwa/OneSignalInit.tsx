import { useEffect } from 'react';

const DEFAULT_ONESIGNAL_APP_ID = '18bb0c47-0bc7-4b2e-8e62-95207f14a59a';
const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || DEFAULT_ONESIGNAL_APP_ID;

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => Promise<void>>;
  }
}

export default function OneSignalInit() {
  useEffect(() => {
    // Only load OneSignal if on production domain or custom App ID is provided
    const hostname = window.location.hostname;
    const isAllowedDomain = hostname === 'frotagpm.vercel.app' || Boolean(import.meta.env.VITE_ONESIGNAL_APP_ID);

    if (!isAllowedDomain) {
      return;
    }

    // Only load script once
    if (document.querySelector('script[src*="OneSignalSDK"]')) return;

    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      script.onerror = () => {
        console.warn('OneSignal SDK failed to load from CDN');
      };
      document.head.appendChild(script);

      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal: any) {
        try {
          await OneSignal.init({
            appId: ONESIGNAL_APP_ID,
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerParam: { scope: '/' },
            serviceWorkerPath: '/OneSignalSDKWorker.js',
            notifyButton: {
              enable: false,
            },
          });

          // Prompt push permission after init if available
          try {
            const permission = await OneSignal.Notifications?.permission;
            if (!permission && OneSignal.Slidedown?.promptPush) {
              await OneSignal.Slidedown.promptPush();
            }
          } catch (e) {
            console.warn('OneSignal promptPush skipped:', e);
          }
        } catch (initError: any) {
          // Gracefully suppress domain mismatch or unconfigured origin errors in preview/staging
          console.warn('OneSignal init notice (domain or configuration):', initError?.message || initError);
        }
      });
    } catch (e) {
      console.warn('OneSignal setup error:', e);
    }
  }, []);

  return null;
}
