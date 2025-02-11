import { Box } from '@mui/material';
import { motion } from 'motion/react';
import React, { useRef } from 'react';
import { useInView } from 'react-intersection-observer';

type SlideFadeTransitionProps = {
  children: React.ReactNode;
  key: React.Key;
  threshold?: number;
  startY?: string | number;
  endY?: string | number;
  startOpacity?: number;
  endOpacity?: number;
  duration?: number;
  ease?: string;
};
export const SlideFadeTransition = ({
  children,
  key,
  threshold = 1,
  startY = '-5%',
  endY = 0,
  startOpacity = 0,
  endOpacity = 1,
  duration = 0.5,
  ease = 'easeInOut',
}: SlideFadeTransitionProps) => {
  const { ref: visibleRef, inView } = useInView({
    triggerOnce: true,
    threshold: threshold,
  });
  const slideInRef = useRef<HTMLElement>(null);
  return (
    <Box ref={visibleRef}>
      {inView && (
        <Box ref={slideInRef}>
          <motion.div
            key={key}
            initial={{ opacity: startOpacity, y: startY }}
            animate={{ opacity: endOpacity, y: endY }}
            transition={{ duration, ease }}
          >
            {children as React.ReactElement}
          </motion.div>
        </Box>
      )}
    </Box>
  );
};
