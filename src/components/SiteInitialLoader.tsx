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
    if (isAdminPath) return false;
    if (prefersReducedMotion) return false;
    try {
      return !sessionStorage.getItem('ash_site_loaded');
    } catch {
      return false;
    }
  });

  const [progress, setProgress] = useState(30);
  const isDismissing = useRef(false);

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

    // Guaranteed auto-dismiss within 500ms max so it can never hang
    const timer = setTimeout(() => {
      dismissLoader();
    }, 450);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissLoader();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [loading, isAdminPath, prefersReducedMotion]);

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

  if (isAdminPath || prefersReducedMotion || !loading) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="site-initial-loader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.3, ease: 'easeInOut' }
          }}
          onClick={dismissLoader}
          className="fixed inset-0 z-80 bg-[#0A0D14] flex flex-col items-center justify-center p-6 select-none overflow-hidden cursor-pointer pointer-events-auto"
        >
          {/* Subtle Cyber Grid Background */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(197, 155, 99, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(197, 155, 99, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />

          {/* Ambient Glow */}
          <div className="absolute w-96 h-96 rounded-full bg-[#C59B63]/10 blur-[120px] pointer-events-none" />

          {/* Loader Center Frame */}
          <div 
            className="relative z-10 flex flex-col items-center max-w-sm w-full space-y-7"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Monogram Reticle */}
            <div className="relative flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                className="w-24 h-24 rounded-full border border-dashed border-[#C59B63]/30"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute w-20 h-20 rounded-full border border-t-[#C59B63] border-r-[#C59B63]/40 border-b-transparent border-l-transparent"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif font-bold text-2xl tracking-widest text-[#C59B63] select-none">
                  AW
                </span>
              </div>
            </div>

            {/* Title & Cyber Telemetry */}
            <div className="text-center space-y-1.5">
              <div className="text-xs font-mono uppercase tracking-[0.25em] text-[#C59B63]">
                Ash Wickramasinghe
              </div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                Creative Portfolio &bull; System Archive
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C59B63] shadow-[0_0_6px_#C59B63]" />
                  <span>Loading Assets</span>
                </span>
                <span className="text-[#C59B63] font-semibold">{progress}%</span>
              </div>
              
              <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#8C6230] via-[#C59B63] to-[#F3D7A4]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Technical Footer Status */}
            <div className="flex items-center justify-between w-full pt-1 text-[9px] font-mono uppercase tracking-wider text-slate-500">
              <span>DESIGN &bull; BRANDING &bull; EDITORIAL</span>
              <button 
                type="button"
                onClick={dismissLoader}
                className="text-slate-400 hover:text-[#C59B63] transition-colors cursor-pointer underline underline-offset-2"
              >
                Skip Intro [Esc]
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
