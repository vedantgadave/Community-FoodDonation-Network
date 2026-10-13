import { useState, useEffect } from 'react';

const DISMISSAL_KEY = 'cfdn_pwa_install_dismissed_until';
const DISMISSAL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days cooldown

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Start true to prevent flash
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check iOS Safari environment
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // 3. Check dismissal expiry
    const dismissedUntil = localStorage.getItem(DISMISSAL_KEY);
    const now = Date.now();
    const hasActiveDismissal = dismissedUntil ? now < parseInt(dismissedUntil, 10) : false;
    setIsDismissed(hasActiveDismissal);

    // 4. Capture native beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // 5. Capture appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.removeItem(DISMISSAL_KEY);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // If iOS Safari, it's installable via Share menu
    if (isIosDevice && !hasActiveDismissal) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<'accepted' | 'dismissed' | 'manual_instructions'> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
        } else {
          // If user clicked dismiss on native prompt, set cooldown
          dismissPrompt();
        }
        return choice.outcome;
      } catch (err) {
        console.error('PWA install prompt error:', err);
        return 'dismissed';
      }
    }

    // iOS or unsupported browser: show instructions
    return 'manual_instructions';
  };

  const dismissPrompt = () => {
    const cooldownTime = Date.now() + DISMISSAL_COOLDOWN_MS;
    localStorage.setItem(DISMISSAL_KEY, cooldownTime.toString());
    setIsDismissed(true);
  };

  return {
    isInstallable,
    isInstalled,
    isDismissed,
    isIOS,
    canPromptNative: !!deferredPrompt,
    triggerInstall,
    dismissPrompt,
  };
}
