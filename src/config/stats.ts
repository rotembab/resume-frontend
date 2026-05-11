// Adjust the anchor dates below and the home-page stats update automatically.
// Phase 5 will replace this with values derived from the resume JSON.

export const STAT_ANCHORS = {
  fullStackStart: new Date('2023-11-01'),
} as const;

export const yearsSince = (date: Date) => {
  const ms = Date.now() - date.getTime();
  const years = ms / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.round(years * 10) / 10);
};
