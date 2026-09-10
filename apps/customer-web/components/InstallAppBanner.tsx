'use client';

import React, { useState, useEffect } from 'react';
import { useStorefrontConfig } from './StorefrontConfigContext';

export function InstallAppBanner() {
  const { config } = useStorefrontConfig();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showDesktopModal, setShowDesktopModal] = useState(false);
  const [hostname, setHostname] = useState('order.cheezious.com');

  const brandName = config.settings?.restaurant_display_name || config.tenant?.name || 'Cheezious';
  const logoUrl = config.settings?.theme_json?.logo_url || 'https://cheezious.com/cheezious.svg';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Register PWA Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.log('SW registration error:', err));
    }

    // Capture hostname
    setHostname(window.location.hostname || 'cheezious.com');

    // Check if already running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    // Check if previously dismissed in current session
    const isDismissed = sessionStorage.getItem('cheezious_pwa_banner_dismissed');
    if (isDismissed) {
      setIsVisible(false);
      return;
    }

    // Check for iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Chromium / Android / Desktop PWA install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).__cheezious_deferred_prompt = e;
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleExternalTrigger = () => {
      handleInstallClick();
    };

    window.addEventListener('trigger-pwa-install', handleExternalTrigger);

    // If on mobile or desktop without beforeinstallprompt triggered yet, show banner after a small delay
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('cheezious_pwa_banner_dismissed')) {
        setIsVisible(true);
      }
    }, 1200);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('trigger-pwa-install', handleExternalTrigger);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await Promise.race([
          deferredPrompt.userChoice,
          new Promise((resolve) => setTimeout(() => resolve('timeout'), 800)),
        ]);
        if (choice && typeof choice === 'object' && (choice as any).outcome === 'accepted') {
          setIsVisible(false);
        } else if (choice === 'timeout') {
          setShowDesktopModal(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        setShowDesktopModal(true);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowDesktopModal(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cheezious_pwa_banner_dismissed', 'true');
    }
  };

  return (
    <>
      {/* Floating Top Install Notification Banner (Matching User's Reference Screenshot) */}
      {isVisible && (
        <div className="fixed top-2.5 left-0 right-0 z-[100] px-3 sm:px-4 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="pointer-events-auto w-full max-w-md bg-[#1B2129] text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-white/15 flex items-center justify-between gap-3 transition-all hover:border-white/25">
          {/* App Icon */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#F15B25] to-[#E63946] p-1 flex items-center justify-center shrink-0 shadow-sm">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-full w-full object-contain filter drop-shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-white font-black text-xl">{brandName.charAt(0)}</span>
              )}
            </div>

            {/* App Title & Subtitle Domain */}
            <div className="min-w-0">
              <div className="font-bold text-sm text-white truncate tracking-tight">
                Install {brandName}
              </div>
              <div className="text-xs text-gray-400 truncate mt-0.5">
                {hostname}
              </div>
            </div>
          </div>

          {/* Action: Install Button & Close */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 text-sm font-black text-[#38BDF8] hover:text-[#7DD3FC] hover:bg-white/10 active:scale-95 rounded-xl transition-all cursor-pointer tracking-wide"
            >
              Install
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="h-7 w-7 rounded-full text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer text-xs"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
      )}

      {/* iOS Safari Install Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-gray-900 shadow-2xl border border-gray-100 space-y-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#F15B25] to-[#E63946] mx-auto flex items-center justify-center shadow-md">
              <span className="text-2xl text-white font-black">{brandName.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Install {brandName} on iOS</h3>
              <p className="text-xs text-gray-500 mt-1">
                Install directly onto your iPhone or iPad home screen for instant ordering and order tracking.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl text-xs space-y-2.5 text-left border border-gray-100 font-medium text-gray-700">
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">1</span>
                <span>Tap the <strong>Share</strong> icon (⎋) in Safari at the bottom.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">2</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong> (⊞).</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong>Add</strong> in the top-right corner.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 bg-[#F15B25] text-white font-bold rounded-xl text-sm shadow transition hover:bg-[#d94a18] cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Desktop / Linux / Windows Install Guide Modal */}
      {showDesktopModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-gray-900 shadow-2xl border border-gray-100 space-y-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#F15B25] to-[#E63946] mx-auto flex items-center justify-center shadow-md">
              <span className="text-2xl text-white font-black">{brandName.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Install Desktop / Linux App</h3>
              <p className="text-xs text-gray-500 mt-1">
                Install {brandName} as a standalone desktop application on Linux, Windows, or macOS.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl text-xs space-y-2.5 text-left border border-gray-100 font-medium text-gray-700">
              <div className="flex items-start gap-2.5">
                <span className="text-lg">💻</span>
                <span>
                  Click the <strong>Install App (⬇️)</strong> icon located in your browser&apos;s address bar next to the bookmark star.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-lg">🚀</span>
                <span>
                  Once installed, {brandName} launches in its own dedicated, fast window with offline capabilities and desktop notifications!
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDesktopModal(false)}
              className="w-full py-3 bg-[#F15B25] text-white font-bold rounded-xl text-sm shadow transition hover:bg-[#d94a18] cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
