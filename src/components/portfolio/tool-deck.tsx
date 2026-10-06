import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigationType } from 'react-router';
import { getSkillIcon } from '../pages/tools/skill-icons';
import { useEffects } from './effects-context';
import { usePortfolio } from './use-portfolio';
import { getToolDeckCopy } from '../../data/tool-deck-copy';
import { storyViewportHeight } from './story-viewport';
import {
  StoryMotion,
  type StoryEffect,
  toolMotionFrames,
  toolPose,
} from './story-motion';

export interface ToolCard {
  id: string;
  name: string;
  summary: string;
  category: string;
  iconKey?: string;
  link?: string;
  evidence: { to: string; title: string }[];
}

const selections = new Map<string, string>();
const activeEntries = new Set<string>();
const paintIcons = (
  tokens: (HTMLSpanElement | null)[],
  position: number,
  direction: number
) => {
  tokens.forEach((token, index) => {
    if (!token) return;
    const offset = index - position;
    const visible = offset > -1 && offset <= 3;
    if (visible) {
      const pose = toolPose(offset, direction);
      token.style.transform = pose.transform;
      token.style.opacity = String(pose.opacity);
    }
    if (token.dataset.visible !== String(visible))
      token.setAttribute('data-visible', String(visible));
  });
};
const ToolIcon = ({ card }: { card: ToolCard }) => {
  const [failed, setFailed] = useState(false);
  const source = getSkillIcon(card.iconKey);
  useEffect(() => setFailed(false), [source]);
  return (
    <span className='tool-icon' data-icon={card.iconKey}>
      {source && !failed ? (
        <img
          src={source}
          alt=''
          width='64'
          height='64'
          loading='lazy'
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{card.name.slice(0, 2)}</span>
      )}
    </span>
  );
};

