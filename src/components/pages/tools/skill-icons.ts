import iconManifest from './icon-manifest.json';

// The manifest is updated by `scripts/fetch-skill-icons.ts` whenever new icons
// are downloaded. Keys are skill iconKeys; values are URLs under /public.
const manifest = iconManifest as Record<string, string>;

export const getSkillIcon = (iconKey?: string): string | undefined =>
  iconKey ? manifest[iconKey] : undefined;
