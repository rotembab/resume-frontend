import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { useEffects } from './effects-context';
const positions = new Map<string, number>();
const focusTargets = new Map<string, { id?: string; href?: string }>();
const homeAnchors = new Set([
  'work',
  'experience',
  'tools',
  'contact',
  'about',
]);
export const ScrollManager = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { motionAllowed } = useEffects();
  const motionPreference = useRef(motionAllowed);
  motionPreference.current = motionAllowed;
  useLayoutEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    let frame = 0;
    let done = false;
    // Native fragment changes can retain React Router's history key.
    const positionKey =
      location.key + location.pathname + location.search + location.hash;
    let anchorId = '';
    try {
      anchorId = decodeURIComponent(location.hash.slice(1));
    } catch {
      // Treat a malformed external fragment as a normal page visit.
    }
    const save = () => positions.set(positionKey, scrollY);
    const rememberFocus = () => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement) || !element.closest('main')) return;
      if (element.id) focusTargets.set(positionKey, { id: element.id });
      else if (element instanceof HTMLAnchorElement)
        focusTargets.set(positionKey, {
          href: element.getAttribute('href') ?? '',
        });
    };
    const restore = () => {
      if (done) return;
      const heading = document.querySelector<HTMLElement>('main h1');
      const anchor = anchorId ? document.getElementById(anchorId) : null;
      if (!heading) return;
      if (location.pathname === '/' && homeAnchors.has(anchorId) && !anchor)
        return;
      done = true;
      observer.disconnect();
      if (navigationType === 'POP' && positions.has(positionKey)) {
        window.scrollTo({
          top: positions.get(positionKey) ?? 0,
          behavior: 'instant',
        });
        const saved = focusTargets.get(positionKey);
        const target = saved?.id
          ? document.getElementById(saved.id)
          : saved?.href
            ? [
                ...document.querySelectorAll<HTMLAnchorElement>('main a[href]'),
              ].find((link) => link.getAttribute('href') === saved.href)
            : null;
        (target ?? anchor?.querySelector<HTMLElement>('h2') ?? heading).focus({
          preventScroll: true,
        });
        if (
          target?.closest(
            '.project-carousel-scroll-story[data-layout="manual"], .tool-deck-story[data-layout="manual"]'
          )
        ) {
          // A remounted manual story can have different localized/media sizing.
          // Keep the restored action visible after the selected panel commits.
          frame = requestAnimationFrame(() => {
            if (!target.isConnected || document.activeElement !== target)
              return;
            const bounds = target.getBoundingClientRect();
            const headerBottom =
              document.querySelector('.site-header')?.getBoundingClientRect()
                .bottom ?? 0;
            const delta =
              bounds.top < headerBottom + 24
                ? bounds.top - headerBottom - 24
                : bounds.bottom > innerHeight - 16
                  ? bounds.bottom - innerHeight + 16
                  : 0;
            if (delta)
              window.scrollTo({ top: scrollY + delta, behavior: 'instant' });
          });
        }
      } else if (anchor) {
        const headerHeight = Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--header-height'
          )
        );
        const clearance =
          (Number.isFinite(headerHeight) ? headerHeight : 64) + 24;
        // Use one explicit clearance: native scrollIntoView would combine the
        // page's scroll padding with the section's matching scroll margin.
        window.scrollTo({
          top: Math.max(
            0,
            anchor.getBoundingClientRect().top + scrollY - clearance
          ),
          behavior:
            motionPreference.current && navigationType !== 'POP'
              ? 'smooth'
              : 'instant',
        });
        anchor.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (location.key !== 'default') heading.focus({ preventScroll: true });
      }
      save();
    };
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(restore);
    });
    observer.observe(document.getElementById('root')!, {
      childList: true,
      subtree: true,
    });
    frame = requestAnimationFrame(restore);
    window.addEventListener('scroll', save, { passive: true });
    document.addEventListener('focusin', rememberFocus);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', save);
      document.removeEventListener('focusin', rememberFocus);
      history.scrollRestoration = previousRestoration;
    };
  }, [
    location.key,
    location.pathname,
    location.search,
    location.hash,
    navigationType,
  ]);
  return null;
};
