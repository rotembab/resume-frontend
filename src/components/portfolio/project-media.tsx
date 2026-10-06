import { useEffect, useState } from 'react';
import { PortfolioProject } from '../../data/projects';
import { usePortfolio } from './use-portfolio';

export const ProjectMedia = ({
  project,
  eager = false,
  sourceRecovery = true,
}: {
  project: PortfolioProject;
  eager?: boolean;
  sourceRecovery?: boolean;
}) => {
  const { copy } = usePortfolio();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [project.image]);
  const [width, height] =
    project.slug === 'hebrew-subtitle-studio'
      ? [1440, 1000]
      : project.slug === 'blaster'
        ? [631, 419]
        : [1440, 960];
  if (failed)
    return (
      <div
        className='project-image-placeholder'
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <span>{project.title}</span>
        <small>{copy.projectImageFallback}</small>
        {sourceRecovery && (
          <a
            className='text-link'
            href={project.github}
            target='_blank'
            rel='noreferrer'
          >
            {copy.viewSource}
            <span aria-hidden='true'>↗</span>
          </a>
        )}
      </div>
    );
  return (
    <img
      src={project.image}
      alt={project.imageAlt}
      loading={eager ? 'eager' : 'lazy'}
      width={width}
      height={height}
      decoding='async'
      onError={() => setFailed(true)}
      {...(eager ? { fetchpriority: 'high' } : {})}
    />
  );
};
