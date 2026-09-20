import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ScrollRevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  className?: string;
  once?: boolean;
  amount?: number | 'some' | 'all';
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 0.55,
  direction = 'up',
  distance = 24,
  className = '',
  once = true,
  amount = 0.15,
  ...rest
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      case 'none':
      default:
        return { x: 0, y: 0 };
    }
  };

  const initialPos = getInitialPosition();

  return (
    <motion.div
      initial={{ opacity: 0, ...initialPos }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount, margin: '0px 0px -40px 0px' }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // refined cubic-bezier for smooth editorial reveal
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export interface ScrollRevealGroupProps {
  children: React.ReactNode;
  staggerDelay?: number;
  baseDelay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'none';
  distance?: number;
  className?: string;
}

export const ScrollRevealGroup: React.FC<ScrollRevealGroupProps> = ({
  children,
  staggerDelay = 0.1,
  baseDelay = 0,
  duration = 0.55,
  direction = 'up',
  distance = 20,
  className = '',
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return (
          <ScrollReveal
            delay={baseDelay + index * staggerDelay}
            duration={duration}
            direction={direction}
            distance={distance}
          >
            {child}
          </ScrollReveal>
        );
      })}
    </div>
  );
};

export default ScrollReveal;
