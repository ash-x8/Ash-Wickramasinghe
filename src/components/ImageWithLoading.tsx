import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageWithLoadingProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  containerClassName?: string;
  aspectRatio?: string;
}

export const ImageWithLoading: React.FC<ImageWithLoadingProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatio,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClassName} ${aspectRatio || ''}`}>
      {/* Loading Skeleton Shimmer */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-neutral-900 flex items-center justify-center z-10"
          >
            {/* Shimmer pulse effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer_1.8s_infinite] -translate-x-full" />
            <div className="w-8 h-8 rounded-full border border-[#C59B63]/20 border-t-[#C59B63] animate-spin opacity-50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual Image */}
      <motion.img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setIsLoaded(true);
          setHasError(true);
        }}
        initial={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
        animate={{ 
          opacity: isLoaded ? 1 : 0, 
          scale: isLoaded ? 1 : 1.04,
          filter: isLoaded ? 'blur(0px)' : 'blur(8px)'
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`${className} ${hasError ? 'hidden' : ''}`}
        {...props}
      />

      {/* Fallback state if image fails */}
      {hasError && (
        <div className="absolute inset-0 bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center text-neutral-500 text-xs p-4 text-center">
          <span className="font-mono uppercase tracking-wider text-[#C59B63]/60 mb-1">Asset Preview</span>
          <span className="text-neutral-400">{alt}</span>
        </div>
      )}
    </div>
  );
};
