import React, { useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageLightboxProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt = 'Enlarged Image', onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (src) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [src, onClose]);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md cursor-zoom-out"
          onClick={onClose}
        >
          {/* Top Control Bar */}
          <div className="absolute top-4 right-4 z-[101] flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-mono">
              <ZoomIn size={13} className="text-[#C59B63]" />
              <span>Full Resolution Popup</span>
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shadow-lg"
              aria-label="Close Lightbox"
            >
              <X size={22} />
            </button>
          </div>

          {/* Expanded Image */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative max-w-5xl max-h-[90vh] flex items-center justify-center overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-neutral-950"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] object-contain rounded-xl select-none"
            />
            {alt && (
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-center text-xs text-slate-300 font-mono">
                {alt}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
