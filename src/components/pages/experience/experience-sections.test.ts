import { describe, expect, it } from 'vitest';
import { Experience } from '../../../data/resume.schema';
import { isJobEntry, splitExperience } from './experience-sections';

const entry = (id: string, type?: Experience['type']): Experience => ({
  id,
  role: 'Role',
  organization: 'Org',
  ...(type ? { type } : {}),
  period: { start: '2020-01', durationLabel: 'Jan 2020 - Present' },
  summary: 'Summary',
});

describe('isJobEntry', () => {
  it('treats entries without a type as jobs', () => {
    expect(isJobEntry(entry('a'))).toBe(true);
  });

  it('treats explicit job entries as jobs', () => {
    expect(isJobEntry(entry('a', 'job'))).toBe(true);
  });

  it('treats education and course entries as non-jobs', () => {
    expect(isJobEntry(entry('a', 'education'))).toBe(false);
    expect(isJobEntry(entry('a', 'course'))).toBe(false);
  });
});

describe('splitExperience', () => {
  it('splits jobs from education and courses, preserving order', () => {
    const entries = [
      entry('job-1'),
      entry('job-2', 'job'),
      entry('edu-1', 'education'),
      entry('course-1', 'course'),
      entry('edu-2', 'education'),
    ];
    const { jobs, education } = splitExperience(entries);
    expect(jobs.map((e) => e.id)).toEqual(['job-1', 'job-2']);
    expect(education.map((e) => e.id)).toEqual(['edu-1', 'course-1', 'edu-2']);
  });

  it('handles an empty list', () => {
    expect(splitExperience([])).toEqual({ jobs: [], education: [] });
  });
});
