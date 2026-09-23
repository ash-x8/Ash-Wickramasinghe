import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ProfileEffectType = 'normal' | 'bw' | 'blur' | 'cinematic' | 'grayscale' | 'contrast';

interface ProfilePhotoFrameProps {
  src: string;
  alt?: string;
  statusText?: string;
  effect?: ProfileEffectType;
  className?: string;
}

export const ProfilePhotoFrame: React.FC<ProfilePhotoFrameProps> = ({
  src,
  alt = "Ash Wickramasinghe - Portrait",
  statusText = "Open for Select Projects",
  effect = "cinematic",
  className = ""
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check user preference for reduced motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Safety timeout: Ensure loading indicator is removed after maximum 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [src]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Map non-destructive visual effects into CSS filter classes
  const getEffectClasses = (eff: ProfileEffectType): string => {
    switch (eff) {
      case 'normal':
        return 'brightness-100 contrast-100 saturate-100';
      case 'bw':
        return 'grayscale contrast-125 brightness-95';
      case 'grayscale':
        return 'grayscale contrast-100 brightness-100';
      case 'cinematic':
        return 'contrast-110 saturate-[0.88] brightness-95 sepia-[0.10]';
      case 'blur':
        return 'blur-[1.5px] contrast-105 group-hover:blur-0 transition-all duration-700';
      case 'contrast':
        return 'contrast-130 brightness-95 saturate-110';
      default:
        return 'contrast-110 saturate-[0.88] brightness-95 sepia-[0.10]';
    }
  };

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Luxury Glow Halo on Hover */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#C59B63]/25 via-[#C59B63]/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Main Frame Container */}
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#0D111A] border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 shadow-2xl shadow-black/80">
        
        {/* Modern progressive reveal animation overlay */}
        <AnimatePresence>
          {!isLoaded && !hasError && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-10 bg-[#0E121B] flex flex-col items-center justify-center space-y-4 pointer-events-none"
            >
              {/* Subtle ambient light sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer_1.8s_infinite] -translate-x-full" />
              
              {/* Minimal Luxury Aperture Loader */}
              <div className="relative w-14 h-14 rounded-full border border-[#C59B63]/30 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-t-[#C59B63] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <span className="absolute text-[9px] font-mono text-[#C59B63] font-bold tracking-widest">AW</span>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                Loading Portrait...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fallback state if portrait fails to load */}
        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#111622] text-[#C59B63] p-6 text-center">
            <div className="w-20 h-20 rounded-2xl border border-[#C59B63]/40 bg-black/40 flex items-center justify-center font-bold text-2xl tracking-wider text-amber-300 shadow-lg">
              AW
            </div>
            <span className="mt-4 text-xs font-mono text-slate-300 tracking-wider">
              Ash Wickramasinghe
            </span>
            <span className="mt-1 text-[10px] text-slate-500 font-mono">
              Creative Digital Media
            </span>
          </div>
        ) : (
          <motion.img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onLoad={handleImageLoad}
            onError={handleImageError}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
            animate={
              prefersReducedMotion
                ? { opacity: isLoaded ? 1 : 0 }
                : {
                    opacity: isLoaded ? 1 : 0,
                    scale: isLoaded ? (isHovered ? 1.025 : 1) : 1.04,
                    filter: isLoaded ? 'blur(0px)' : 'blur(8px)'
                  }
            }
            transition={{
              duration: prefersReducedMotion ? 0.3 : 0.65,
              ease: [0.16, 1, 0.3, 1]
            }}
            className={`w-full h-full object-cover transition-all duration-700 ${getEffectClasses(effect)}`}
          />
        )}

        {/* Ambient Film Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* Refined Gold HUD Corner Brackets */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#C59B63]/70 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#C59B63]/70 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#C59B63]/70 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#C59B63]/70 pointer-events-none transition-transform duration-300 group-hover:scale-110" />

        {/* Subtle Cyber Identity Tag */}
        <div className="absolute top-3.5 left-5 flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-[#C59B63]/80 uppercase pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C59B63]" />
          <span>PORTRAIT // ARCHIVE</span>
        </div>
      </div>

      {/* Floating Status Pill Indicator Below Photo */}
      <div className="mt-3.5 p-3 rounded-xl border border-neutral-800/80 bg-[#111622]/85 backdrop-blur-sm flex items-center justify-between text-xs">
        <span className="text-neutral-400 text-[11px] font-mono uppercase tracking-wider">Status</span>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </span>
          <span className="font-medium text-emerald-400 text-xs tracking-tight">{statusText}</span>
        </div>
      </div>
    </div>
  );
};
