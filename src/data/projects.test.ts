import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getProjects, type PortfolioProject } from './projects';

const projectSlugs = [
  'hebrew-subtitle-studio',
  'esp32-claude-remote',
  'blaster',
  'cinema',
];

function narrative(project: PortfolioProject) {
  return [
    project.summary,
    project.role,
    project.problem,
    ...project.contributions,
    ...project.decisions,
    ...project.limitations,
    project.imageAlt,
  ];
}

afterEach(() => vi.unstubAllGlobals());

describe('curated project catalog', () => {
  it.each(['en', 'he', 'jp'])(
    'keeps shareable project routes stable in %s',
    (language) => {
      expect(getProjects(language).map((project) => project.slug)).toEqual(
        projectSlugs
      );
    }
  );

  it.each(['en', 'he', 'jp'])(
    'provides one featured project for each workshop station in %s',
    (language) => {
      const featured = getProjects(language).filter(
        (project) => project.featured
      );
      expect(
        featured.map((project) => [project.station, project.slug])
      ).toEqual([
        ['product', 'hebrew-subtitle-studio'],
        ['systems', 'esp32-claude-remote'],
        ['lab', 'blaster'],
      ]);
      expect(
        getProjects(language).find((project) => project.slug === 'cinema')
      ).toMatchObject({ featured: false, status: 'prototype' });
    }
  );

  it.each(['en', 'he', 'jp'])(
    'keeps prototypes labeled and case studies complete in %s',
    (language) => {
      for (const project of getProjects(language)) {
        expect(project.status).toBe(
          project.slug === 'hebrew-subtitle-studio'
            ? 'personal-project'
            : 'prototype'
        );
        expect(project.title.trim()).not.toBe('');
        expect(project.contributions.length).toBeGreaterThan(0);
        expect(project.decisions.length).toBeGreaterThan(0);
        expect(project.limitations.length).toBeGreaterThan(0);
        for (const text of narrative(project)) {
          expect(text.trim(), `${project.slug} has empty content`).not.toBe('');
        }
      }
    }
  );

  it.each([
    ['he', /\p{Script=Hebrew}/u],
    ['jp', /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u],
  ] as const)(
    'localizes the case-study narrative in %s',
    (language, script) => {
      for (const project of getProjects(language)) {
        for (const text of narrative(project)) {
          expect(text, `${project.slug} has an untranslated narrative`).toMatch(
            script
          );
        }
      }
    }
  );

  it('serves local preview assets and source links without requiring an API', () => {
    const offlineFetch = vi.fn(() => {
      throw new Error('Network unavailable');
    });
    vi.stubGlobal('fetch', offlineFetch);

    for (const project of getProjects('en')) {
      expect(project.image).toMatch(/^\/images\/projects\//);
      expect(existsSync(resolve('public', project.image.slice(1)))).toBe(true);
      expect(project.github).toMatch(/^https:\/\/github\.com\/rotembab\//);
    }
    expect(offlineFetch).not.toHaveBeenCalled();
  });

  it('supports existing Japanese keys, region suffixes and an English fallback', () => {
    expect(getProjects('jp')).toEqual(getProjects('ja-JP'));
    expect(getProjects('he-IL')).toEqual(getProjects('he'));
    expect(getProjects('unsupported')).toEqual(getProjects('en'));
  });
});
