import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (compact) {
      return (
        <button
          onClick={install}
          aria-label="Install App"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition shadow-xs cursor-pointer min-h-[36px]"
        >
          <Download className="w-3.5 h-3.5 text-teal-700" />
          <span>Install App</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-800 transition cursor-pointer min-h-[40px]"
      >
        <Download className="w-4 h-4" />
        <span>Install CarePulse App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/70 px-3 py-1.5 text-xs font-medium text-teal-900 hover:bg-teal-100 transition cursor-pointer min-h-[36px]"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-700" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Install CarePulse on iPhone</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs">1</span>
                  <span>Tap the <strong>Share</strong> icon in Safari's bottom toolbar.</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-xs">3</span>
                  <span>Tap <strong>Add</strong> in the top-right corner to launch CarePulse instantly like a native app.</span>
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition min-h-[44px] cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
