import { HTMLAttributes, ReactNode } from 'react';
import { useSpotlight } from './use-spotlight';

/** A panel with the spotlight effect, rendered as an article or section. */
export const SpotlightCard = ({
  children,
  className = '',
  as: Tag = 'article',
  tilt = true,
  ...rest
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: 'article' | 'section' | 'div';
  tilt?: boolean;
}) => {
  const handlers = useSpotlight(tilt);
  return (
    <Tag
      {...rest}
      className={('spotlight-card ' + className).trim()}
      {...handlers}
    >
      {children}
    </Tag>
  );
};
