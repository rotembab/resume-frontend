import { Box, Fade, Slide } from '@mui/material';

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
  slideContainer,
}: SlideFadeTransitionProps) => {
  return (
    <Slide
      container={slideContainer}
      style={slideStyle}
      in={slideIn}
      appear={slideAppear}
      key={slideKey}
      timeout={slideTimeout}
      direction={slideDirection}
    >
      <Box>
        <Fade
          style={fadeStyle}
          in={fadeIn}
          appear={fadeAppear}
          key={fadeKey}
          timeout={fadeTimeout}
        >
          {children as React.ReactElement}
        </Fade>
      </Box>
    </Slide>
  );
};
