import { Box } from '@mui/material';
import { useRef, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

type ScrollVideoDisplayProps = {
  videoSrc: string;
};

export const ScrollVideoDisplay = ({ videoSrc }: ScrollVideoDisplayProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoLength = videoRef.current?.duration || 2;
  const videoHeight = useMemo(
    () => 200 + videoLength * 100 + 'vh',
    [videoLength]
  );

  useEffect(() => {
    if (!videoRef.current) return;

    const updateVideoTime = (latest: number) => {
      if (latest >= 0.25 && latest <= 0.75) {
        const progress = (latest - 0.25) / 0.5;
        videoRef.current!.currentTime = progress * videoRef.current!.duration;
      }
    };

    const unsubscribe = scrollYProgress.on('change', updateVideoTime);
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',

        height: videoHeight,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
        }}
      >
        <motion.video
          src={videoSrc}
          muted
          loop
          ref={videoRef}
          style={{
            position: 'sticky',
            borderRadius: '2rem',
            top: '50vh',
            width: '100%',
            height: 'auto',
            scale: useTransform(
              scrollYProgress,
              [0, 0.25, 0.75, 1],
              [3, 1, 1, 0.1]
            ),
            opacity: useTransform(
              scrollYProgress,
              [0, 0.25, 0.75, 1],
              [0, 1, 1, 0]
            ),
            y: useTransform(
              scrollYProgress,
              [0, 0.25, 0.75, 1],
              ['300%', '-50%', '-50%', '-200%']
            ),
            transform: 'translateY(-50%)',
          }}
        />
      </Box>
    </Box>
  );
};
