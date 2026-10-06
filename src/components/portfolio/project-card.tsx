import { Link } from 'react-router';
import { PortfolioProject } from '../../data/projects';
import { usePortfolio } from './use-portfolio';
import { ProjectMedia } from './project-media';

export const ProjectCard = ({
  project,
  compact = false,
  headingLevel = 'h3',
}: {
  project: PortfolioProject;
  compact?: boolean;
  headingLevel?: 'h2' | 'h3';
}) => {
  const { copy } = usePortfolio();
  const Heading = headingLevel;
  return (
    <article
      className={compact ? 'project-card compact-project' : 'project-card'}
    >
      <Link
        className='project-image-link'
        to={'/projects/' + project.slug}
        aria-label={copy.viewProject + ': ' + project.title}
      >
        <ProjectMedia
          key={project.slug}
          project={project}
          sourceRecovery={false}
        />
        <span className='project-open' aria-hidden='true'>
          ↗
        </span>
      </Link>
      <div className='project-card-content'>
        <div className='project-meta'>
          <span>
            {project.status === 'prototype'
              ? copy.prototype
              : copy.personalProject}
          </span>
          <span>{project.technologies.slice(0, 2).join(' / ')}</span>
        </div>
        <Heading>
          <Link to={'/projects/' + project.slug}>{project.title}</Link>
        </Heading>
        <p>{project.summary}</p>
        <Link className='text-link' to={'/projects/' + project.slug}>
          {copy.viewProject}
          <span aria-hidden='true'>↗</span>
        </Link>
      </div>
    </article>
  );
};
