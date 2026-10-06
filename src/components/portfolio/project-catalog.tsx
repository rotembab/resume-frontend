import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import type { CatalogProject } from '../../data/project-catalog';
import { getCatalogCopy, getCatalogLanguage } from '../../data/catalog-copy';
import { useProjectCatalog } from './use-project-catalog';
import { usePortfolio } from './use-portfolio';

const Illustration = ({ type }: { type: CatalogProject['illustration'] }) => {
  if (type === 'board')
    return (
      <g>
        <path d='M158 42v216M212 42v216M266 42v216M104 96h216M104 150h216M104 204h216' />
        <path d='m119 57 24 24m0-24-24 24m162 150 24 24m0-24-24 24' />
        <circle cx='185' cy='123' r='16' />
        <circle cx='131' cy='177' r='16' />
        <circle cx='239' cy='69' r='16' />
      </g>
    );
  if (type === 'maze')
    return (
      <g>
        <path d='M106 62h212v176H106V62Zm42 0v89h42v44h85v-44h43M106 107h-1m43 44h-42m84-89v45h43V62m0 89v-44h85m-85 88v43m42-43v43m-127-43v43' />
        <path
          className='catalog-diagram-accent'
          d='M128 85v87h42v45h43v-45h42v-43h41v-44'
        />
        <circle className='catalog-diagram-node' cx='128' cy='85' r='6' />
        <circle className='catalog-diagram-node' cx='296' cy='85' r='6' />
      </g>
    );
  if (type === 'agents')
    return (
      <g>
        <path d='m140 86 72 64 72-64m-72 64 72 64m-72-64-72 64' />
        {[
          [140, 86],
          [284, 86],
          [140, 214],
          [284, 214],
        ].map(([x, y]) => (
          <circle key={x + '-' + y} cx={x} cy={y} r='23' />
        ))}
        <circle className='catalog-diagram-accent' cx='212' cy='150' r='30' />
        <path d='m203 150 6 6 12-13' />
      </g>
    );
  if (type === 'api')
    return (
      <g>
        <rect x='76' y='109' width='80' height='82' rx='8' />
        <rect x='268' y='109' width='80' height='82' rx='8' />
        <path d='M156 137h112m-9-8 9 8-9 8m9 18H156m9-8-9 8 9 8' />
        <path d='m101 136-12 14 12 14m31-28 12 14-12 14m-10-33-11 38' />
        <ellipse cx='308' cy='129' rx='22' ry='8' />
        <path d='M286 129v37c0 11 44 11 44 0v-37m-44 18c0 11 44 11 44 0' />
      </g>
    );
  return (
    <g>
      <rect x='96' y='72' width='232' height='156' rx='9' />
      <path d='M96 106h232m-213-17h4m9 0h4m9 0h4m23 38-25 24 25 24m88-48 25 24-25 24m-28-58-20 69' />
    </g>
  );
};

/** Real image when available; the alternate view is explicitly a diagram. */
export const CatalogProjectMedia = ({
  project,
  eager = false,
}: {
  project: CatalogProject;
  eager?: boolean;
}) => {
  const { i18n } = usePortfolio();
  const copy = getCatalogCopy(i18n.language);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [project.image]);
  if (project.image && !failed)
    return (
      <img
        className='catalog-project-image'
        src={project.image}
        alt={project.imageAlt || project.title}
        loading={eager ? 'eager' : 'lazy'}
        decoding='async'
        width='1440'
        height='900'
        onError={() => setFailed(true)}
      />
    );
  return (
    <div
      className='catalog-illustration'
      data-illustration={project.illustration || 'code'}
    >
      <svg
        viewBox='0 0 424 300'
        role='img'
        aria-label={copy.technicalIllustration + ': ' + project.title}
      >
        <Illustration type={project.illustration} />
      </svg>
      <span>{copy.technicalIllustration}</span>
    </div>
  );
};

