import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const VAPID_PUBLIC_KEY = 'BDmJmOmMPkGhjMOaMf39yNFInoqCPRFMsyjV48vkjI0TQ4FLEkBvIxuPIwlPLaBEZ0TCRA4MvBwQ_BwuPZMExd8';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [showBanner, setShowBanner] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // Check support
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      return;
    }

    // Already subscribed
    if (localStorage.getItem('push_subscribed') === 'true') {
      return;
    }

    // Already granted or denied - don't show banner
    if (Notification.permission === 'denied') {
      return;
    }

    if (Notification.permission === 'granted') {
      // Auto-subscribe silently
      subscribeUser();
      return;
    }

    // Show banner after delay
    const timer = setTimeout(() => setShowBanner(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const subscribeUser = async () => {
    setIsSubscribing(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys) {
        throw new Error('Invalid subscription');
      }

      // Upsert to Supabase
      await supabase.from('push_subscriptions').upsert(
        {
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh!,
          auth: subJson.keys.auth!,
          user_agent: navigator.userAgent,
          last_used_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

      localStorage.setItem('push_subscribed', 'true');
      setShowBanner(false);
    } catch (err) {
      console.error('Push subscription failed:', err);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleEnable = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await subscribeUser();
    } else {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('push_dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

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
              <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Ativar Notificações</h3>
                <p className="text-sm text-zinc-400">
                  Receba alertas quando o saldo de combustível for atualizado.
                </p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-zinc-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <Button
            onClick={handleEnable}
            disabled={isSubscribing}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-lg shadow-amber-500/25"
          >
            {isSubscribing ? 'Ativando...' : 'Ativar Notificações'}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
