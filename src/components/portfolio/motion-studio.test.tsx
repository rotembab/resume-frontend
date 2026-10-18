import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EffectsContext } from './effects-context';
import { SpotlightCard } from './spotlight-card';
import { ToolGlobe } from './tool-globe';
import { facing, rotate, spherePoints } from './globe-math';
import type { ToolCard } from './tool-deck';

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

  it('lights large panels without tilting them', () => {
    render(
      withEffects(
        true,
        <SpotlightCard as='section' tilt={false} data-testid='panel'>
          Panel
        </SpotlightCard>
      )
    );
    const panel = screen.getByTestId('panel');
    expect(panel.tagName).toBe('SECTION');
    panel.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    pointer(panel, 'pointermove', 'mouse', 150, 25);
    expect(panel.style.getPropertyValue('--spot-opacity')).toBe('1');
    expect(panel.style.getPropertyValue('--tilt-y')).toBe('');
  });

  it('ignores touch input on spotlight surfaces', () => {
    render(
      withEffects(true, <SpotlightCard data-testid='card'>Card</SpotlightCard>)
    );
    const card = screen.getByTestId('card');
    pointer(card, 'pointermove', 'touch', 10, 10);
    expect(card.style.getPropertyValue('--spot-opacity')).toBe('');
  });

  it('spreads tools over a sphere and can turn any of them to the front', () => {
    const points = spherePoints(24);
    expect(points).toHaveLength(24);
    points.forEach((point) => {
      expect(Math.hypot(point.x, point.y, point.z)).toBeCloseTo(1, 5);
      const { yaw, pitch } = facing(point);
      const front = rotate(point, yaw, pitch);
      expect(front.x).toBeCloseTo(0, 5);
      expect(front.y).toBeCloseTo(0, 5);
      expect(front.z).toBeCloseTo(1, 5);
    });
  });

  it('offers every tool as one keyboard stop and opens the chosen tool', () => {
    const cards = ['React', 'Kotlin', 'Docker'].map((name) => ({
      id: name.toLowerCase(),
      name,
    })) as unknown as ToolCard[];
    const selected: string[] = [];
    render(
      <ToolGlobe
        cards={cards}
        animate={false}
        label='Technologies I work with'
        hint='Drag to spin'
        itemLabel={(name) => name + ': see it in the toolkit'}
        onSelect={(id) => selected.push(id)}
      />
    );
    const toolbar = screen.getByRole('toolbar', {
      name: 'Technologies I work with',
    });
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons.filter((button) => button.tabIndex === 0)).toHaveLength(1);

    buttons[0].focus();
    fireEvent.keyDown(toolbar, { key: 'ArrowRight' });
    const kotlin = screen.getByRole('button', {
      name: 'Kotlin: see it in the toolkit',
    });
    expect(kotlin).toHaveFocus();
    expect(kotlin.tabIndex).toBe(0);
    fireEvent.keyDown(toolbar, { key: 'ArrowLeft' });
    fireEvent.keyDown(toolbar, { key: 'ArrowLeft' });
    expect(
      screen.getByRole('button', { name: 'Docker: see it in the toolkit' })
    ).toHaveFocus();

    fireEvent.click(kotlin, { detail: 0 });
    expect(selected).toEqual(['kotlin']);
  });
});
