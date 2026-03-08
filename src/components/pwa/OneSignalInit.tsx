import { useEffect } from 'react';

const ONESIGNAL_APP_ID = '18bb0c47-0bc7-4b2e-8e62-95207f14a59a';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => Promise<void>>;
  }
}

export default function OneSignalInit() {
  useEffect(() => {
    // Load OneSignal SDK script
    if (document.querySelector('script[src*="OneSignalSDK"]')) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.defer = true;
    document.head.appendChild(script);

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal: any) {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        serviceWorkerParam: { scope: '/' },
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        notifyButton: {
          enable: false,
        },
      });

      // Prompt push permission after init
      try {
        const permission = await OneSignal.Notifications.permission;
        if (!permission) {
          await OneSignal.Slidedown.promptPush();
        }
      } catch (e) {
        console.warn('OneSignal promptPush failed:', e);
      }
    });
  }, []);

  return null;
}
