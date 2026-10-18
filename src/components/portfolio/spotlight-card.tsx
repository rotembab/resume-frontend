import { HTMLAttributes, PointerEvent, ReactNode } from 'react';
import { useEffects } from './effects-context';

const MAX_TILT = 5;

/**
 * A surface whose border and background follow the mouse with a soft red
 * light, tilting slightly in 3D. Touch input, reduced motion and the effects
 * switch leave it as a still panel.
 */
export const SpotlightCard = ({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) => {
  const { motionAllowed } = useEffects();
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse') return;
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty('--spot-x', (x * 100).toFixed(1) + '%');
    card.style.setProperty('--spot-y', (y * 100).toFixed(1) + '%');
    card.style.setProperty('--spot-opacity', '1');
    if (motionAllowed) {
      card.style.setProperty(
        '--tilt-x',
        ((0.5 - y) * MAX_TILT).toFixed(2) + 'deg'
      );
      card.style.setProperty(
        '--tilt-y',
        ((x - 0.5) * MAX_TILT).toFixed(2) + 'deg'
      );
    }
  };
  const onPointerLeave = (event: PointerEvent<HTMLElement>) => {
    const card = event.currentTarget;
    card.style.setProperty('--spot-opacity', '0');
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  };
  return (
    <article
      {...rest}
      className={('spotlight-card ' + className).trim()}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </article>
  );
};
