import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { IGithubRepo } from '../interfaces/github/github-fetch-repos-query';
import { getCatalogCopy } from './catalog-copy';
import { getProjectCatalog } from './project-catalog';
import { getProjects } from './projects';
import { repositorySnapshot } from './repository-snapshot';

const additionalRepositories = [
  'resume-frontend',
  'FlappyBirdClone',
  'KitchenChaos',
  'Cinema_REST_API',
  'OAC_AI_TIV_TAC_TOE',
  'MASP2_OAC',
  'AIMazeSearchProject_OAC',
];

function futureRepository(
  id: number,
  name: string,
  overrides: Partial<IGithubRepo> = {}
): IGithubRepo {
  return {
    id,
    name,
    html_url: `https://github.com/rotembab/${name}`,
    description: null,
    language: 'Rust',
    created_at: '2026-10-06T10:00:00Z',
    updated_at: '2026-10-06T10:00:00Z',
    pushed_at: '2026-10-06T10:00:00Z',
    ...overrides,
  };
}

describe('complete public project catalog', () => {
  it.each(['en', 'he', 'jp'])(
    'orders the snapshot newest to oldest in %s',
    (language) => {
      const catalog = getProjectCatalog(language);
      const timestamps = catalog.map((project) =>
        Date.parse(project.createdAt)
      );
      expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
      expect(catalog.slice(0, 2).map((project) => project.repository)).toEqual([
        'hebrew-subtitle-studio',
        'esp32-claude-remote',
      ]);
    }
  );

  it('orders live and future repositories by creation date with deterministic ties and missing dates last', () => {
    const old = futureRepository(1, 'older-project', {
      created_at: '2024-01-01T00:00:00Z',
    });
    const newer = futureRepository(2, 'newer-project', {
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    });
    const latest = futureRepository(3, 'future-project');
    const unknown = futureRepository(4, 'unknown-date', { created_at: '' });
    const tied = futureRepository(5, 'another-new-project', {
      created_at: latest.created_at,
    });
    const input = [old, unknown, latest, newer, tied];
    expect(
      getProjectCatalog('en', input).map((project) => project.repository)
    ).toEqual([
      'another-new-project',
      'future-project',
      'newer-project',
      'older-project',
      'unknown-date',
    ]);
    expect(input[0]).toBe(old);
  });

  it.each(['en', 'he', 'jp'])(
    'provides all eleven repositories with stable routes in %s',
    (language) => {
      const catalog = getProjectCatalog(language);
      expect(catalog).toHaveLength(11);
      expect(new Set(catalog.map((project) => project.slug)).size).toBe(11);
      expect(new Set(catalog.map((project) => project.repository))).toEqual(
        new Set(repositorySnapshot.map((repository) => repository.name))
      );
      for (const existing of getProjects(language)) {
        const project = catalog.find(
          (entry) => entry.github === existing.github
        );
        expect(project).toMatchObject({
          slug: existing.slug,
          title: existing.title,
          curated: existing,
        });
      }
    }
  );

  it('uses a successful feed as the membership source, including an empty feed', () => {
    expect(getProjectCatalog('en', [])).toEqual([]);
    const future = futureRepository(123, 'new-tool');
    const selected = [repositorySnapshot[0], future, future];
    const catalog = getProjectCatalog('en', selected);
    expect(catalog.map((project) => project.repository)).toEqual([
      'new-tool',
      repositorySnapshot[0].name,
    ]);
    expect(catalog[0]).toMatchObject({
      slug: 'repository-123',
      status: 'repository',
      technologies: ['Rust'],
      illustration: 'code',
    });
  });

  it('keeps the Cinema frontend and API as separate projects', () => {
    const catalog = getProjectCatalog('en');
    expect(
      catalog.find((project) => project.repository === 'cinema')?.slug
    ).toBe('cinema');
    expect(
      catalog.find((project) => project.repository === 'Cinema_REST_API')?.slug
    ).toBe('cinema-rest-api');
  });

  it('preserves a curated case study after a repository rename by GitHub ID', () => {
    const original = repositorySnapshot.find(
      (repository) => repository.name === 'hebrew-subtitle-studio'
    )!;
    const renamed = {
      ...original,
      name: 'subtitle-tools',
      html_url: 'https://github.com/rotembab/subtitle-tools',
    };
    const project = getProjectCatalog('en', [renamed])[0];
    expect(project).toMatchObject({
      slug: 'hebrew-subtitle-studio',
      repository: 'subtitle-tools',
      github: renamed.html_url,
      title: 'Hebrew Subtitle Studio',
      curated: {
        slug: 'hebrew-subtitle-studio',
        github: renamed.html_url,
      },
    });
  });

  it('preserves authored learning-project content after a repository rename', () => {
    const original = repositorySnapshot.find(
      (repository) => repository.name === 'FlappyBirdClone'
    )!;
    const renamed = {
      ...original,
      name: 'unity-bird-game',
      html_url: 'https://github.com/rotembab/unity-bird-game',
    };
    const project = getProjectCatalog('he', [renamed])[0];
    const saved = getProjectCatalog('he').find(
      (entry) => entry.repository === original.name
    )!;
    expect(project).toMatchObject({
      slug: 'flappy-bird-clone',
      repository: renamed.name,
      github: renamed.html_url,
      status: 'learning-project',
      summary: saved.summary,
      details: saved.details,
      technologies: saved.technologies,
    });
  });

  it('uses repository identity rather than a matching name for authored content', () => {
    const otherOwner = futureRepository(124, 'resume-frontend', {
      html_url: 'https://github.com/another-owner/resume-frontend',
    });
    expect(getProjectCatalog('en', [otherOwner])[0]).toMatchObject({
      slug: 'repository-124',
      status: 'repository',
    });
  });

  it('avoids collisions in generic routes, including names that normalize equally', () => {
    const catalog = getProjectCatalog('en', [
      futureRepository(125, 'New_Tool'),
      futureRepository(126, 'New-Tool'),
      futureRepository(127, 'cinema'),
    ]);
    expect(new Set(catalog.map((project) => project.slug)).size).toBe(3);
    expect(
      catalog.find((project) => project.repository === 'New_Tool')?.slug
    ).toBe('repository-125');
  });

  it('keeps future repository routes stable across name and metadata changes', () => {
    const original = futureRepository(4242, 'new-tool');
    const renamed = {
      ...original,
      name: 'renamed-tool',
      html_url: 'https://github.com/rotembab/renamed-tool',
      description: 'Updated repository description.',
      language: 'Go',
    };
    const first = getProjectCatalog('en', [original])[0];
    const current = getProjectCatalog('en', [renamed])[0];
    expect(first.slug).toBe('repository-4242');
    expect(current).toMatchObject({
      slug: first.slug,
      repository: renamed.name,
      title: renamed.name,
      github: renamed.html_url,
      summary: renamed.description,
      technologies: ['Go'],
      status: 'repository',
    });
  });

  it.each([
    ['he', /\p{Script=Hebrew}/u],
    ['jp', /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u],
  ] as const)(
    'localizes all seven new narratives in %s',
    (language, script) => {
      const catalog = getProjectCatalog(language);
      for (const repository of additionalRepositories) {
        const project = catalog.find(
          (entry) => entry.repository === repository
        )!;
        expect(project.summary).toMatch(script);
        expect(project.details).toBeDefined();
        for (const value of [
          project.details!.overview,
          ...project.details!.features,
          ...project.details!.notes,
        ]) {
          expect(value, `${repository} has untranslated text`).toMatch(script);
        }
        if (project.imageAlt) expect(project.imageAlt).toMatch(script);
      }
    }
  );

  it('uses verified game screenshots and labeled technical illustration kinds', () => {
    const catalog = getProjectCatalog('en');
    for (const repository of ['FlappyBirdClone', 'KitchenChaos']) {
      const project = catalog.find((entry) => entry.repository === repository)!;
      expect(existsSync(resolve('public', project.image!.slice(1)))).toBe(true);
      expect(project.imageAlt).toBeTruthy();
    }
    for (const repository of additionalRepositories.slice(3)) {
      const project = catalog.find((entry) => entry.repository === repository)!;
      expect(project.image).toBeUndefined();
      expect(project.illustration).toBeTruthy();
    }
  });

  it('normalizes Japanese and regional locale keys and falls back to English', () => {
    expect(getProjectCatalog('ja-JP')).toEqual(getProjectCatalog('jp'));
    expect(getProjectCatalog('he-IL')).toEqual(getProjectCatalog('he'));
    expect(getProjectCatalog('fr')).toEqual(getProjectCatalog('en'));
    expect(getCatalogCopy('ja-JP')).toBe(getCatalogCopy('jp'));
  });
});
