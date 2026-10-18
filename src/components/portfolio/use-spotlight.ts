import { PointerEvent } from 'react';
import { useEffects } from './effects-context';

const MAX_TILT = 3;

/**
 * Pointer handlers that make a surface's border and background follow the
 * mouse with a soft red light, optionally tilting it slightly in 3D. Touch
 * input never triggers them; tilt is off with reduced motion or effects off.
 * Pair them with the `spotlight-card` class.
 */
export const useSpotlight = (tilt = true) => {
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
    if (motionAllowed && tilt) {
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
  return { onPointerMove, onPointerLeave };
};
