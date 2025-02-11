import { Box, Fade, Slide } from '@mui/material';
import { motion } from 'motion/react';
import { useRef } from 'react';
import { useInView } from 'react-intersection-observer';

type TimeoutAttribute =
  | number
  | {
      appear?: number | undefined;
      enter?: number | undefined;
      exit?: number | undefined;
    }
  | {
      appear?: number | undefined;
      enter?: number | undefined;
      exit?: number | undefined;
    };

type SlideFadeTransitionProps = {
  children: React.ReactNode;
  slideTimeout?: TimeoutAttribute;
  fadeTimeout?: TimeoutAttribute;
  slideKey: string;
  fadeKey: string;
  slideIn?: boolean;
  slideAppear?: boolean;
  fadeIn?: boolean;
  fadeAppear?: boolean;
  slideDirection?: 'down' | 'left' | 'right' | 'up';
  slideStyle?: React.CSSProperties;
  fadeStyle?: React.CSSProperties;
  slideContainer?: Element | ((element: Element) => Element) | null;
};
export const SlideFadeTransition = ({
  children,
  slideTimeout,
  slideKey,
  fadeTimeout,
  fadeKey,
  slideIn,
  slideAppear,
  fadeIn,
  fadeAppear,
  slideDirection = 'down',
  slideStyle,
  fadeStyle,
}: SlideFadeTransitionProps) => {
  const { ref: visibleRef, inView } = useInView({
    triggerOnce: true,
    threshold: 1,
  });
  const slideInRef = useRef<HTMLElement>(null);
  return (
    <Box ref={visibleRef}>
      {inView && (
        <Box ref={slideInRef}>
          <motion.div
            key={slideKey}
            initial={{ opacity: 0, y: '-5%' }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {children as React.ReactElement}
          </motion.div>
        </Box>
      )}
    </Box>
  );
};
