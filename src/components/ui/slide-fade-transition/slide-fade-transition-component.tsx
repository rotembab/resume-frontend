import { Box } from '@mui/material';
import { motion, useInView } from 'framer-motion';
import React, { useRef } from 'react';

type SlideFadeTransitionProps = {
  children: React.ReactNode;
  transitionKey: React.Key;
  startY?: string | number;
  endY?: string | number;
  startOpacity?: number;
  endOpacity?: number;
  duration?: number;
  ease?: string;
};

export const SlideFadeTransition = ({
  children,
  transitionKey,
  startY = '-5%',
  endY = 0,
  startOpacity = 0,
  endOpacity = 1,
  duration = 0.5,
  ease = 'easeInOut',
}: SlideFadeTransitionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.3,
  });

  return (
    <Box key={transitionKey + 'box'} ref={ref}>
      <motion.div
        key={transitionKey}
        initial={{ opacity: startOpacity, y: startY }}
        animate={
          isInView
            ? { opacity: endOpacity, y: endY }
            : { opacity: startOpacity, y: startY }
        }
        transition={{ duration, ease }}
      >
        {children as React.ReactElement}
      </motion.div>
    </Box>
  );
};
