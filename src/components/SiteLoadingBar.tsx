import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const SiteLoadingBar: React.FC = () => {
  const location = useLocation();
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {animating && (
        <motion.div
          key={location.pathname}
          initial={{ scaleX: 0, opacity: 1, originX: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#C59B63] via-[#E5C392] to-[#C59B63] z-50 shadow-[0_0_12px_rgba(197,155,99,0.5)] pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
};
