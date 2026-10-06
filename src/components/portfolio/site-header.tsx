import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { CV_PUBLIC_PATH } from '../../config/cv';
import { usePortfolio } from './use-portfolio';
import { useEffects } from './effects-context';

export const SiteHeader = () => {
  const { copy, i18n } = usePortfolio();
  const { enabled, toggle } = useEffects();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { pathname, hash, key: locationKey } = useLocation();
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => setOpen(false), [locationKey, pathname, hash]);
  useEffect(() => {
    let previous: boolean | undefined;
    const update = () => {
      const next = window.scrollY > 36;
      if (next !== previous) {
        previous = next;
        setScrolled(next);
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    if (pathname !== '/') {
      setActiveSection(
        pathname.startsWith('/projects')
          ? 'work'
          : pathname === '/experience'
            ? 'experience'
            : pathname === '/tools'
              ? 'tools'
              : pathname === '/contact'
                ? 'contact'
                : ''
      );
      return;
    }
    let sections: { id: string; top: number }[] = [];
    let selected: string | undefined;
    let mounted = true;
    let pending = false;
    let frame = 0;
    const observed = new Set<Element>();
    const update = () => {
      let current = '';
      const threshold = scrollY + innerHeight * 0.55;
      for (const section of sections) {
        if (section.top < threshold) current = section.id;
      }
      if (selected !== current) {
        selected = current;
        setActiveSection(current);
      }
    };
    const measure = () => {
      const main = document.querySelector('main');
      if (main && !observed.has(main)) {
        observer?.observe(main);
        observed.add(main);
      }
      sections = ['experience', 'work', 'tools', 'about', 'contact'].flatMap(
        (id) => {
          const section = document.getElementById(id);
          if (!section) return [];
          if (!observed.has(section)) {
            observer?.observe(section);
            observed.add(section);
          }
          return [{ id, top: section.getBoundingClientRect().top + scrollY }];
        }
      );
      update();
    };
    const schedule = () => {
      if (!mounted || pending) return;
      pending = true;
      frame = requestAnimationFrame(() => {
        pending = false;
        if (mounted) measure();
      });
    };
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(schedule);
    // Main content can arrive after the lazy homepage mounts. Later image,
    // locale and story-height changes refresh the cache outside scroll frames.
    const mutation = new MutationObserver(schedule);
    const root = document.getElementById('root') ?? document.body;
    mutation.observe(root, { childList: true, subtree: true });
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', schedule);
    measure();
    void document.fonts?.ready.then(schedule);
    return () => {
      mounted = false;
      observer?.disconnect();
      mutation.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', schedule);
    };
  }, [pathname, hash, i18n.language]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const onOutside = (event: Event) => {
      if (
        !panel.current?.contains(event.target as Node) &&
        !menuButton.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('focusin', onOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('focusin', onOutside);
    };
  }, [open]);
  const changeLanguage = async (language: string) => {
    if (language === 'jp') await import('../../lang/japanese-font.css');
    const sections = [
      ...document.querySelectorAll<HTMLElement>('main section[id]'),
    ];
    let fragment: HTMLElement | null = null;
    try {
      fragment = hash
        ? document.getElementById(decodeURIComponent(hash.slice(1)))
        : null;
    } catch {
      /* A malformed external fragment does not affect language selection. */
    }
    const fragmentBounds = fragment?.getBoundingClientRect();
    const headerClearance =
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--header-height'
        )
      ) + 24;
    // Each scroll stage restores its own selection after localized sizing.
    const stageOwnsPosition = [
      ...document.querySelectorAll<HTMLElement>(
        '.project-carousel-scroll-story,.tool-deck-story'
      ),
    ].some((story) => {
      const bounds = story.getBoundingClientRect();
      return bounds.top <= headerClearance && bounds.bottom > headerClearance;
    });
    const active =
      fragment &&
      fragmentBounds &&
      fragmentBounds.bottom > headerClearance &&
      fragmentBounds.top < innerHeight
        ? fragment
        : (sections.reduce<HTMLElement | null>(
            (match, section) =>
              section.getBoundingClientRect().top <= headerClearance
                ? section
                : match,
            null
          ) ??
          sections.find(
            (section) => section.getBoundingClientRect().top < innerHeight
          ) ??
          null);
    const offset = active ? -active.getBoundingClientRect().top : scrollY;
    await i18n.changeLanguage(language);
    try {
      localStorage.setItem('portfolio-language', language);
    } catch {
      /* optional */
    }
    // Localized text requests its fonts only after the React commit. Measure
    // after those fonts settle so a later font reflow cannot move the anchor.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
    await document.fonts?.ready;
    if (active && !stageOwnsPosition) {
      const target = document.getElementById(active.id);
      if (target)
        window.scrollTo({
          top: target.getBoundingClientRect().top + scrollY + offset,
          behavior: 'instant',
        });
    }
  };
  return (
    <header
      className={
        scrolled || pathname !== '/' ? 'site-header is-scrolled' : 'site-header'
      }
    >
      <div className='header-inner'>
        <Link
          className='wordmark'
          to='/'
          aria-label={'Rotem Babani — ' + copy.backHome}
        >
          <span className='wordmark-symbol' aria-hidden='true'>
            RB.
          </span>
          <span className='wordmark-name'>Rotem Babani</span>
        </Link>
        <nav className='primary-nav' aria-label={copy.menuPrimary}>
          <Link
            className={activeSection === 'experience' ? 'is-current' : ''}
            to='/#experience'
            aria-current={
              pathname === '/' && activeSection === 'experience'
                ? 'location'
                : undefined
            }
          >
            {copy.experienceTitle}
          </Link>
          <Link
            to='/#work'
            className={activeSection === 'work' ? 'is-current' : ''}
            aria-current={
              pathname === '/' && activeSection === 'work'
                ? 'location'
                : undefined
            }
          >
            {copy.navWork}
          </Link>
          <Link
            to='/#tools'
            className={activeSection === 'tools' ? 'is-current' : ''}
            aria-current={
              pathname === '/tools'
                ? 'page'
                : pathname === '/' && activeSection === 'tools'
                  ? 'location'
                  : undefined
            }
          >
            {copy.navTools}
          </Link>
          <Link
            className={
              activeSection === 'about'
                ? 'desktop-nav is-current'
                : 'desktop-nav'
            }
            to='/#about'
            aria-current={activeSection === 'about' ? 'location' : undefined}
          >
            {copy.navAbout}
          </Link>
          <Link
            className={activeSection === 'contact' ? 'is-current' : ''}
            to='/#contact'
            aria-current={
              pathname === '/' && activeSection === 'contact'
                ? 'location'
                : undefined
            }
          >
            {copy.navContact}
          </Link>
        </nav>
        <div className='header-actions'>
          <a className='cv-link' href={CV_PUBLIC_PATH} download>
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              aria-hidden='true'
            >
              <path
                d='M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5'
                stroke='currentColor'
                strokeWidth='1.6'
              />
            </svg>
            <span>CV</span>
          </a>
          <button
            ref={menuButton}
            className={open ? 'menu-button is-open' : 'menu-button'}
            aria-label={open ? copy.close : copy.menu}
            aria-expanded={open}
            aria-controls='site-menu'
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
          </button>
        </div>
        {open && (
          <div ref={panel} id='site-menu' className='menu-panel'>
            <nav aria-label={copy.menuPrimary}>
              <Link to='/#experience' onClick={() => setOpen(false)}>
                {copy.experienceTitle}
              </Link>
              <Link to='/#work' onClick={() => setOpen(false)}>
                {copy.navWork}
              </Link>
              <Link to='/#tools' onClick={() => setOpen(false)}>
                {copy.navTools}
              </Link>
              <Link to='/#about' onClick={() => setOpen(false)}>
                {copy.navAbout}
              </Link>
              <Link to='/#contact' onClick={() => setOpen(false)}>
                {copy.navContact}
              </Link>
            </nav>
            <div className='menu-settings'>
              <label htmlFor='site-language'>{copy.language}</label>
              <select
                id='site-language'
                aria-label={copy.language}
                value={i18n.language}
                onChange={(event) => void changeLanguage(event.target.value)}
              >
                <option value='en'>English</option>
                <option value='he'>עברית</option>
                <option value='jp'>日本語</option>
              </select>
              <button
                className='effects-toggle'
                onClick={toggle}
                aria-pressed={enabled}
              >
                <span>{copy.effects}</span>
                <span>{enabled ? copy.effectsOn : copy.effectsOff}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