export const CatalogStatus = ({
  catalog,
}: {
  catalog: ReturnType<typeof useProjectCatalog>;
}) => {
  const {
    copy,
    language,
    isSnapshot,
    isLoading,
    isFetching,
    isError,
    refreshedAt,
    refetch,
  } = catalog;
  const locale = getCatalogLanguage(language);
  const date = new Intl.DateTimeFormat(locale === 'jp' ? 'ja' : locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(refreshedAt));
  return (
    <div
      className='catalog-freshness'
      data-state={isError ? 'error' : isLoading ? 'loading' : 'ready'}
    >
      <p role='status'>
        {isError
          ? copy.error
          : isLoading
            ? copy.loading
            : isSnapshot
              ? copy.snapshot
              : copy.current}
        {isError && <span>{copy.fallback}</span>}
      </p>
      <div className='catalog-freshness-actions'>
        <span>
          {isSnapshot ? copy.snapshot : copy.refreshed} ·{' '}
          <time dateTime={new Date(refreshedAt).toISOString()}>{date}</time>
        </span>
        {isError && (
          <button
            className='text-link'
            type='button'
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            {isFetching ? copy.loading : copy.retry}
            <span aria-hidden='true'>↻</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const ProjectCatalog = ({
  heading = true,
  headingLevel = 'h2',
}: {
  heading?: boolean;
  headingLevel?: 'h1' | 'h2';
}) => {
  const catalog = useProjectCatalog();
  const { projects, copy } = catalog;
  const id = useId();
  const searchInput = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [technology, setTechnology] = useState('');
  const technologies = useMemo(
    () =>
      [...new Set(projects.flatMap((project) => project.technologies))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [projects]
  );
  const shown = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return projects.filter(
      (project) =>
        (!technology || project.technologies.includes(technology)) &&
        (!term ||
          [
            project.title,
            project.repository,
            project.summary,
            ...project.technologies,
          ]
            .join(' ')
            .toLocaleLowerCase()
            .includes(term))
    );
  }, [projects, search, technology]);
  const Heading = headingLevel;
  const CardHeading = headingLevel === 'h1' ? 'h2' : 'h3';
  const clear = () => {
    setSearch('');
    setTechnology('');
    searchInput.current?.focus({ preventScroll: true });
  };
  return (
    <section className='project-catalog' aria-label={copy.title}>
      {heading && (
        <header className='catalog-heading'>
          <span className='eyebrow'>
            GitHub / {projects.length.toString().padStart(2, '0')}
          </span>
          <Heading tabIndex={-1}>{copy.title}</Heading>
          <p>{copy.description}</p>
        </header>
      )}
      <div className='catalog-controls'>
        <div className='catalog-search'>
          <label htmlFor={id + '-search'}>{copy.search}</label>
          <input
            ref={searchInput}
            id={id + '-search'}
            type='search'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.search}
          />
        </div>
        <div className='catalog-filter'>
          <label htmlFor={id + '-technology'}>{copy.technology}</label>
          <select
            id={id + '-technology'}
            value={technology}
            onChange={(event) => setTechnology(event.target.value)}
          >
            <option value=''>{copy.allTechnologies}</option>
            {technologies.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        {(search || technology) && (
          <button
            className='text-link catalog-reset'
            type='button'
            onClick={clear}
          >
            {copy.reset}
            <span aria-hidden='true'>×</span>
          </button>
        )}
      </div>
      <div className='catalog-results' role='status' aria-live='polite'>
        {copy.results(shown.length)}
      </div>
      <div className='catalog-grid'>
        {shown.map((project) => (
          <article
            className='catalog-card'
            key={project.slug}
            data-project={project.slug}
          >
            <Link
              className='catalog-card-media'
              to={'/projects/' + project.slug}
              aria-label={copy.details + ': ' + project.title}
              tabIndex={-1}
            >
              <CatalogProjectMedia project={project} />
            </Link>
            <div className='catalog-card-body'>
              <span className='catalog-status'>
                {copy.statuses[project.status]}
              </span>
              <CardHeading>
                <Link to={'/projects/' + project.slug}>
                  {project.title}
                  <span aria-hidden='true'>↗</span>
                </Link>
              </CardHeading>
              <p>{project.summary}</p>
              <ul className='technology-list' aria-label={copy.technology}>
                {project.technologies.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a
                className='catalog-source text-link'
                href={project.github}
                target='_blank'
                rel='noreferrer'
              >
                {copy.source}
                <span aria-hidden='true'>↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
      {shown.length === 0 && (
        <div className='catalog-empty'>
          <p>{copy.noResults}</p>
          {(search || technology) && (
            <button className='button button-secondary' onClick={clear}>
              {copy.reset}
            </button>
          )}
        </div>
      )}
      <CatalogStatus catalog={catalog} />
    </section>
  );
};
