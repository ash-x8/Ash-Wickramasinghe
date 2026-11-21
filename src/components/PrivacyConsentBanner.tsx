import React, { useEffect, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { trackPageView } from '../lib/firebase';
import { useLocation } from 'react-router-dom';

const CONSENT_KEY = 'ash_privacy_consent';

export const openPrivacyPreferences = () => {
  window.dispatchEvent(new CustomEvent('ash-privacy-consent-open'));
};

export const PrivacyConsentBanner: React.FC = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (!saved) {
        setVisible(true);
      }
    } catch {
      // Ignore storage failures
    }

    const handleReopen = () => setVisible(true);
    window.addEventListener('ash-privacy-consent-open', handleReopen);
    return () => window.removeEventListener('ash-privacy-consent-open', handleReopen);
  }, []);

  if (isAdminRoute || !visible) return null;

  const choose = (choice: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
    } catch {
      // Ignore storage errors
    }
    setVisible(false);
    if (choice === 'accepted') {
      trackPageView(location.pathname).catch(() => {});
    }
  };

  return (
    <aside
      role="dialog"
      aria-label="Privacy and analytics preferences"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-40 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111622]/95 backdrop-blur-xl shadow-2xl p-4 sm:p-5 text-xs text-slate-700 dark:text-slate-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#C59B63]/15 border border-[#C59B63]/30 flex items-center justify-center shrink-0 text-[#9E6B24] dark:text-[#C59B63]">
          <ShieldCheck size={16} />
        </div>
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Privacy-Friendly Analytics
            </h3>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
              aria-label="Dismiss privacy banner"
            >
              <X size={14} />
            </button>
          </div>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400">
            This portfolio uses anonymous daily visitor hashes (never storing raw IP addresses or ad trackers) to understand which projects and articles are most helpful.
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => choose('declined')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors cursor-pointer"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={() => choose('accepted')}
              className="px-3.5 py-1.5 rounded-lg bg-[#C59B63] text-[#0A0D14] hover:bg-[#D4AF37] font-semibold transition-colors cursor-pointer"
            >
              Accept Analytics
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