export const ToolDeck = ({ cards }: { cards: ToolCard[] }) => {
  const { copy, i18n } = usePortfolio();
  const text = getToolDeckCopy(i18n.language);
  const direction = i18n.dir() === 'rtl' ? -1 : 1;
  const cardOrder = cards.map((card) => card.id).join('|');
  const { motionAllowed } = useEffects();
  const location = useLocation();
  const navigationType = useNavigationType();
  const historyKey =
    location.key + location.pathname + location.search + location.hash;
  const savedId = useMemo(
    () => (navigationType === 'POP' ? selections.get(historyKey) : undefined),
    [historyKey, navigationType]
  );
  const savedOwnsPosition = useMemo(
    () => navigationType === 'POP' && activeEntries.has(historyKey),
    [historyKey, navigationType]
  );
  const initialIndex = Math.max(
    0,
    cards.findIndex((card) => card.id === savedId)
  );
  const story = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tokens = useRef<(HTMLSpanElement | null)[]>([]);
  const progressBar = useRef<HTMLSpanElement>(null);
  const motion = useRef(new StoryMotion());
  const bindAfterCommit = useRef<(() => void) | null>(null);
  const paintedPosition = useRef<string>();
  const position = useRef(initialIndex);
  const selected = useRef(initialIndex);
  const selectedId = useRef(cards[initialIndex]?.id);
  const layoutRef = useRef(false);
  const initialized = useRef(false);
  const geometry = useRef({ start: 0, span: 1, top: 88, stageHeight: 0 });
  const frame = useRef<number>();
  const restoreFrame = useRef<number>();
  const pendingRestore = useRef<(() => void) | null>(null);
  const [restoreRevision, setRestoreRevision] = useState(0);
  const restoring = useRef(false);
  const ownsPosition = useRef(savedOwnsPosition);
  const currentEntry = useRef(historyKey);
  const navigatingAway = useRef(false);
  const [active, setActive] = useState(initialIndex);
  const [pinned, setPinned] = useState(false);
  const [height, setHeight] = useState(0);
  const last = Math.max(0, cards.length - 1);

  useLayoutEffect(() => {
    bindAfterCommit.current?.();
  }, [height, pinned]);

  useLayoutEffect(() => {
    if (!pendingRestore.current) return;
    if (restoreFrame.current !== undefined)
      cancelAnimationFrame(restoreFrame.current);
    restoreFrame.current = requestAnimationFrame(() => {
      const restore = pendingRestore.current;
      pendingRestore.current = null;
      restore?.();
    });
  }, [restoreRevision]);

  useLayoutEffect(() => {
    if (currentEntry.current === historyKey) return;
    currentEntry.current = historyKey;
    initialized.current = false;
    restoring.current = false;
    if (restoreFrame.current !== undefined)
      cancelAnimationFrame(restoreFrame.current);
    ownsPosition.current = savedOwnsPosition;
    navigatingAway.current =
      location.pathname === '/' &&
      Boolean(location.hash) &&
      location.hash !== '#tools';
    if (savedId) {
      const index = cards.findIndex((card) => card.id === savedId);
      if (index >= 0) {
        position.current = index;
        selected.current = index;
        selectedId.current = savedId;
        setActive(index);
      }
    }
  }, [
    historyKey,
    savedId,
    savedOwnsPosition,
    cards,
    location.pathname,
    location.hash,
  ]);

  useLayoutEffect(() => {
    const focused = document.activeElement;
    if (!(focused instanceof HTMLElement) || !stage.current?.contains(focused))
      return;
    const panel = focused.closest<HTMLElement>('.tool-card');
    if (panel && Number(panel.dataset.index) !== active)
      stage.current
        .querySelector<HTMLSelectElement>('select')
        ?.focus({ preventScroll: true });
  }, [active]);

  useEffect(() => {
    if (!story.current || !stage.current || !cards.length) return;
    const storyMotion = motion.current;
    const bindMotion = () => {
      if (!layoutRef.current) {
        motion.current.clear();
        story.current!.dataset.animation = 'fallback';
        paintedPosition.current = undefined;
        return;
      }
      // The scroll spacer must exist before Safari captures the root timeline.
      // React commits it after measure(), so finish initial binding in layout.
      if (
        story.current!.dataset.layout !== 'scroll' ||
        Math.abs(
          story.current!.offsetHeight -
            geometry.current.span -
            geometry.current.stageHeight
        ) > 1
      )
        return;
      const effects: StoryEffect[] = tokens.current.flatMap((target, index) =>
        target ? [{ target, ...toolMotionFrames(index, last, direction) }] : []
      );
      if (progressBar.current)
        effects.push({
          target: progressBar.current,
          from: 0,
          to: 1,
          frames: [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        });
      const native = motion.current.bind(
        geometry.current.start,
        geometry.current.span,
        `${cardOrder}|${direction}`,
        effects
      );
      story.current!.dataset.animation = native ? 'native' : 'fallback';
    };
    bindAfterCommit.current = bindMotion;
    const update = (value: number) => {
      const next = Math.max(0, Math.min(last, value));
      position.current = next;
      const paintKey = `${direction}|${next}|${cardOrder}`;
      if (!motion.current.native && paintedPosition.current !== paintKey) {
        paintedPosition.current = paintKey;
        paintIcons(tokens.current, next, direction);
        if (progressBar.current)
          progressBar.current.style.transform = `scaleX(${last ? next / last : 0})`;
      }
      const index = Math.round(next);
      const changed = selected.current !== index;
      selected.current = index;
      selectedId.current = cards[selected.current].id;
      selections.set(historyKey, selectedId.current);
      if (ownsPosition.current) activeEntries.add(historyKey);
      else activeEntries.delete(historyKey);
      if (selections.size > 64) {
        const oldest = selections.keys().next().value!;
        selections.delete(oldest);
        activeEntries.delete(oldest);
      }
      if (changed) setActive(index);
    };
    // Retain repository-independent tool identity across localized data changes.
    const retained = cards.findIndex((card) => card.id === selectedId.current);
    update(retained < 0 ? 0 : retained);
    const sync = () => {
      if (!story.current || restoring.current) return;
      if (navigatingAway.current) {
        const target = document.getElementById(location.hash.slice(1));
        if (
          target &&
          Math.abs(target.getBoundingClientRect().top - geometry.current.top) <
            5
        )
          navigatingAway.current = false;
        else {
          ownsPosition.current = false;
          return;
        }
      }
      if (!layoutRef.current) {
        const bounds = stage.current?.getBoundingClientRect();
        ownsPosition.current = Boolean(
          bounds &&
            bounds.bottom > geometry.current.top &&
            bounds.top < innerHeight
        );
        update(selected.current);
        return;
      }
      const start = motion.current.native
        ? geometry.current.start
        : story.current.getBoundingClientRect().top +
          scrollY -
          geometry.current.top;
      geometry.current.start = start;
      ownsPosition.current =
        scrollY >= start && scrollY <= start + geometry.current.span;
      update(((scrollY - start) / geometry.current.span) * last);
    };
    const ensureFocusVisible = () => {
      const focused = document.activeElement;
      if (
        !(focused instanceof HTMLElement) ||
        !stage.current?.contains(focused)
      )
        return;
      const bounds = focused.getBoundingClientRect();
      const delta =
        bounds.top < geometry.current.top
          ? bounds.top - geometry.current.top
          : bounds.bottom > innerHeight - 20
            ? bounds.bottom - innerHeight + 20
            : 0;
      if (delta) window.scrollTo({ top: scrollY + delta, behavior: 'instant' });
    };
    const measure = (preserve: boolean) => {
      if (!story.current || !stage.current) return;
      const wasPinned = layoutRef.current;
      const old = geometry.current;
      const wasWithin = scrollY >= old.start && scrollY <= old.start + old.span;
      const focused =
        document.activeElement instanceof HTMLElement &&
        stage.current.contains(document.activeElement);
      const focusedPanel = focused
        ? document.activeElement?.closest<HTMLElement>('.tool-card')
        : null;
      if (focusedPanel) update(Number(focusedPanel.dataset.index));
      const header =
        document.querySelector('.site-header')?.getBoundingClientRect()
          .height ?? 64;
      const top = header + 24;
      const stageHeight = Math.max(
        stage.current.getBoundingClientRect().height,
        stage.current.scrollHeight
      );
      const viewportHeight = storyViewportHeight();
      const nextPinned =
        motionAllowed &&
        cards.length > 1 &&
        stageHeight <= viewportHeight - top - 20;
      const span = Math.max(1, last * Math.max(300, viewportHeight * 0.45));
      const start = story.current.getBoundingClientRect().top + scrollY - top;
      if (
        preserve &&
        initialized.current &&
        wasPinned === nextPinned &&
        Math.abs(old.start - start) < 1 &&
        Math.abs(old.span - span) < 1 &&
        Math.abs(old.stageHeight - stageHeight) < 1 &&
        old.top === top
      ) {
        // A locale/live-data effect can recreate animations without changing
        // geometry. A no-op resize must not leave a cancelled native effect.
        bindMotion();
        return;
      }
      geometry.current = { start, span, top, stageHeight };
      stage.current.style.setProperty('--tool-sticky-top', `${top}px`);
      setHeight(span + stageHeight);
      layoutRef.current = nextPinned;
      setPinned(nextPinned);
      bindMotion();
      if (
        nextPinned &&
        (focused ||
          (preserve &&
            !navigatingAway.current &&
            (wasWithin || ownsPosition.current)) ||
          (!initialized.current && savedId && savedOwnsPosition))
      ) {
        // Commit the spacer and any upstream project-layout change before
        // restoring. An immediate scroll on a short remount would be clamped.
        restoring.current = true;
        if (restoreFrame.current !== undefined)
          cancelAnimationFrame(restoreFrame.current);
        pendingRestore.current = () => {
          if (!story.current || !layoutRef.current) return;
          const currentStart =
            story.current.getBoundingClientRect().top +
            scrollY -
            geometry.current.top;
          geometry.current.start = currentStart;
          bindMotion();
          window.scrollTo({
            top:
              currentStart +
              (position.current / Math.max(1, last)) * geometry.current.span,
            behavior: 'instant',
          });
          ownsPosition.current = true;
          restoring.current = false;
        };
        setRestoreRevision((revision) => revision + 1);
        update(position.current);
      } else if (nextPinned) sync();
      else {
        update(selected.current);
        restoring.current = false;
        pendingRestore.current = null;
        if (restoreFrame.current !== undefined)
          cancelAnimationFrame(restoreFrame.current);
        if (wasPinned && (wasWithin || focused || ownsPosition.current)) {
          if (frame.current !== undefined) cancelAnimationFrame(frame.current);
          frame.current = requestAnimationFrame(() => {
            frame.current = undefined;
            if (focused) ensureFocusVisible();
            else if (story.current)
              window.scrollTo({
                top:
                  story.current.getBoundingClientRect().top +
                  scrollY -
                  geometry.current.top,
                behavior: 'instant',
              });
          });
        }
      }
      initialized.current = true;
    };
    let pendingMeasure = false;
    const schedule = (resize: boolean) => {
      pendingMeasure ||= resize;
      if (frame.current !== undefined) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = undefined;
        const shouldMeasure = pendingMeasure;
        pendingMeasure = false;
        if (shouldMeasure) measure(true);
        else sync();
      });
    };
    const scroll = () => schedule(false);
    const resize = () => schedule(true);
    const userScroll = () => {
      navigatingAway.current = false;
    };
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(resize);
    observer?.observe(stage.current);
    const main = document.querySelector('main');
    if (main) observer?.observe(main);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('wheel', userScroll, { passive: true });
    window.addEventListener('touchmove', userScroll, { passive: true });
    let mounted = true;
    void document.fonts?.ready.then(() => {
      if (mounted) resize();
    });
    measure(initialized.current);
    return () => {
      mounted = false;
      observer?.disconnect();
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('wheel', userScroll);
      window.removeEventListener('touchmove', userScroll);
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
      frame.current = undefined;
      if (restoreFrame.current !== undefined)
        cancelAnimationFrame(restoreFrame.current);
      restoring.current = false;
      pendingRestore.current = null;
      storyMotion.clear();
      if (bindAfterCommit.current === bindMotion)
        bindAfterCommit.current = null;
      paintedPosition.current = undefined;
    };
  }, [
    cards,
    cardOrder,
    direction,
    last,
    motionAllowed,
    i18n.language,
    historyKey,
    savedId,
    savedOwnsPosition,
    location.hash,
  ]);

  const choose = (index: number) => {
    navigatingAway.current = false;
    const next = Math.max(0, Math.min(last, index));
    if (layoutRef.current)
      window.scrollTo({
        top:
          geometry.current.start +
          (next / Math.max(1, last)) * geometry.current.span,
        behavior: 'instant',
      });
    position.current = next;
    paintedPosition.current = undefined;
    if (!motion.current.native) paintIcons(tokens.current, next, direction);
    selected.current = next;
    selectedId.current = cards[next]?.id;
    ownsPosition.current = true;
    activeEntries.add(historyKey);
    if (selectedId.current) selections.set(historyKey, selectedId.current);
    setActive(next);
    if (!motion.current.native && progressBar.current)
      progressBar.current.style.transform = `scaleX(${last ? next / last : 0})`;
  };

  if (!cards.length) return null;
  return (
    <div
      ref={story}
      className='tool-deck-story'
      data-layout={pinned ? 'scroll' : 'manual'}
      style={pinned ? { height } : undefined}
    >
      <div
        ref={stage}
        className='tool-deck-stage'
        role='region'
        aria-label={text.label}
        data-current-index={active}
      >
        <div className='tool-deck-controls'>
          <span
            className='tool-deck-progress-bar'
            ref={progressBar}
            aria-hidden='true'
          />
          <p>{pinned ? text.scroll : text.manual}</p>
          <span className='tool-deck-counter' dir='ltr' aria-hidden='true'>
            {String(active + 1).padStart(2, '0')} /{' '}
            {String(cards.length).padStart(2, '0')}
          </span>
          <div className='tool-deck-picker'>
            <label htmlFor='tool-deck-picker'>{text.tool}</label>
            <span className='tool-deck-field'>
              <select
                id='tool-deck-picker'
                value={cards[active]?.id ?? ''}
                aria-controls='tool-deck-details'
                onChange={(event) =>
                  choose(
                    cards.findIndex((card) => card.id === event.target.value)
                  )
                }
              >
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </span>
          </div>
        </div>
        <div className='tool-icon-stack' aria-hidden='true'>
          {cards.map((card, index) => (
            <span
              className='tool-icon-token'
              key={card.id}
              // Keep ordering static while transforms and opacity animate.
              style={{ zIndex: cards.length - index }}
              data-state={
                index === active
                  ? 'active'
                  : index > active && index <= active + 3
                    ? 'stacked'
                    : 'hidden'
              }
              ref={(token) => {
                tokens.current[index] = token;
              }}
            >
              <ToolIcon card={card} />
            </span>
          ))}
        </div>
        <div className='tool-deck-details' id='tool-deck-details'>
          {cards.map((card, index) => (
            <article
              className='tool-card'
              key={card.id}
              data-index={index}
              data-tool={card.id}
              data-state={index === active ? 'active' : 'hidden'}
              aria-hidden={index !== active}
              onFocus={(event) => {
                if (
                  index !== active &&
                  event.target instanceof HTMLElement &&
                  event.target.closest('a')
                )
                  choose(index);
              }}
            >
              <p className='tool-card-category'>{card.category}</p>
              <h2>{card.name}</h2>
              <p className='tool-card-summary'>{card.summary}</p>
              <div className='tool-card-evidence'>
                {card.evidence.length > 0 && <p>{copy.toolsRelatedWork}</p>}
                {card.evidence.map((evidence, evidenceIndex) => (
                  <Link
                    className='text-link'
                    id={`tool-${card.id}-evidence-${evidenceIndex}`}
                    key={evidence.to}
                    to={evidence.to}
                    tabIndex={index === active ? 0 : -1}
                  >
                    {evidence.title}
                    <span aria-hidden='true'>↗</span>
                  </Link>
                ))}
              </div>
              <div className='tool-card-actions'>
                {card.link && (
                  <a
                    className='button button-secondary'
                    id={`tool-${card.id}-docs`}
                    href={card.link}
                    target='_blank'
                    rel='noreferrer'
                    tabIndex={index === active ? 0 : -1}
                  >
                    {text.docs}
                    <span aria-hidden='true'>↗</span>
                  </a>
                )}
                {!card.evidence.length && (
                  <Link
                    className='text-link'
                    id={`tool-${card.id}-work`}
                    to='/projects'
                    tabIndex={index === active ? 0 : -1}
                  >
                    {copy.navWork}
                    <span aria-hidden='true'>↗</span>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
        <span className='sr-only' role='status'>
          {text.tool} {active + 1} / {cards.length}: {cards[active]?.name}
        </span>
      </div>
    </div>
  );
};
