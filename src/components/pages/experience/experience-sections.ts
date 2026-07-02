import { Experience } from '../../../data/resume.schema';

export const isJobEntry = (entry: Experience): boolean =>
  !entry.type || entry.type === 'job';

export const splitExperience = (entries: Experience[]) => ({
  jobs: entries.filter(isJobEntry),
  education: entries.filter((entry) => !isJobEntry(entry)),
});
