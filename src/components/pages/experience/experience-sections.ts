import { Experience } from '../../../data/resume.schema';

export const isJobEntry = (entry: Experience): boolean =>
  !entry.type || entry.type === 'job';

export const splitExperience = (entries: Experience[]) => ({
  jobs: entries.filter(isJobEntry),
  education: entries.filter((entry) => !isJobEntry(entry)),
});

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

// Total years across job entries only, summing each period independently.
// Open-ended periods (no `end`) count up to today, so the figure stays live.
export const sumJobYears = (entries: Experience[]): number => {
  const now = Date.now();
  const totalMs = entries.filter(isJobEntry).reduce((acc, entry) => {
    const start = new Date(entry.period.start).getTime();
    const end = entry.period.end ? new Date(entry.period.end).getTime() : now;
    return acc + Math.max(0, end - start);
  }, 0);
  return Math.max(0, Math.round((totalMs / MS_PER_YEAR) * 10) / 10);
};
