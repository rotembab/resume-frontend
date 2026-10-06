import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPortfolioCopy } from '../../data/portfolio-copy';
import { getProjects } from '../../data/projects';
import { ProjectMedia } from './project-media';

vi.mock('./use-portfolio', () => ({
  usePortfolio: () => ({ copy: getPortfolioCopy('en') }),
}));
afterEach(cleanup);

const projects = getProjects('en');
const copy = getPortfolioCopy('en');

describe('authentic project media and recovery', () => {
  it.each([
    ['hebrew-subtitle-studio', 1440, 1000],
    ['esp32-claude-remote', 1440, 960],
    ['blaster', 631, 419],
    ['cinema', 1440, 960],
  ] as const)(
    'reserves %s dimensions and retains the same ratio after image failure',
    (slug, width, height) => {
      const project = projects.find((entry) => entry.slug === slug)!;
      const { container } = render(<ProjectMedia project={project} />);
      const image = screen.getByRole('img', { name: project.imageAlt });
      expect(image).toHaveAttribute('src', project.image);
      expect(image).toHaveAttribute('width', String(width));
      expect(image).toHaveAttribute('height', String(height));
      expect(image).toHaveAttribute('loading', 'lazy');

      fireEvent.error(image);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByText(project.title)).toBeVisible();
      expect(screen.getByText(copy.projectImageFallback)).toBeVisible();
      expect(container.querySelector('.project-image-placeholder')).toHaveStyle(
        {
          aspectRatio: `${width} / ${height}`,
        }
      );
      expect(
        screen.getByRole('link', { name: copy.viewSource })
      ).toHaveAttribute('href', project.github);
    }
  );

  it('prioritizes eager case-study media and recovers when a new image is supplied', () => {
    const project = projects[0];
    const { rerender } = render(<ProjectMedia project={project} eager />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager');
    expect(screen.getByRole('img')).toHaveAttribute('fetchpriority', 'high');
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText(copy.projectImageFallback)).toBeVisible();

    rerender(<ProjectMedia project={projects[1]} eager />);
    expect(screen.getByRole('img')).toHaveAttribute('src', projects[1].image);
    expect(
      screen.queryByText(copy.projectImageFallback)
    ).not.toBeInTheDocument();
  });

  it('preserves the containing project link without nesting a recovery link', () => {
    const project = projects[0];
    const { container } = render(
      <a href={'/projects/' + project.slug} aria-label={project.title}>
        <ProjectMedia project={project} sourceRecovery={false} />
      </a>
    );
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('link', { name: project.title })).toHaveAttribute(
      'href',
      '/projects/' + project.slug
    );
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(container.querySelector('a a')).toBeNull();
    expect(screen.getByText(copy.projectImageFallback)).toBeVisible();
  });
});
