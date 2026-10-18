import {
  KeyboardEvent,
  PointerEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getSkillIcon } from '../pages/tools/skill-icons';
import type { ToolCard } from './tool-deck';
import {
  clampPitch,
  facing,
  nearestAngle,
  rotate,
  spherePoints,
} from './globe-math';

const AUTO_SPIN = 0.16; // radians per second
const DRAG_SPEED = 0.006; // radians per pixel

/**
 * A 3D sphere of the technologies Rotem works with, orbiting the portrait.
 * It turns slowly on its own, can be dragged, and every icon opens that tool
 * in the toolkit. Arrow keys move between icons and turn the chosen one to
 * the front. With motion off it holds still until dragged.
 */
export const ToolGlobe = ({
  cards,
  animate,
  label,
  hint,
  itemLabel,
  onSelect,
  children,
}: {
  cards: ToolCard[];
  animate: boolean;
  label: string;
  hint: string;
  itemLabel: (name: string) => string;
  onSelect: (id: string) => void;
  children?: ReactNode;
}) => {
  const points = useMemo(() => spherePoints(cards.length), [cards.length]);
  const root = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [highlight, setHighlight] = useState<number | null>(null);
  const state = useRef({
    yaw: 0.6,
    pitch: -0.28,
    velocity: 0,
    pitchVelocity: 0,
    target: null as null | { yaw: number; pitch: number },
    dragging: false,
    moved: 0,
    lastX: 0,
    lastY: 0,
    hovering: false,
    radius: 200,
    visible: true,
    frame: 0,
    last: 0,
  });
  const highlightRef = useRef<number | null>(null);
  highlightRef.current = highlight;
  const paintRef = useRef<() => void>(() => {});
  const requestRef = useRef<() => void>(() => {});

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const s = state.current;
    const measure = () => {
      const size = Math.min(element.clientWidth, element.clientHeight);
      s.radius = (size || 400) * 0.42;
    };
    const paint = () => {
      const perspective = s.radius * 3.2;
      points.forEach((point, index) => {
        const node = items.current[index];
        if (!node) return;
        const p = rotate(point, s.yaw, s.pitch);
        const scale = perspective / (perspective - p.z * s.radius);
        const depth = (p.z + 1) / 2; // 0 back, 1 front
        const lifted = highlightRef.current === index ? 1.18 : 1;
        node.style.transform =
          'translate3d(' +
          (p.x * s.radius * scale).toFixed(1) +
          'px,' +
          (p.y * s.radius * scale).toFixed(1) +
          'px,0) scale(' +
          (scale * 0.82 * lifted).toFixed(3) +
          ')';
        node.style.opacity = (0.22 + depth * 0.78).toFixed(2);
        node.style.zIndex = String(p.z > 0 ? 3 + Math.round(depth * 50) : 1);
        node.dataset.side = p.z > 0 ? 'front' : 'back';
      });
    };
    const tick = (now: number) => {
      s.frame = 0;
      const dt = Math.min(0.05, s.last ? (now - s.last) / 1000 : 0.016);
      s.last = now;
      let moving = false;
      if (s.target) {
        s.yaw += (s.target.yaw - s.yaw) * 0.12;
        s.pitch += (s.target.pitch - s.pitch) * 0.12;
        if (
          Math.abs(s.target.yaw - s.yaw) < 0.001 &&
          Math.abs(s.target.pitch - s.pitch) < 0.001
        )
          s.target = null;
        moving = true;
      } else if (!s.dragging) {
        if (
          Math.abs(s.velocity) > 0.0001 ||
          Math.abs(s.pitchVelocity) > 0.0001
        ) {
          s.yaw += s.velocity;
          s.pitch = clampPitch(s.pitch + s.pitchVelocity);
          s.velocity *= 0.94;
          s.pitchVelocity *= 0.9;
          moving = true;
        }
        if (animate && !s.hovering && highlightRef.current === null) {
          s.yaw += AUTO_SPIN * dt;
          moving = true;
        }
      }
      paint();
      if (moving) request();
      else s.last = 0;
    };
    const request = () => {
      if (!s.frame && s.visible && !document.hidden)
        s.frame = requestAnimationFrame(tick);
    };
    paintRef.current = paint;
    requestRef.current = request;

    measure();
    paint();
    const resize =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            measure();
            paint();
          });
    resize?.observe(element);
    const intersection =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            s.visible = entry.isIntersecting;
            if (s.visible) request();
          });
    intersection?.observe(element);
    const onVisibility = () => {
      s.last = 0;
      request();
    };
    document.addEventListener('visibilitychange', onVisibility);
    if (animate) request();
    return () => {
      if (s.frame) cancelAnimationFrame(s.frame);
      s.frame = 0;
      resize?.disconnect();
      intersection?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [animate, points]);

  useEffect(() => {
    paintRef.current();
    requestRef.current();
  }, [highlight]);

  const turnTo = (index: number) => {
    const s = state.current;
    const { yaw, pitch } = facing(points[index]);
    const target = { yaw: nearestAngle(s.yaw, yaw), pitch: clampPitch(pitch) };
    s.velocity = 0;
    s.pitchVelocity = 0;
    if (animate) {
      s.target = target;
      requestRef.current();
    } else {
      s.yaw = target.yaw;
      s.pitch = target.pitch;
      paintRef.current();
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const s = state.current;
    s.dragging = true;
    s.moved = 0;
    s.lastX = event.clientX;
    s.lastY = event.clientY;
    s.target = null;
    s.velocity = 0;
    s.pitchVelocity = 0;
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const s = state.current;
    if (!s.dragging) return;
    const dx = event.clientX - s.lastX;
    const dy = event.clientY - s.lastY;
    s.lastX = event.clientX;
    s.lastY = event.clientY;
    s.moved += Math.abs(dx) + Math.abs(dy);
    if (s.moved > 6 && !event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.setPointerCapture?.(event.pointerId);
    s.yaw += dx * DRAG_SPEED;
    s.velocity = animate ? dx * DRAG_SPEED : 0;
    if (event.pointerType === 'mouse') {
      s.pitch = clampPitch(s.pitch - dy * DRAG_SPEED);
      s.pitchVelocity = animate ? -dy * DRAG_SPEED : 0;
    }
    paintRef.current();
  };
  const endDrag = () => {
    const s = state.current;
    if (!s.dragging) return;
    s.dragging = false;
    requestRef.current();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    let next: number | null = null;
    if (event.key in keys)
      next = (focusIndex + keys[event.key] + cards.length) % cards.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = cards.length - 1;
    if (next === null) return;
    event.preventDefault();
    setFocusIndex(next);
    items.current[next]?.focus();
  };

  if (!cards.length) return <div className='tool-globe'>{children}</div>;
  return (
    <div
      ref={root}
      className='tool-globe'
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => (state.current.hovering = true)}
      onPointerLeave={() => {
        state.current.hovering = false;
        endDrag();
      }}
    >
      {children}
      <div
        className='tool-globe-orbit'
        role='toolbar'
        aria-label={label}
        aria-orientation='horizontal'
        onKeyDown={onKeyDown}
      >
        {cards.map((card, index) => {
          const source = getSkillIcon(card.iconKey);
          return (
            <button
              key={card.id}
              ref={(node) => (items.current[index] = node)}
              type='button'
              className='tool-globe-item'
              tabIndex={index === focusIndex ? 0 : -1}
              aria-label={itemLabel(card.name)}
              data-tool={card.id}
              data-highlight={highlight === index}
              onFocus={() => {
                setFocusIndex(index);
                setHighlight(index);
                turnTo(index);
              }}
              onBlur={() => setHighlight(null)}
              onMouseEnter={() => setHighlight(index)}
              onMouseLeave={() => setHighlight(null)}
              onClick={(event) => {
                // Keyboard activation reports detail 0; a mouse click that
                // ended a drag should not open the tool.
                if (event.detail !== 0 && state.current.moved > 6) return;
                onSelect(card.id);
              }}
            >
              {source ? (
                <img
                  src={source}
                  alt=''
                  width='64'
                  height='64'
                  draggable={false}
                />
              ) : (
                <span>{card.name.slice(0, 2)}</span>
              )}
              <span className='tool-globe-name' aria-hidden='true'>
                {card.name}
              </span>
            </button>
          );
        })}
      </div>
      <p className='tool-globe-hint'>{hint}</p>
    </div>
  );
};
