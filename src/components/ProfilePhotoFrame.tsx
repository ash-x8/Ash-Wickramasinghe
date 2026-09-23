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

/**
 * Returns clean standard CSS filter strings.
 * This guarantees the browser applies effects non-destructively without
 * conflicting with Framer Motion inline animation styles.
 */
export const getEffectFilterStyle = (eff: ProfileEffectType, isHovered: boolean = false): string => {
  switch (eff) {
    case 'normal':
      return 'none';
    case 'bw':
      return 'grayscale(100%) contrast(125%) brightness(95%)';
    case 'grayscale':
      return 'grayscale(100%) contrast(100%) brightness(100%)';
    case 'cinematic':
      return 'contrast(110%) saturate(88%) brightness(95%) sepia(10%)';
    case 'blur':
      return isHovered ? 'blur(0px) contrast(105%)' : 'blur(2px) contrast(105%)';
    case 'contrast':
      return 'contrast(130%) brightness(95%) saturate(110%)';
    default:
      return 'grayscale(100%) contrast(105%) brightness(100%)';
  }
};

export const ProfilePhotoFrame: React.FC<ProfilePhotoFrameProps> = ({
  src,
  alt = "Ash Wickramasinghe - Portrait",
  statusText = "Open for Select Projects",
  effect = "grayscale",
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

  // Reset states when source URL changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const effectiveFilter = getEffectFilterStyle(effect, isHovered);

  return (
    <div 
      className={`relative group w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Luxury Subtle Glow on Hover */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#C59B63]/20 via-[#C59B63]/5 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Main Frame Container: Strict 1:1 Square (4x4) Aspect Ratio */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#0A0D14] border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 shadow-2xl shadow-black/80">
        
        {/* State A: Loading Placeholder Frame (Shown while src is empty or image is loading) */}
        <AnimatePresence>
          {(!src || !isLoaded) && !hasError && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.2 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-10 bg-[#0E121B] flex flex-col items-center justify-center space-y-4 pointer-events-none"
            >
              {/* Subtle ambient light sweep */}
              {!prefersReducedMotion && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-pulse" />
              )}
              
              {/* Minimal Luxury Aperture Loader */}
              <div className="relative w-16 h-16 rounded-full border border-[#C59B63]/30 flex items-center justify-center bg-black/40">
                <div className="w-12 h-12 rounded-full border-2 border-t-[#C59B63] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <span className="absolute text-[10px] font-mono text-[#C59B63] font-bold tracking-widest">AW</span>
              </div>
              
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                {src ? "Synchronizing Portrait..." : "Official Creative Archive"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* State B: Error State (Neutral fallback, NEVER the old AI image) */}
        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0E121B] text-[#C59B63] p-6 text-center">
            <div className="w-16 h-16 rounded-2xl border border-[#C59B63]/40 bg-black/40 flex items-center justify-center font-bold text-xl tracking-wider text-amber-300 shadow-lg">
              AW
            </div>
            <span className="mt-3 text-xs font-mono text-slate-300 tracking-wider">
              Ash Wickramasinghe
            </span>
            <span className="mt-1 text-[10px] text-slate-500 font-mono">
              Portrait Reference Offline
            </span>
          </div>
        ) : (
          /* State C: Real Uploaded Image with Effect & Reveal Animation */
          src && (
            <motion.img
              src={src}
              alt={alt}
              referrerPolicy="no-referrer"
              onLoad={handleImageLoad}
              onError={handleImageError}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
              animate={
                prefersReducedMotion
                  ? { opacity: isLoaded ? 1 : 0 }
                  : {
                      opacity: isLoaded ? 1 : 0,
                      scale: isLoaded ? (isHovered ? 1.02 : 1) : 1.02
                    }
              }
              transition={{
                duration: prefersReducedMotion ? 0.2 : 0.5,
                ease: [0.16, 1, 0.3, 1]
              }}
              style={{
                filter: effectiveFilter,
                transition: 'filter 0.4s ease, transform 0.5s ease'
              }}
              className="w-full h-full object-cover object-center"
            />
          )
        )}

        {/* Ambient Film Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

        {/* Refined Gold HUD Corner Brackets */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#C59B63]/70 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#C59B63]/70 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#C59B63]/70 pointer-events-none transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#C59B63]/70 pointer-events-none transition-transform duration-300 group-hover:scale-110" />

        {/* Cyber Identity Badge */}
        <div className="absolute top-3.5 left-5 flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-[#C59B63]/90 uppercase pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C59B63]" />
          <span>PORTRAIT // 1:1</span>
        </div>
      </div>

      {/* Floating Status Pill Indicator Below Photo */}
      <div className="mt-3.5 p-3 rounded-xl border border-neutral-800/80 bg-[#111622]/85 backdrop-blur-sm flex items-center justify-between text-xs shadow-sm">
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
