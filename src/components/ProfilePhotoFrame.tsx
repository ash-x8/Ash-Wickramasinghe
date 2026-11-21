import React, { useState, useEffect, useRef } from 'react';

export type ProfileEffectType = 'normal' | 'bw' | 'blur' | 'cinematic' | 'grayscale' | 'contrast';

interface ProfilePhotoFrameProps {
  src: string;
  alt?: string;
  statusText?: string;
  effect?: ProfileEffectType;
  className?: string;
}

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
  alt = 'Ash Wickramasinghe - Portrait',
  statusText = 'Available for selected creative projects',
  effect = 'grayscale',
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [revealDone, setRevealDone] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

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
        setTimeout(() => {
          if (active) setRevealDone(true);
        }, 350);
      }
    };

    img.onerror = () => {
      if (active) {
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
      }, 350);
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
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#C59B63]/20 via-[#C59B63]/5 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#0A0D14] border border-slate-200 dark:border-neutral-800 shadow-xl dark:shadow-2xl dark:shadow-black/80">
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
                ? revealDone
                  ? effectiveFilter
                  : `${effectiveFilter} blur(6px)`
                : 'blur(12px) opacity(0)',
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? (isHovered ? 'scale(1.02)' : 'scale(1.0)') : 'scale(1.04)',
              transition: 'filter 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease, transform 0.6s ease'
            }}
            className="w-full h-full object-cover object-center absolute inset-0 z-10"
          />
        )}

        {showFallback && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 dark:bg-[#0E121B] text-[#C59B63] p-6 text-center absolute inset-0 z-10">
            <div className="w-20 h-20 rounded-2xl border border-[#C59B63]/40 bg-black/50 flex items-center justify-center font-bold text-2xl tracking-widest text-[#C59B63] shadow-lg mb-3 font-serif">
              AW
            </div>
            <span className="text-sm font-semibold text-white tracking-wide font-sans">
              Ash Wickramasinghe
            </span>
            <span className="mt-1 text-[11px] text-[#C59B63]/80 font-medium tracking-wider uppercase">
              Creative Portfolio
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 pointer-events-none z-15" />

        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#C59B63]/65 pointer-events-none z-15" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#C59B63]/65 pointer-events-none z-15" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#C59B63]/65 pointer-events-none z-15" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#C59B63]/65 pointer-events-none z-15" />
      </div>

      <div className="mt-3.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-800/80 bg-white/90 dark:bg-[#111622]/85 backdrop-blur-sm flex items-center justify-between gap-3 text-xs shadow-sm">
        <span className="text-slate-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider shrink-0">
          Availability
        </span>
        <span className="font-medium text-emerald-700 dark:text-emerald-400 text-xs tracking-tight text-right line-clamp-1">
          {statusText || 'Available for selected creative projects'}
        </span>
      </div>
    </div>
  );
};
