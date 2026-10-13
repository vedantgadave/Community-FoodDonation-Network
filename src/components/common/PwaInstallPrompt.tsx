import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { Download, X, Share, PlusSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const PwaInstallPrompt: React.FC = () => {
  const location = useLocation();
  const {
    isInstallable,
    isInstalled,
    isDismissed,
    isIOS,
    triggerInstall,
    dismissPrompt,
  } = usePwaInstall();

  const [visible, setVisible] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // 10. Avoid displaying popup on login/register screens to prevent obstructing authentication
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    // 1. First eligible visit: display popup after a gentle 2.5s delay
    if (isInstallable && !isInstalled && !isDismissed && !isAuthRoute) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isInstallable, isInstalled, isDismissed, isAuthRoute]);

  if (!visible || isInstalled || isAuthRoute) {
    return null;
  }

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      const outcome = await triggerInstall();
      if (outcome === 'accepted') {
        setVisible(false);
      } else if (outcome === 'manual_instructions') {
        setShowIosGuide(true);
      }
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    setVisible(false);
    setShowIosGuide(false);
  };

  return (
    <>
      {/* Bottom Corner Install Popup */}
      <aside
        aria-label="App Installation Prompt"
        className="fixed bottom-4 right-4 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
      >
        <div className="flex items-start gap-3">
          {/* App Icon */}
          <div className="w-11 h-11 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20 overflow-hidden">
            <img
              src="/icons/icon-192.png"
              alt="Community Food Donation App Icon"
              className="w-9 h-9 rounded-lg object-contain shadow-xs"
              onError={(e) => {
                // Fallback to SVG if png not loaded
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Get the Community Food Donation app
              </h2>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-lg -mr-1 transition-colors"
                aria-label="Dismiss installation prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
              Install our app for quick access to food donations and your dashboard.
            </p>

            <div className="flex items-center gap-2 mt-3 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                onClick={handleDismiss}
              >
                No, thanks
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs h-8 px-3 font-bold bg-emerald-600 hover:bg-emerald-700"
                onClick={handleInstallClick}
                loading={installing}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Install Now
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* iOS Safari Manual Installation Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" /> Install on iOS
              </h3>
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              To install <strong>Community Food Donation</strong> on your iPhone or iPad:
            </p>

            <ol className="space-y-3 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">1</span>
                <span>Tap the <strong>Share</strong> button <Share className="w-4 h-4 inline text-blue-500 mx-1" /> at the bottom of Safari.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">2</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-4 h-4 inline text-slate-600 mx-1" />.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong>Add</strong> in the top-right corner to launch anytime!</span>
              </li>
            </ol>

            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setShowIosGuide(false);
                handleDismiss();
              }}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
