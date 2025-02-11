import { Box } from '@mui/material';
import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
} from 'motion/react';
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
  return (
    <Box key={transitionKey + 'box'}>
      <motion.div
        key={transitionKey}
        initial={{ opacity: startOpacity, y: startY }}
        animate={{ opacity: endOpacity, y: endY }}
        transition={{ duration, ease }}
      >
        {children as React.ReactElement}
      </motion.div>
    </Box>
  );
};
