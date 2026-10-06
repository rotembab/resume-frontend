import {
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Link, useLocation, useNavigationType } from 'react-router';
import type { CatalogProject } from '../../data/project-catalog';
import { getCarouselCopy } from '../../data/project-carousel-copy';
import { getProjectStoryCopy } from '../../data/project-story-copy';
import { getCatalogCopy } from '../../data/catalog-copy';
import { useEffects } from './effects-context';
import { usePortfolio } from './use-portfolio';
import { ProjectMedia } from './project-media';
import { CatalogProjectMedia } from './project-catalog';
import { storyViewportHeight } from './story-viewport';

type Layout = 'scroll' | 'manual';
type Geometry = {
  start: number;
  span: number;
  stickyTop: number;
};
const clamp = (value: number, maximum = 1) =>
  Math.max(0, Math.min(maximum, value));
const historySelections = new Map<string, string>();

export const ProjectCarousel = ({
  projects,
}: {
  projects: CatalogProject[];
}) => {
  const { copy: portfolioCopy, i18n } = usePortfolio();
  const { motionAllowed } = useEffects();
  const location = useLocation();
  const navigationType = useNavigationType();
  const entryKey =
    location.key + location.pathname + location.search + location.hash;
  const currentEntry = useRef(entryKey);
  const pendingHistorySelection = useRef(
    navigationType === 'POP' ? historySelections.get(entryKey) : undefined
  );
  const initialIndex = Math.max(
    0,
    projects.findIndex(
      (project) => project.slug === pendingHistorySelection.current
    )
  );
  const copy = getCarouselCopy(i18n.language);
  const catalogCopy = getCatalogCopy(i18n.language);
  const direction = i18n.dir();
  const id = useId();
  const story = useRef<HTMLDivElement>(null);
  const region = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const chapterButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const slides = useRef<(HTMLElement | null)[]>([]);
  const geometry = useRef<Geometry>();
  const frame = useRef<number>();
  const fallbackFrame = useRef<number>();
  const settleTimer = useRef<number>();
  const progress = useRef(
    projects.length > 1 ? initialIndex / (projects.length - 1) : 0
  );
  const activeRef = useRef(initialIndex);
  const activeSlug = useRef(projects[initialIndex]?.slug);
  const projectOrder = projects.map((project) => project.slug).join('|');
  const previousOrder = useRef(projectOrder);
  const last = Math.max(0, projects.length - 1);
  const [layout, setLayout] = useState<Layout>(() =>
    motionAllowed && projects.length > 1 ? 'scroll' : 'manual'
  );
  const layoutRef = useRef(layout);
  const [storyHeight, setStoryHeight] = useState(
    Math.max(1, projects.length) * window.innerHeight
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [settledIndex, setSettledIndex] = useState(initialIndex);
  const active = Math.min(activeIndex, last);
  const settled = Math.min(settledIndex, last);

  const applyProgress = useCallback(
    (value: number) => {
      const next = clamp(value);
      progress.current = next;
      const position = next * last;
      const index = Math.round(position);
      story.current?.setAttribute('data-scroll-progress', next.toFixed(4));
      story.current?.style.setProperty('--carousel-progress', String(next));
      slides.current.forEach((slide, slideIndex) => {
        const signedDistance =
          layoutRef.current === 'scroll' ? slideIndex - position : 0;
        const distance = Math.min(1, Math.abs(signedDistance));
        slide?.style.setProperty('--carousel-distance', String(distance));
        slide?.style.setProperty(
          '--carousel-entry',
          String(clamp(signedDistance))
        );
        slide?.style.setProperty(
          '--carousel-exit',
          String(clamp(-signedDistance))
        );
      });
      activeRef.current = index;
      activeSlug.current = projects[index]?.slug;
      if (activeSlug.current)
        historySelections.set(currentEntry.current, activeSlug.current);
      setActiveIndex(index);
    },
    [last, projects]
  );

  const syncScroll = useCallback(() => {
    if (!story.current) return;
    if (layoutRef.current === 'scroll' && geometry.current) {
      // Read the actual document position: upstream image/font changes and
      // restored browser history can move the section without changing its size.
      const start =
        story.current.getBoundingClientRect().top +
        window.scrollY -
        geometry.current.stickyTop;
      geometry.current.start = start;
      applyProgress((window.scrollY - start) / geometry.current.span);
    }
  }, [applyProgress]);

  const remeasure = useCallback(
    (preservePosition: boolean) => {
      if (projects.length === 0) {
        // An empty live catalog renders no media track. Clear pinned geometry
        // before the missing-track guard so the previous story cannot persist.
        layoutRef.current = 'manual';
        setLayout('manual');
        setStoryHeight(0);
        geometry.current = undefined;
        applyProgress(0);
        setSettledIndex(0);
        return;
      }
      if (!story.current || !region.current || !viewport.current) return;
      const viewportHeight = storyViewportHeight();
      region.current.setAttribute('data-compact', String(viewportHeight < 760));
      const old = geometry.current;
      const wasWithin =
        old &&
        window.scrollY >= old.start &&
        window.scrollY <=
          old.start +
            (layoutRef.current === 'scroll'
              ? old.span
              : region.current.getBoundingClientRect().height);
      const focused =
        document.activeElement instanceof HTMLElement &&
        region.current.contains(document.activeElement) &&
        document.activeElement.closest('a,button,select')
          ? document.activeElement
          : undefined;
      const focusedSlide = focused?.closest<HTMLElement>('.carousel-slide');
      const focusedIndex = focusedSlide
        ? Number(focusedSlide.dataset.slideIndex)
        : undefined;
      const stickyValue = Number.parseFloat(
        getComputedStyle(region.current).top
      );
      const headerHeight = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--header-height'
        )
      );
      // The unpinned layout computes top as zero. Assess a possible pinned
      // layout with its real header clearance so short screens cannot oscillate.
      const stickyTop =
        layoutRef.current === 'scroll' &&
        Number.isFinite(stickyValue) &&
        stickyValue > 0
          ? stickyValue
          : Number.isFinite(headerHeight)
            ? headerHeight + 24
            : 104;
      const tallestSlide = Math.max(
        0,
        ...slides.current
          .slice(0, projects.length)
          .map((slide) => slide?.getBoundingClientRect().height ?? 0)
      );
      const estimatedStage =
        (toolbar.current?.getBoundingClientRect().height ?? 0) +
        tallestSlide +
        24;
      // Measure the complete stage in both layouts. Its toolbar margins and
      // media-window padding must fit too, otherwise a near-limit viewport
      // can alternate between a fitting estimate and an overflowing pin.
      const stageHeight = Math.max(
        estimatedStage,
        region.current.scrollHeight,
        region.current.getBoundingClientRect().height
      );
      const fits = stageHeight <= viewportHeight - stickyTop - 16;
      const nextLayout: Layout =
        motionAllowed && fits && projects.length > 1 ? 'scroll' : 'manual';
      const previousLayout = layoutRef.current;
      layoutRef.current = nextLayout;
      setLayout(nextLayout);
      const height = Math.ceil(
        Math.max(1, projects.length) *
          Math.max(viewportHeight, stageHeight + stickyTop + 24)
      );
      setStoryHeight(height);
      const start =
        story.current.getBoundingClientRect().top + window.scrollY - stickyTop;
      geometry.current = {
        start,
        span: Math.max(1, height - stageHeight),
        stickyTop,
      };
      // Collapsing Safari browser bars do not change the small-viewport geometry.
      // Leave native touch momentum alone when no layout has actually changed.
      if (
        preservePosition &&
        old &&
        previousLayout === nextLayout &&
        Math.abs(old.start - start) < 1 &&
        Math.abs(old.span - geometry.current.span) < 1 &&
        old.stickyTop === stickyTop &&
        !pendingHistorySelection.current
      )
        return;
      const cachedIndex = pendingHistorySelection.current
        ? projects.findIndex(
            (project) => project.slug === pendingHistorySelection.current
          )
        : -1;
      const withinMeasuredStory =
        window.scrollY >= start &&
        window.scrollY <= start + geometry.current.span;
      const restoreIdentity =
        cachedIndex >= 0 &&
        (nextLayout === 'manual' ||
          focused ||
          wasWithin ||
          withinMeasuredStory);
      if (restoreIdentity) {
        applyProgress(last ? (focusedIndex ?? cachedIndex) / last : 0);
        setSettledIndex(focusedIndex ?? cachedIndex);
      }
      pendingHistorySelection.current = undefined;
      // POP focus can arrive before our first measured frame. Honor it even
      // without previous geometry, and map saved chapters by project identity
      // when the live query has changed their order or count while away.
      const retainPosition =
        Boolean(focused) ||
        (preservePosition && wasWithin) ||
        (restoreIdentity && nextLayout === 'scroll');
      // Manual selection is independent of page position. Retain a focused
      // project's content before the new layout hides the other panels.
      if (nextLayout === 'manual') {
        const nextIndex = focusedIndex ?? activeRef.current;
        applyProgress(last ? nextIndex / last : 0);
        setSettledIndex(nextIndex);
      }
      if (retainPosition && nextLayout === 'scroll') {
        const nextProgress =
          focusedIndex !== undefined
            ? last
              ? focusedIndex / last
              : 0
            : previousLayout === 'scroll'
              ? progress.current
              : last
                ? activeRef.current / last
                : 0;
        window.scrollTo({
          top: start + nextProgress * geometry.current.span,
          behavior: 'instant',
        });
        applyProgress(nextProgress);
      } else if (
        retainPosition &&
        (previousLayout === 'scroll' || focusedSlide)
      ) {
        // After unpinning, keep the current project's links and description in view.
        if (fallbackFrame.current !== undefined)
          cancelAnimationFrame(fallbackFrame.current);
        const restoreManualPosition = () => {
          fallbackFrame.current = undefined;
          if (layoutRef.current !== 'manual') return;
          // React can commit the layout after this animation frame. Wait for
          // the manual CSS before reading slide bounds; pinned bounds would
          // add another chapter's old spacer offset to the document scroll.
          if (story.current?.dataset.layout !== 'manual') {
            fallbackFrame.current = requestAnimationFrame(
              restoreManualPosition
            );
            return;
          }
          const slide = slides.current[focusedIndex ?? activeRef.current];
          if (focused?.isConnected) {
            const bounds = focused.getBoundingClientRect();
            const delta =
              bounds.top < stickyTop + 8
                ? bounds.top - stickyTop - 8
                : bounds.bottom > window.innerHeight - 16
                  ? bounds.bottom - window.innerHeight + 16
                  : 0;
            if (delta)
              window.scrollTo({
                top: window.scrollY + delta,
                behavior: 'instant',
              });
          } else if (slide)
            window.scrollTo({
              top:
                slide.getBoundingClientRect().top + window.scrollY - stickyTop,
              behavior: 'instant',
            });
          syncScroll();
        };
        fallbackFrame.current = requestAnimationFrame(restoreManualPosition);
      } else if (previousLayout === 'manual' && nextLayout === 'scroll') {
        // A preference/viewport change must not turn a chosen project into a
        // different one while the visitor is interacting with the stage.
        if (wasWithin || focused)
          window.scrollTo({
            top: start + progress.current * geometry.current.span,
            behavior: 'instant',
          });
        syncScroll();
      } else syncScroll();
    },
    [applyProgress, last, motionAllowed, projects, syncScroll]
  );

  useEffect(() => {
    // Live refreshes can add or reorder repositories. Keep the chosen project
    // by identity while React preserves its keyed slide and focused link.
    if (previousOrder.current !== projectOrder) {
      const selected = Math.max(
        0,
        projects.findIndex((project) => project.slug === activeSlug.current)
      );
      applyProgress(last ? selected / last : 0);
      setSettledIndex(selected);
      previousOrder.current = projectOrder;
    }
    let pendingMeasure = false;
    let pendingPreserve = false;
    const schedule = (measure = false, preserve = false) => {
      pendingMeasure ||= measure;
      pendingPreserve ||= preserve;
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        frame.current = undefined;
        const shouldMeasure = pendingMeasure;
        const shouldPreserve = pendingPreserve;
        pendingMeasure = false;
        pendingPreserve = false;
        if (shouldMeasure) remeasure(shouldPreserve);
        else syncScroll();
      });
    };
    const settle = () => setSettledIndex(activeRef.current);
    const onScroll = () => {
      schedule();
      clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(settle, 180);
    };
    const onResize = () => schedule(true, true);
    const onHistory = () => schedule(true);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', settle);
    window.addEventListener('resize', onResize);
    window.addEventListener('popstate', onHistory);
    window.visualViewport?.addEventListener('resize', onResize);
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => schedule(true, true));
    if (region.current) observer?.observe(region.current);
    if (viewport.current) observer?.observe(viewport.current);
    slides.current.forEach((slide) => {
      if (slide) observer?.observe(slide);
    });
    let mounted = true;
    void document.fonts?.ready.then(() => {
      if (mounted) schedule(true, true);
    });
    schedule(true, Boolean(geometry.current));
    return () => {
      mounted = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', settle);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('popstate', onHistory);
      window.visualViewport?.removeEventListener('resize', onResize);
      observer?.disconnect();
      clearTimeout(settleTimer.current);
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
      if (fallbackFrame.current !== undefined)
        cancelAnimationFrame(fallbackFrame.current);
      frame.current = undefined;
      fallbackFrame.current = undefined;
    };
  }, [
    remeasure,
    syncScroll,
    i18n.language,
    projectOrder,
    projects,
    applyProgress,
    last,
  ]);

  const restoreEntrySelection = useRef((slug: string) => {
    const index = projects.findIndex((project) => project.slug === slug);
    if (index >= 0) {
      applyProgress(last ? index / last : 0);
      setSettledIndex(index);
    }
  });
  restoreEntrySelection.current = (slug: string) => {
    const index = projects.findIndex((project) => project.slug === slug);
    if (index >= 0) {
      applyProgress(last ? index / last : 0);
      setSettledIndex(index);
    }
  };
  const measureEntry = useRef(remeasure);
  measureEntry.current = remeasure;
  useLayoutEffect(() => {
    // Hash navigation keeps the homepage mounted. Read the incoming entry
    // before progress writes can replace its saved selection, and expose that
    // panel before ScrollManager restores the entry's link focus.
    const selected =
      navigationType === 'POP' ? historySelections.get(entryKey) : undefined;
    currentEntry.current = entryKey;
    pendingHistorySelection.current = selected;
    if (selected) restoreEntrySelection.current(selected);
    const restoreFrame = requestAnimationFrame(() =>
      measureEntry.current(false)
    );
    return () => {
      cancelAnimationFrame(restoreFrame);
      if (activeSlug.current)
        historySelections.set(entryKey, activeSlug.current);
    };
  }, [entryKey, navigationType]);

  const revealFocusedProject = (
    event: FocusEvent<HTMLElement>,
    index: number
  ) => {
    if (layoutRef.current !== 'scroll' || !geometry.current || !last) return;
    if (
      !(event.target instanceof HTMLElement) ||
      !event.target.closest('a,button')
    )
      return;
    // Focus is the only non-scroll event that changes the visible project. It
    // brings the naturally focused link into view without changing focus order.
    if (viewport.current) viewport.current.scrollLeft = 0;
    const value = index / last;
    window.scrollTo({
      top: geometry.current.start + value * geometry.current.span,
      behavior: 'instant',
    });
    applyProgress(value);
    setSettledIndex(index);
  };

  const chooseChapter = (index: number, smooth: boolean) => {
    if (layoutRef.current === 'scroll' && geometry.current && last) {
      // Scroll owns the visual state. Smooth navigation therefore traverses
      // exactly the same chapters as wheel, touch, and native page keys.
      window.scrollTo({
        top: geometry.current.start + (index / last) * geometry.current.span,
        behavior: smooth && motionAllowed ? 'smooth' : 'instant',
      });
      if (!smooth) {
        syncScroll();
        setSettledIndex(activeRef.current);
      }
    } else {
      applyProgress(last ? index / last : 0);
      setSettledIndex(index);
    }
  };

  const navigateChapters = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else if (event.key === 'ArrowRight')
      next =
        (index + (direction === 'rtl' ? -1 : 1) + projects.length) %
        projects.length;
    else if (event.key === 'ArrowLeft')
      next =
        (index + (direction === 'rtl' ? 1 : -1) + projects.length) %
        projects.length;
    else return;
    event.preventDefault();
    const button = chapterButtons.current[next];
    button?.focus({ preventScroll: true });
    if (button?.parentElement) {
      const bounds = button.getBoundingClientRect();
      const container = button.parentElement.getBoundingClientRect();
      const offset =
        bounds.left < container.left
          ? bounds.left - container.left
          : bounds.right > container.right
            ? bounds.right - container.right
            : 0;
      button.parentElement.scrollLeft += offset;
    }
    chooseChapter(next, false);
  };

  return (
    <div
      className='project-carousel-scroll-story'
      ref={story}
      data-layout={layout}
      data-current-index={active}
      style={
        {
          '--carousel-count': projects.length,
          height: layout === 'scroll' ? storyHeight : undefined,
        } as CSSProperties
      }
    >
      <div
        className='project-carousel'
        role='region'
        ref={region}
        aria-label={copy.label}
        aria-roledescription={copy.carouselRole}
        aria-describedby={`${id}-instruction`}
        data-current-index={active}
        data-layout={layout}
        data-motion={motionAllowed ? 'full' : 'reduced'}
      >
        <div className='carousel-sticky'>
          <div className='carousel-toolbar' ref={toolbar}>
            <div className='carousel-guidance'>
              <p id={`${id}-instruction`} className='carousel-instruction'>
                {layout === 'scroll'
                  ? copy.instruction
                  : copy.manualInstruction}
              </p>
              <Link className='text-link carousel-bypass' to='/projects'>
                {copy.viewAll}
              </Link>
              {projects.length > 0 && (
                <span
                  className='carousel-position'
                  dir='ltr'
                  aria-hidden='true'
                >
                  {String(active + 1).padStart(2, '0')} /{' '}
                  {String(projects.length).padStart(2, '0')}
                </span>
              )}
            </div>
            {projects.length > 0 && (
              <div className='carousel-project-picker'>
                <label htmlFor={`${id}-project`}>{copy.chapterLabel}</label>
                <span className='carousel-picker-field'>
                  <select
                    id={`${id}-project`}
                    value={projects[active].slug}
                    aria-controls={`${id}-track`}
                    onChange={(event) => {
                      const index = projects.findIndex(
                        (project) => project.slug === event.target.value
                      );
                      // A native select handles its own keyboard navigation;
                      // move directly to the same measured scroll chapter.
                      if (index >= 0) chooseChapter(index, false);
                    }}
                  >
                    {projects.map((project, index) => (
                      <option value={project.slug} key={project.slug}>
                        {String(index + 1).padStart(2, '0')} · {project.title}
                      </option>
                    ))}
                  </select>
                </span>
              </div>
            )}
            {projects.length > 0 && (
              <div
                className='carousel-chapters'
                role='group'
                aria-label={copy.chapterLabel}
              >
                {projects.map((project, index) => (
                  <button
                    key={project.slug}
                    type='button'
                    aria-pressed={active === index}
                    aria-controls={`${id}-track`}
                    onClick={(event) => chooseChapter(index, event.detail > 0)}
                    onKeyDown={(event) => navigateChapters(event, index)}
                    ref={(button) => {
                      chapterButtons.current[index] = button;
                    }}
                  >
                    {project.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          {projects.length === 0 ? (
            <p>{copy.empty}</p>
          ) : (
            <>
              <div className='carousel-window' ref={viewport}>
                <div
                  className='carousel-track'
                  id={`${id}-track`}
                  ref={track}
                  dir={direction}
                  role='list'
                  aria-label={copy.label}
                >
                  {projects.map((project, index) => {
                    const narrative = getProjectStoryCopy(
                      i18n.language,
                      project.slug
                    );
                    const features =
                      narrative?.features ??
                      project.details?.features.slice(0, 2) ??
                      [];
                    return (
                      <article
                        key={project.slug}
                        className='carousel-slide'
                        role='listitem'
                        aria-roledescription={copy.slideRole}
                        aria-labelledby={`${id}-${project.slug}-title`}
                        data-slide-index={index}
                        data-active={active === index}
                        aria-hidden={active !== index ? true : undefined}
                        onFocusCapture={(event) =>
                          revealFocusedProject(event, index)
                        }
                        ref={(slide) => {
                          slides.current[index] = slide;
                        }}
                      >
                        <div className='carousel-copy'>
                          <p className='carousel-status'>
                            <span>{narrative?.eyebrow ?? project.title}</span>
                            <span aria-hidden='true'> · </span>
                            {catalogCopy.statuses[project.status]}
                            {(!project.image ||
                              project.image.endsWith('.svg')) && (
                              <>
                                <span aria-hidden='true'> · </span>
                                {catalogCopy.technicalIllustration}
                              </>
                            )}
                          </p>
                          <h3
                            className='carousel-title'
                            id={`${id}-${project.slug}-title`}
                          >
                            {narrative?.headline ?? project.title}
                          </h3>
                          <p className='carousel-summary'>
                            {narrative?.caption ?? project.summary}
                          </p>
                        </div>
                        <div
                          className='carousel-media'
                          data-media={
                            !project.image || project.image.endsWith('.svg')
                              ? 'diagram'
                              : 'capture'
                          }
                        >
                          {project.curated ? (
                            <ProjectMedia
                              project={project.curated}
                              sourceRecovery={false}
                            />
                          ) : (
                            <CatalogProjectMedia project={project} />
                          )}
                        </div>
                        <div className='carousel-story-footer'>
                          <div className='carousel-story-features'>
                            {features.map((feature) => (
                              <p key={feature}>{feature}</p>
                            ))}
                          </div>
                          <div className='carousel-actions'>
                            <Link
                              className='button button-primary'
                              tabIndex={active !== index ? -1 : 0}
                              to={'/projects/' + project.slug}
                            >
                              {portfolioCopy.viewProject}
                              <span aria-hidden='true'>↗</span>
                            </Link>
                            <a
                              className='button button-secondary'
                              tabIndex={active !== index ? -1 : 0}
                              href={project.github}
                              target='_blank'
                              rel='noreferrer'
                            >
                              {portfolioCopy.viewSource}
                              <span aria-hidden='true'>↗</span>
                            </a>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
              <p
                className='carousel-live sr-only'
                role='status'
                aria-live='polite'
                aria-atomic='true'
              >
                {copy.position(
                  settled,
                  projects.length,
                  projects[settled].title
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
