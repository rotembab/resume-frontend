import { Link } from 'react-router';
import type { CatalogProject } from '../../data/project-catalog';
import { getCatalogCopy } from '../../data/catalog-copy';
import { CatalogProjectMedia } from './project-catalog';
import { usePortfolio } from './use-portfolio';

export const RepositoryDetail = ({
  project,
  next,
}: {
  project: CatalogProject;
  next?: CatalogProject;
}) => {
  const { copy: portfolioCopy, i18n } = usePortfolio();
  const copy = getCatalogCopy(i18n.language);
  const date = new Date(project.updatedAt);
  return (
    <article
      className={
        'page-container detail-page repository-detail project-' + project.slug
      }
      data-studio-page='repository'
    >
      <div className='case-utility'>
        <Link className='text-link back-link' to='/projects'>
          <span aria-hidden='true'>←</span>
          {portfolioCopy.backToWork}
        </Link>
        <span className='case-status'>{copy.statuses[project.status]}</span>
      </div>
      <header className='detail-heading'>
        <span className='eyebrow'>{project.repository}</span>
        <h1 tabIndex={-1}>{project.title}</h1>
        <div className='case-deck'>
          <p>{project.summary}</p>
          <a
            className='button button-primary'
            href={project.github}
            target='_blank'
            rel='noreferrer'
          >
            {copy.source}
            <span aria-hidden='true'>↗</span>
          </a>
        </div>
      </header>
      <figure className='detail-image repository-image'>
        <CatalogProjectMedia project={project} eager />
        <figcaption className='case-media-caption'>
          <span>{project.title}</span>
          <span>{project.technologies.slice(0, 2).join(' / ')}</span>
        </figcaption>
      </figure>
      <div className='case-study-grid'>
        <aside className='case-study-aside'>
          <h2>{copy.technology}</h2>
          <ul className='technology-list'>
            {project.technologies.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className='repository-update'>
            {copy.updated}
            <br />
            <time dateTime={project.updatedAt}>
              {Number.isNaN(date.getTime())
                ? '—'
                : date.toISOString().slice(0, 10)}
            </time>
          </p>
          <a
            className='text-link'
            href={project.github}
            target='_blank'
            rel='noreferrer'
          >
            GitHub<span aria-hidden='true'>↗</span>
          </a>
        </aside>
        <div className='case-study-body'>
          <section>
            <h2>{copy.overview}</h2>
            <p>{project.details?.overview || project.summary}</p>
          </section>
          {!!project.details?.features.length && (
            <section>
              <h2>{copy.features}</h2>
              <ul>
                {project.details.features.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
          {!!project.details?.notes.length && (
            <section className='case-limitations'>
              <h2>{copy.notes}</h2>
              <ul>
                {project.details.notes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      {next && (
        <Link className='next-project' to={'/projects/' + next.slug}>
          <span>{portfolioCopy.nextProject}</span>
          <strong>{next.title}</strong>
          <span aria-hidden='true'>↗</span>
        </Link>
      )}
    </article>
  );
};
