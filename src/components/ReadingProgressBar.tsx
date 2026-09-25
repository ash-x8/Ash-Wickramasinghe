import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, BookOpen, Clock } from 'lucide-react';

interface ReadingProgressBarProps {
  /** Optional container element ref to track scroll inside a div (e.g. modal). If not provided, tracks window scroll. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Optional estimated total reading time (e.g. '5 min read') to compute remaining time */
  totalMinutes?: number;
  /** Optional title or section label */
  title?: string;
  /** Whether to show the floating badge indicator with percentage and back-to-top */
  showFloatingIndicator?: boolean;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  containerRef,
  totalMinutes = 5,
  title,
  showFloatingIndicator = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current !== null) return;

      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;

        if (containerRef && containerRef.current) {
          const el = containerRef.current;
          const { scrollTop, scrollHeight, clientHeight } = el;
          const maxScroll = scrollHeight - clientHeight;
          const pct = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
          const clamped = Math.min(100, Math.max(0, pct));
          setProgress(clamped);
          setIsScrolled(scrollTop > 100);
        } else {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          const clamped = Math.min(100, Math.max(0, pct));
          setProgress(clamped);
          setIsScrolled(scrollTop > 140);
        }
      });
    };

    const target = containerRef?.current || window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    // Initial compute
    handleScroll();

    return () => {
      target.removeEventListener('scroll', handleScroll);
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current);
      }
    };
  }, [containerRef]);

  const scrollToTop = () => {
    if (containerRef && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Estimate remaining reading time based on progress
  const remainingMinutes = Math.max(0, Math.ceil(totalMinutes * (1 - progress / 100)));

  return (
    <>
      {/* Pinned Top Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-[#0A0D14]/40 pointer-events-none overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Article reading progress"
      >
        <div
          className="h-full bg-gradient-to-r from-[#C59B63] via-[#E5C392] to-[#C59B63] transition-[width] duration-75 ease-out shadow-[0_0_12px_rgba(197,155,99,0.85)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Reading Progress Pill (Fades in when reading starts) */}
      {showFloatingIndicator && (
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2.5 p-1.5 pl-3.5 pr-2 rounded-full bg-[#0D111A]/95 hover:bg-[#111622] border border-slate-800/90 shadow-2xl backdrop-blur-md text-xs font-mono transition-all group"
            >
              {/* Radial or percentage indicator */}
              <div className="flex items-center gap-2">
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      className="stroke-slate-800"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      className="stroke-[#C59B63] transition-all duration-100"
                      strokeWidth="2.5"
                      strokeDasharray={62.83}
                      strokeDashoffset={62.83 - (62.83 * progress) / 100}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </div>
                <span className="text-[#EDEDED] font-bold">
                  {Math.round(progress)}%
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Clock size={11} className="text-[#C59B63]" />
                  <span>
                    {progress >= 98 ? 'Complete' : `~${remainingMinutes} min left`}
                  </span>
                </span>
              </div>

              {/* Scroll To Top Action */}
              <button
                type="button"
                onClick={scrollToTop}
                title="Scroll to top of article"
                className="w-7 h-7 rounded-full bg-[#161C2B] hover:bg-[#C59B63] hover:text-[#0A0D14] text-slate-300 flex items-center justify-center transition-colors cursor-pointer ml-1"
                aria-label="Back to top"
              >
                <ArrowUp size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
};
