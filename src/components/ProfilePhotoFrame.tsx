import React, { useState, useEffect, useRef } from 'react';
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
 * Clean standard CSS filter strings.
 * Applied non-destructively through standard CSS so original source image is never modified.
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
      return 'grayscale(100%) contrast(100%) brightness(100%)';
  }
};

export const ProfilePhotoFrame: React.FC<ProfilePhotoFrameProps> = ({
  src,
  alt = "Ash Wickramasinghe - Portrait",
  statusText = "Available for selected creative projects",
  effect = "grayscale",
  className = ""
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [minDelayPassed, setMinDelayPassed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // 1. Minimum 1.2s loading animation duration so reveal animation is appreciated, max 2.5s failsafe
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinDelayPassed(true);
    }, 1100);

    const maxTimer = setTimeout(() => {
      setMinDelayPassed(true);
      setIsLoaded(true);
    }, 2500);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  // 2. Preload & verify image availability
  useEffect(() => {
    if (!src || !src.trim()) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    setHasError(false);
    setIsLoaded(false);

    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (active) {
        setIsLoaded(true);
        setHasError(false);
      }
    };

    img.onerror = () => {
      if (active) {
        // If cors fails, try without crossOrigin
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          if (active) {
            setIsLoaded(true);
            setHasError(false);
          }
        };
        fallbackImg.onerror = () => {
          if (active) {
            setHasError(true);
            setIsLoaded(true);
          }
        };
        fallbackImg.src = src;
      }
    };

    img.src = src;

    // In case image is already complete in memory
    if (img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
      setHasError(false);
    }

    return () => {
      active = false;
    };
  }, [src]);

  const effectiveFilter = getEffectFilterStyle(effect, isHovered);
  const showPhoto = Boolean(src && isLoaded && !hasError && minDelayPassed);
  const showLoader = !minDelayPassed || (!isLoaded && !hasError && Boolean(src));
  const showFallback = (!src || hasError) && minDelayPassed;

  return (
    <div 
      className={`relative group w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Luxury Subtle Glow on Hover */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#C59B63]/25 via-[#C59B63]/5 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Main Frame Container: Strict 1:1 Square (4x4) Aspect Ratio */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#0A0D14] border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 shadow-2xl shadow-black/80">
        
        {/* Phase A: Modern Loading / Reveal Animation (Shown for 1-2 seconds) */}
        <AnimatePresence>
          {showLoader && (
            <motion.div
              key="portrait-loader"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-20 bg-[#0E121B] flex flex-col items-center justify-center space-y-4 pointer-events-none"
            >
              {/* Subtle ambient light sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-pulse" />
              
              {/* Minimal Luxury Aperture Loader */}
              <div className="relative w-16 h-16 rounded-full border border-[#C59B63]/30 flex items-center justify-center bg-black/50 backdrop-blur-sm shadow-lg shadow-black/60">
                <div className="w-12 h-12 rounded-full border-2 border-t-[#C59B63] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <span className="absolute text-[11px] font-mono text-[#C59B63] font-bold tracking-widest">AW</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-neutral-300 uppercase font-semibold">
                  Synchronizing Portrait
                </span>
                <span className="text-[9px] font-mono text-[#C59B63]/80 tracking-wider">
                  Verified Archive
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase B: Real Uploaded Photo with Non-destructive Effect Filter */}
        {src && (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              if (!imgRef.current?.complete || imgRef.current?.naturalWidth === 0) {
                setHasError(true);
              }
            }}
            style={{
              filter: effectiveFilter,
              opacity: showPhoto ? 1 : 0,
              transform: showPhoto ? (isHovered ? 'scale(1.02)' : 'scale(1.0)') : 'scale(1.04)',
              transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s ease, filter 0.4s ease'
            }}
            className="w-full h-full object-cover object-center absolute inset-0 z-10"
          />
        )}

        {/* Phase C: Clean, Neutral Modern UI Fallback (Never old AI image) */}
        {showFallback && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0E121B] text-[#C59B63] p-6 text-center absolute inset-0 z-10">
            <div className="w-20 h-20 rounded-2xl border border-[#C59B63]/40 bg-gradient-to-br from-black/80 to-[#141A26] flex items-center justify-center font-bold text-2xl tracking-widest text-[#C59B63] shadow-xl shadow-black/80 mb-3 font-mono">
              AW
            </div>
            <span className="text-sm font-semibold text-slate-200 tracking-wide font-sans">
              Ash Wickramasinghe
            </span>
            <span className="mt-1 text-[10px] text-[#C59B63]/80 font-mono tracking-wider uppercase">
              Creative Portfolio
            </span>
          </div>
        )}

        {/* Ambient Film Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none z-15" />

        {/* Gold HUD Corner Brackets */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#C59B63]/70 pointer-events-none transition-transform duration-300 group-hover:scale-110 z-15" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#C59B63]/70 pointer-events-none transition-transform duration-300 group-hover:scale-110 z-15" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#C59B63]/70 pointer-events-none transition-transform duration-300 group-hover:scale-110 z-15" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#C59B63]/70 pointer-events-none transition-transform duration-300 group-hover:scale-110 z-15" />

        {/* Cyber Identity Badge */}
        <div className="absolute top-3.5 left-5 flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-[#C59B63]/90 uppercase pointer-events-none z-15">
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
          <span className="font-medium text-emerald-400 text-xs tracking-tight line-clamp-1">
            {statusText || "Available for selected creative projects"}
          </span>
        </div>
      </div>
    </div>
  );
};
