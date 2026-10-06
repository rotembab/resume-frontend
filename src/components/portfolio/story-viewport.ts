/** Safari's collapsing browser bars must not change a chapter's scroll span. */
export const storyViewportHeight = () => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--story-viewport-height')
    .trim();
  const height = value.endsWith('px') ? Number.parseFloat(value) : NaN;
  return Number.isFinite(height) && height > 0 ? height : window.innerHeight;
};
