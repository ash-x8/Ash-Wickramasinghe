import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfilePhotoFrameProps {
  src: string;
  alt?: string;
  statusText?: string;
  className?: string;
}

export const ProfilePhotoFrame: React.FC<ProfilePhotoFrameProps> = ({
  src,
  alt = "Ash Wickramasinghe - Portrait",
  statusText = "Open for Select Projects",
  className = ""
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Safety timeout: Never allow loading overlay to hang indefinitely
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div 
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Glow Halo on Hover */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#C59B63]/20 via-[#06B6D4]/10 to-[#C59B63]/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Main Frame Container */}
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#111622] border border-neutral-800 dark:border-neutral-800 light:border-neutral-300 shadow-2xl shadow-black/60">
        
        {/* Loading Shimmer & Laser Scanner State */}
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 z-10 bg-[#0E121B] flex flex-col items-center justify-center space-y-4 pointer-events-none"
            >
              {/* Shimmer Pulse */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-[shimmer_1.6s_infinite] -translate-x-full" />
              
              {/* Cyber Scanner HUD */}
              <div className="relative w-16 h-16 rounded-full border border-[#C59B63]/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-t-[#C59B63] border-b-transparent animate-spin" />
                <span className="absolute text-[10px] font-mono text-[#C59B63] font-bold">RAW</span>
              </div>
              <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
                Loading Portrait...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fallback avatar if image failed */}
        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#111622] text-[#C59B63]">
            <div className="w-24 h-24 rounded-full border-2 border-[#C59B63]/40 flex items-center justify-center font-serif text-3xl font-bold">
              AW
            </div>
            <span className="mt-3 text-xs font-mono text-slate-400 uppercase tracking-widest">
              Ash Wickramasinghe
            </span>
          </div>
        ) : (
          <motion.img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onLoad={handleImageLoad}
            onError={handleImageError}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{
              opacity: isLoaded ? 1 : 0,
              scale: isHovered ? 1.03 : 1
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover grayscale contrast-115 transition-all duration-700"
          />
        )}

        {/* Ambient Film Grain / Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* Cyber Laser Scanner Line Effect */}
        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C59B63] to-transparent opacity-40 animate-[scanline_4s_ease-in-out_infinite] pointer-events-none shadow-[0_0_8px_#C59B63]" />

        {/* Refined Gold HUD Corner Brackets */}
        <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-[#C59B63] pointer-events-none transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-[#C59B63] pointer-events-none transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-[#C59B63] pointer-events-none transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 border-[#C59B63] pointer-events-none transition-transform duration-300 group-hover:scale-110" />

        {/* Technical Coordinate Overlay Tag (Cyber Editorial Touch) */}
        <div className="absolute top-4 left-5 flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-[#C59B63]/80 uppercase pointer-events-none">
          <span className="w-1 h-1 rounded-full bg-[#C59B63]" />
          <span>PORTRAIT // ARCHIVE 01</span>
        </div>
      </div>

      {/* Floating Status Pill Indicator Below Photo */}
      <div className="mt-4 p-3 rounded-xl border border-neutral-800/80 bg-[#111622]/80 backdrop-blur-sm flex items-center justify-between text-xs">
        <span className="text-neutral-400 text-[11px] font-mono uppercase tracking-wider">Availability</span>
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
