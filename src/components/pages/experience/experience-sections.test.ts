import { afterEach, describe, expect, it, vi } from 'vitest';
import { Experience } from '../../../data/resume.schema';
import { isJobEntry, splitExperience, sumJobYears } from './experience-sections';

const entry = (id: string, type?: Experience['type']): Experience => ({
  id,
  role: 'Role',
  organization: 'Org',
  ...(type ? { type } : {}),
  period: { start: '2020-01', durationLabel: 'Jan 2020 - Present' },
  summary: 'Summary',
});

const job = (id: string, start: string, end?: string): Experience => ({
  id,
  role: 'Role',
  organization: 'Org',
  period: { start, ...(end ? { end } : {}), durationLabel: 'label' },
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

describe('sumJobYears', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('sums a single closed period', () => {
    expect(sumJobYears([job('a', '2020-01', '2022-01')])).toBe(2);
  });

  it('sums multiple periods independently', () => {
    const total = sumJobYears([
      job('a', '2020-01', '2022-01'), // 2 yrs
      job('b', '2022-01', '2022-07'), // ~0.5 yr
    ]);
    expect(total).toBeCloseTo(2.5, 1);
  });

  it('excludes education and course entries', () => {
    const entries = [
      job('a', '2020-01', '2022-01'),
      entry('edu', 'education'),
      entry('course', 'course'),
    ];
    expect(sumJobYears(entries)).toBe(2);
  });

  it('excludes jobs flagged excludeFromExperienceYears', () => {
    const entries = [
      job('a', '2020-01', '2022-01'),
      { ...job('qa', '2018-01', '2019-01'), excludeFromExperienceYears: true },
    ];
    expect(sumJobYears(entries)).toBe(2);
  });

  it('counts open-ended periods up to today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01'));
    expect(sumJobYears([job('a', '2022-01')])).toBe(2);
  });

  it('returns 0 for no job entries', () => {
    expect(sumJobYears([entry('edu', 'education')])).toBe(0);
  });
});
