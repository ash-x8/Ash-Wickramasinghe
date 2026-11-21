import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export const SiteInitialLoader: React.FC = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (isAdminPath || prefersReducedMotion) return false;
    try {
      return !sessionStorage.getItem('ash_site_loaded');
    } catch {
      return false;
    }
  });

  const [progress, setProgress] = useState(35);
  const isDismissing = useRef(false);

  const dismissLoader = () => {
    if (isDismissing.current) return;
    isDismissing.current = true;
    try {
      sessionStorage.setItem('ash_site_loaded', 'true');
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!loading || isAdminPath || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + 35, 100);
      });
    }, 60);

    const timer = setTimeout(() => {
      dismissLoader();
    }, 400);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissLoader();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [loading, isAdminPath, prefersReducedMotion]);

  if (isAdminPath || prefersReducedMotion || !loading) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="site-initial-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25, ease: 'easeInOut' } }}
          onClick={dismissLoader}
          className="fixed inset-0 z-80 bg-slate-50 dark:bg-[#0A0D14] flex flex-col items-center justify-center p-6 select-none overflow-hidden cursor-pointer pointer-events-auto"
        >
          <div className="relative z-10 flex flex-col items-center max-w-sm w-full space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-20 h-20 rounded-full border border-[#C59B63]/40 flex items-center justify-center">
              <span className="font-serif font-bold text-2xl tracking-widest text-[#9E6B24] dark:text-[#C59B63]">
                AW
              </span>
            </div>

            <div className="text-center space-y-1">
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9E6B24] dark:text-[#C59B63]">
                Ash Wickramasinghe
              </div>
              <div className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Design &middot; Branding &middot; Editorial
              </div>
            </div>

            <div className="w-full space-y-2">
              <div className="h-1 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#C59B63]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center justify-end text-[10px] font-mono text-slate-500">
                <button
                  type="button"
                  onClick={dismissLoader}
                  className="hover:text-[#9E6B24] dark:hover:text-[#C59B63] transition-colors cursor-pointer"
                >
                  Skip [Esc]
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
