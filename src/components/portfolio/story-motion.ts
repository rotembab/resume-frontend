/** Only transforms and opacity belong in these effects: Safari can sample them
 * alongside native scrolling without asking React to paint each touch frame. */
export type StoryEffect = {
  target: HTMLElement;
  frames: Keyframe[];
  from: number;
  to: number;
};

type ScrollTimelineConstructor = new (options: {
  source: Element;
  axis: 'block';
}) => AnimationTimeline;
type RangeOptions = KeyframeAnimationOptions & {
  rangeStart: string;
  rangeEnd: string;
};

export const stageMotionFrames = ({
  frames,
  from,
  to,
}: Omit<StoryEffect, 'target'>) => {
  const result = frames.map((frame, index) => ({
    ...frame,
    offset: from + (frame.offset ?? index / (frames.length - 1)) * (to - from),
  }));
  if (from > 0) result.unshift({ ...result[0], offset: 0 });
  if (to < 1) result.push({ ...result[result.length - 1], offset: 1 });
  return result;
};

export class StoryMotion {
  private animations: Animation[] = [];
  private binding?: string;

  get native() {
    return this.animations.length > 0;
  }

  bind(start: number, span: number, identity: string, effects: StoryEffect[]) {
    const source = document.scrollingElement;
    // Layout can extend another story without moving this one. Reattach after
    // that change so the compositor receives the final scrollable extent.
    const extent = source ? source.scrollHeight - source.clientHeight : 0;
    const key = `${start}|${span}|${identity}|${extent}`;
    if (this.binding === key && this.native) return true;
    this.clear();
    const Timeline = (
      window as typeof window & { ScrollTimeline?: ScrollTimelineConstructor }
    ).ScrollTimeline;
    if (
      !Timeline ||
      !source ||
      !window.CSS?.supports?.('animation-range', '0px 100px') ||
      effects.some(({ target }) => typeof target.animate !== 'function')
    )
      return false;
    try {
      const timeline = new Timeline({
        source,
        axis: 'block',
      });
      for (const { target, ...effect } of effects) {
        const options: RangeOptions = {
          timeline,
          // Every visual shares the progress bar's complete stage range.
          // Express chapter timing in keyframe offsets, rather than giving
          // Safari's compositor a different attachment range for each icon.
          rangeStart: `${start}px`,
          rangeEnd: `${start + span}px`,
          fill: 'both',
          easing: 'linear',
          // Duration stays 'auto', so the attachment range owns the timing.
        };
        this.animations.push(
          target.animate(stageMotionFrames(effect), options)
        );
      }
      this.binding = key;
      return this.native;
    } catch {
      // Partial API implementations must retain the ordinary scroll fallback.
      this.clear();
      return false;
    }
  }

  clear() {
    this.animations.forEach((animation) => animation.cancel());
    this.animations = [];
    this.binding = undefined;
  }
}

export const projectMotionFrames = (index: number, last: number) => {
  const from = Math.max(0, index - 1);
  const to = Math.min(last, index + 1);
  const frames: Keyframe[] = [];
  if (index > 0)
    frames.push({
      offset: 0,
      transform: 'translate3d(0, 48px, 0) scale(0.9)',
      opacity: 0,
    });
  frames.push({
    offset: (index - from) / (to - from),
    transform: 'translate3d(0, 0, 0) scale(1)',
    opacity: 1,
  });
  if (index < last)
    frames.push({
      offset: 1,
      transform: 'translate3d(0, -24px, 0) scale(1.08)',
      opacity: 0,
    });
  return { frames, from: from / last, to: to / last };
};

export const toolPose = (offset: number, direction: number) => {
  const depth = Math.max(0, offset);
  const exit = Math.max(0, -offset);
  return {
    transform: `translate3d(${direction * (depth * 14 - exit * 90)}px, ${depth * 12 + exit * 6}px, 0) rotate(${direction * (depth * 6 - exit * 18)}deg) scale(${1 - depth * 0.08})`,
    opacity: (1 - depth * 0.2) * (1 - exit),
  };
};

export const toolMotionFrames = (
  index: number,
  last: number,
  direction: number
) => {
  // A zero-opacity lead-in brings the back of the pack into view gradually.
  const from = Math.max(0, index - 4);
  const to = Math.min(last, index + 1);
  const frames: Keyframe[] = [];
  for (let position = from; position <= to; position++) {
    const offset = index - position;
    frames.push({
      offset: (position - from) / (to - from),
      ...toolPose(Math.min(3, offset), direction),
      opacity: offset >= 4 ? 0 : toolPose(offset, direction).opacity,
    });
  }
  return { frames, from: from / last, to: to / last };
};
