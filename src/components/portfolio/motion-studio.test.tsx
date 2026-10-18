import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EffectsContext } from './effects-context';
import { HeroScene } from './hero-scene';
import { SpotlightCard } from './spotlight-card';
import { ToolMarquee } from './tool-marquee';

afterEach(cleanup);

const pointer = (
  element: Element,
  type: 'pointermove' | 'pointerout',
  pointerType: string,
  clientX = 0,
  clientY = 0
) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    clientX,
    clientY,
    relatedTarget: document.body,
  });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  fireEvent(element, event);
};

const withEffects = (motionAllowed: boolean, node: JSX.Element) => (
  <EffectsContext.Provider
    value={{ enabled: motionAllowed, motionAllowed, toggle: () => {} }}
  >
    {node}
  </EffectsContext.Provider>
);

describe('3D introduction and motion surfaces', () => {
  it('falls back to a decorative CSS form when WebGL is unavailable', () => {
    const { container } = render(<HeroScene animate />);
    const scene = container.querySelector('.hero-scene')!;
    expect(scene).toHaveAttribute('aria-hidden', 'true');
    expect(scene).toHaveAttribute('data-fallback', 'true');
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('follows the mouse with light and tilt only while motion is allowed', () => {
    const { rerender } = render(
      withEffects(true, <SpotlightCard data-testid='card'>Card</SpotlightCard>)
    );
    const card = screen.getByTestId('card');
    card.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    pointer(card, 'pointermove', 'mouse', 150, 25);
    expect(card.style.getPropertyValue('--spot-opacity')).toBe('1');
    expect(card.style.getPropertyValue('--tilt-y')).not.toBe('');

    pointer(card, 'pointerout', 'mouse');
    expect(card.style.getPropertyValue('--tilt-y')).toBe('0deg');

    rerender(
      withEffects(false, <SpotlightCard data-testid='card'>Card</SpotlightCard>)
    );
    pointer(card, 'pointermove', 'mouse', 10, 90);
    expect(card.style.getPropertyValue('--spot-opacity')).toBe('1');
    expect(card.style.getPropertyValue('--tilt-y')).toBe('0deg');
  });

  it('ignores touch input on spotlight surfaces', () => {
    render(
      withEffects(true, <SpotlightCard data-testid='card'>Card</SpotlightCard>)
    );
    const card = screen.getByTestId('card');
    pointer(card, 'pointermove', 'touch', 10, 10);
    expect(card.style.getPropertyValue('--spot-opacity')).toBe('');
  });

  it('keeps the technology ribbon out of the accessibility tree', () => {
    const { container } = render(<ToolMarquee names={['React', 'Kotlin']} />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('list')).toBeNull();
  });
});
