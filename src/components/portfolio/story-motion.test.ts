import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  StoryMotion,
  projectMotionFrames,
  toolMotionFrames,
  toolPose,
  stageMotionFrames,
} from './story-motion';
const scrollingDescriptor = Object.getOwnPropertyDescriptor(
  document,
  'scrollingElement'
);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  if (scrollingDescriptor)
    Object.defineProperty(document, 'scrollingElement', scrollingDescriptor);
  else Reflect.deleteProperty(document, 'scrollingElement');
});

const setup = () => {
  const Timeline = vi.fn(() => ({}));
  vi.stubGlobal('ScrollTimeline', Timeline);
  vi.stubGlobal('CSS', { supports: () => true });
  const source = document.documentElement;
  Object.defineProperty(document, 'scrollingElement', {
    configurable: true,
    get: () => source,
  });
  const target = document.createElement('div');
  const cancel = vi.fn();
  const animate = vi.fn(() => ({ cancel }));
  Object.assign(target, { animate });
  const effects = [{ target, ...projectMotionFrames(1, 10) }];
  return { Timeline, source, target, cancel, animate, effects };
};

describe('native story motion', () => {
  it('attaches a single scroll timeline to the complete measured stage with automatic duration', () => {
    const { Timeline, source, animate, effects } = setup();
    const motion = new StoryMotion();
    expect(motion.bind(1000, 5000, 'projects', effects)).toBe(true);
    expect(Timeline).toHaveBeenCalledWith({ source, axis: 'block' });
    expect(animate).toHaveBeenCalledWith(stageMotionFrames(effects[0]), {
      timeline: expect.any(Object),
      rangeStart: '1000px',
      rangeEnd: '6000px',
      fill: 'both',
      easing: 'linear',
    });
    // Normal scrolling neither rebuilds ranges nor changes effect timing.
    motion.bind(1000, 5000, 'projects', effects);
    expect(animate).toHaveBeenCalledTimes(1);
  });

  it('keeps the first icon, later icons and progress on exactly the same attachment range', () => {
    const { target, animate } = setup();
    const effects = [0, 12, 23].map((index) => ({
      target,
      ...toolMotionFrames(index, 23, 1),
    }));
    effects.push({
      target,
      from: 0,
      to: 1,
      frames: [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
    });
    new StoryMotion().bind(12000, 9000, 'tools', effects);
    expect(animate).toHaveBeenCalledTimes(4);
    for (const [, options] of animate.mock.calls as unknown as [
      Keyframe[],
      { rangeStart: string; rangeEnd: string },
    ][]) {
      expect(options).toMatchObject({
        rangeStart: '12000px',
        rangeEnd: '21000px',
      });
    }
    const reactFrames = (animate.mock.calls as unknown as [Keyframe[]][])[0][0];
    expect(
      reactFrames.map(({ offset, opacity }) => ({ offset, opacity }))
    ).toEqual([
      { offset: 0, opacity: 1 },
      { offset: 1 / 23, opacity: 0 },
      { offset: 1, opacity: 0 },
    ]);
    expect(reactFrames[1].transform).not.toBe(reactFrames[0].transform);
  });

  it('rebinds after layout/identity changes and cancels effects when motion is disabled or the route unmounts', () => {
    const { effects, cancel, animate } = setup();
    const motion = new StoryMotion();
    motion.bind(1000, 5000, 'en', effects);
    motion.bind(1100, 6000, 'he', effects);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(animate).toHaveBeenCalledTimes(2);
    motion.clear();
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(motion.native).toBe(false);
  });

  it('reattaches when another section extends the root scroll area without moving this stage', () => {
    const { effects, cancel, animate } = setup();
    const source = document.createElement('div');
    let extent = 10000;
    Object.defineProperty(source, 'scrollHeight', { get: () => extent });
    Object.defineProperty(document, 'scrollingElement', {
      configurable: true,
      get: () => source,
    });
    const motion = new StoryMotion();
    motion.bind(1000, 5000, 'projects', effects);
    extent = 19000;
    motion.bind(1000, 5000, 'projects', effects);
    expect(cancel).toHaveBeenCalledOnce();
    expect(animate).toHaveBeenCalledTimes(2);
    motion.bind(1000, 5000, 'projects', effects);
    expect(animate).toHaveBeenCalledTimes(2);
  });

  it('retains the fallback when timelines are unavailable or a partial implementation throws', () => {
    const { effects, cancel, animate } = setup();
    vi.stubGlobal('ScrollTimeline', undefined);
    const motion = new StoryMotion();
    expect(motion.bind(1000, 5000, 'projects', effects)).toBe(false);
    expect(animate).not.toHaveBeenCalled();
    vi.stubGlobal(
      'ScrollTimeline',
      vi.fn(() => ({}))
    );
    const broken = document.createElement('div');
    Object.assign(broken, {
      animate: () => {
        throw new Error('Unsupported range');
      },
    });
    expect(
      motion.bind(1000, 5000, 'projects', [
        ...effects,
        { target: broken, ...projectMotionFrames(2, 10) },
      ])
    ).toBe(false);
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('keeps first and last projects visible at sequence boundaries and crossfades intermediate chapters', () => {
    expect(
      projectMotionFrames(0, 10).frames.map(({ opacity }) => opacity)
    ).toEqual([1, 0]);
    expect(
      projectMotionFrames(10, 10).frames.map(({ opacity }) => opacity)
    ).toEqual([0, 1]);
    expect(projectMotionFrames(5, 10)).toMatchObject({
      from: 0.4,
      to: 0.6,
      frames: [
        { offset: 0, opacity: 0 },
        { offset: 0.5, opacity: 1 },
        { offset: 1, opacity: 0 },
      ],
    });
  });

  it('mirrors native tool poses in RTL, matching the fallback and holding the last icon', () => {
    const ltr = toolMotionFrames(5, 23, 1);
    const rtl = toolMotionFrames(5, 23, -1);
    expect(ltr.frames.at(-1)).toMatchObject(toolPose(-1, 1));
    expect(rtl.frames.at(-1)).toMatchObject(toolPose(-1, -1));
    expect(toolMotionFrames(23, 23, 1).frames.at(-1)).toMatchObject({
      ...toolPose(0, 1),
    });
    expect(
      ltr.frames.every(
        (frame) =>
          typeof frame.opacity === 'number' &&
          frame.opacity >= 0 &&
          frame.opacity <= 1
      )
    ).toBe(true);
  });
});
