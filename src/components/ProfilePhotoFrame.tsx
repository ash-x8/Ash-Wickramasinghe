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
 * Standard CSS filter strings for non-destructive portrait styling.
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
  const [revealDone, setRevealDone] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Preload image without crossOrigin restrictions (avoids CORS failures)
  useEffect(() => {
    if (!src || !src.trim()) {
      setIsLoaded(false);
      setHasError(true);
      return;
    }

    setHasError(false);
    setIsLoaded(false);
    setRevealDone(false);

    let active = true;
    const img = new Image();

    img.onload = () => {
      if (active) {
        setIsLoaded(true);
        setHasError(false);
        // Brief 400ms smooth reveal
        setTimeout(() => {
          if (active) setRevealDone(true);
        }, 400);
      }
    };

    img.onerror = () => {
      if (active) {
        console.warn("Portrait photo failed to load:", src);
        setHasError(true);
        setIsLoaded(false);
      }
    };

    img.src = src;

    if (img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
      setHasError(false);
      setTimeout(() => {
        if (active) setRevealDone(true);
      }, 400);
    }

    return () => {
      active = false;
    };
  }, [src]);

  const effectiveFilter = getEffectFilterStyle(effect, isHovered);
  const showFallback = !src || hasError;

  return (
    <div 
      className={`relative group w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Luxury Subtle Glow on Hover */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#C59B63]/25 via-[#C59B63]/5 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Main Frame Container: Strict 1:1 Square Aspect Ratio */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#0A0D14] border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 shadow-2xl shadow-black/80">
        
        {/* Real Uploaded Photo with Smooth Blur-to-Sharp Reveal */}
        {src && !hasError && (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            onLoad={() => {
              setIsLoaded(true);
              setHasError(false);
            }}
            onError={() => {
              if (!imgRef.current?.complete || imgRef.current?.naturalWidth === 0) {
                setHasError(true);
              }
            }}
            style={{
              filter: isLoaded 
                ? (revealDone ? effectiveFilter : `${effectiveFilter} blur(6px)`)
                : 'blur(12px) opacity(0)',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? (isHovered ? 'scale(1.02)' : 'scale(1.0)') : 'scale(1.04)',
              transition: 'filter 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease, transform 0.6s ease'
            }}
            className="w-full h-full object-cover object-center absolute inset-0 z-10"
          />
        )}

        {/* Soft Light Sweep overlay during initial reveal */}
        {isLoaded && !revealDone && (
          <div className="absolute inset-0 z-12 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse" />
        )}

        {/* Clean Minimal Monogram Fallback (never broken box or old AI images) */}
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

        {/* Identity Badge */}
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
