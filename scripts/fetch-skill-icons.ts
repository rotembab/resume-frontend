import fs from 'node:fs';
import path from 'node:path';
import { resumeSchema } from '../src/data/resume.schema';
import { runClaude } from './_claude-cli';

const RESUME_PATH = path.join('src', 'data', 'resume.json');
const ICONS_DIR = path.join('public', 'images', 'tools');
const MANIFEST_PATH = path.join(
  'src',
  'components',
  'pages',
  'tools',
  'icon-manifest.json'
);

type SkillEntry = { iconKey: string; name: string };

// Normalize whatever Claude returns into [{ iconKey, slug }, ...].
// Sonnet sometimes returns { mapping: [...] }, sometimes a flat object keyed
// by iconKey, sometimes a bare array.
const normalizeMapping = (
  v: unknown
): Array<{ iconKey: string; slug: string | null }> => {
  if (Array.isArray(v)) {
    return v
      .filter((x) => x && typeof x === 'object')
      .map((x) => {
        const o = x as Record<string, unknown>;
        return {
          iconKey: String(o.iconKey ?? ''),
          slug: o.slug == null ? null : String(o.slug),
        };
      })
      .filter((m) => m.iconKey);
  }
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if (Array.isArray(o.mapping)) return normalizeMapping(o.mapping);
    // If Claude wrapped the flat object in a single wrapper key, unwrap it
    const keys = Object.keys(o);
    if (
      keys.length === 1 &&
      o[keys[0]] &&
      typeof o[keys[0]] === 'object' &&
      !Array.isArray(o[keys[0]])
    ) {
      return normalizeMapping(o[keys[0]]);
    }
    // Flat object keyed by iconKey
    return Object.entries(o)
      .map(([key, value]) => {
        if (value && typeof value === 'object') {
          const inner = value as Record<string, unknown>;
          return {
            iconKey: String(inner.iconKey ?? key),
            slug: inner.slug == null ? null : String(inner.slug),
          };
        }
        return {
          iconKey: key,
          slug: value == null ? null : String(value),
        };
      })
      .filter((m) => m.iconKey);
  }
  return [];
};

const readManifest = (): Record<string, string> => {
  if (!fs.existsSync(MANIFEST_PATH)) return {};
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
};

const writeManifest = (manifest: Record<string, string>) => {
  // Sort keys for stable diffs
  const sorted = Object.fromEntries(
    Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))
  );
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + '\n');
};

const main = async () => {
  if (!fs.existsSync(RESUME_PATH)) {
    console.error(
      `Resume not found at ${RESUME_PATH}. Run resume:import first.`
    );
    process.exit(1);
  }

  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  const resume = resumeSchema.parse(
    JSON.parse(fs.readFileSync(RESUME_PATH, 'utf8'))
  );
  const manifest = readManifest();

  const candidates: SkillEntry[] = resume.skills
    .filter((s): s is typeof s & { iconKey: string } => Boolean(s.iconKey))
    .map((s) => ({ iconKey: s.iconKey!, name: s.name }));

  const missing = candidates.filter((c) => !manifest[c.iconKey]);

  if (missing.length === 0) {
    console.log(`All ${candidates.length} skill icons are in the manifest.`);
    return;
  }

  console.log(
    `Asking Claude for Simple Icons slugs for ${missing.length} skills...`
  );

  const prompt = `Map each of these skill iconKeys to its Simple Icons slug (https://simpleicons.org).

Examples of correct Simple Icons slugs: React → "react", Next.js → "nextdotjs", Node.js → "nodedotjs", TanStack Query → "reactquery", GitHub → "github", CSS → "css", HTML → "html5". Note: Simple Icons does NOT have logos for Java or Oracle products — use null for those.

If a skill is NOT on Simple Icons (niche libraries, protocols like WebSockets, proprietary tools), use null for its slug.

Output EXACTLY this JSON shape — a flat object where each key is the iconKey and each value is the slug string or null. No wrapper, no extra keys, no prose:

{
  "react": "react",
  "nextjs": "nextdotjs",
  "websockets": null,
  ...
}

Skills to map:
${JSON.stringify(missing, null, 2)}`;

  // Don't use --json-schema here — Anthropic's structured outputs rejects
  // unions like ["string","null"], and the prompt + JSON.parse is reliable
  // enough for this simple shape.
  const { result, costUsd } = await runClaude(prompt, {
    model: 'sonnet',
  });

  const mapping = normalizeMapping(result);
  if (mapping.length === 0) {
    console.error('No usable mappings extracted from Claude:', result);
    process.exit(1);
  }

  let fetched = 0;
  let skipped = 0;

  // Known slug rewrites — Simple Icons renames things and Claude's training
  // data lags behind. Try the rewrite first, then the original.
  const SLUG_REWRITES: Record<string, string> = {
    css3: 'css',
    html5: 'html',
  };

  const trySlug = async (slug: string, outPath: string): Promise<boolean> => {
    const response = await fetch(`https://cdn.simpleicons.org/${slug}`);
    if (!response.ok) return false;
    fs.writeFileSync(outPath, await response.text());
    return true;
  };

  for (const item of mapping) {
    if (!item.slug) {
      console.log(`  ✗ ${item.iconKey} — not on Simple Icons, skipping`);
      skipped++;
      continue;
    }
    const outPath = path.join(ICONS_DIR, `${item.iconKey}.svg`);
    const slugs = [SLUG_REWRITES[item.slug], item.slug, item.iconKey].filter(
      (s): s is string => Boolean(s)
    );
    let success = false;
    for (const slug of slugs) {
      try {
        if (await trySlug(slug, outPath)) {
          manifest[item.iconKey] = `/images/tools/${item.iconKey}.svg`;
          console.log(
            `  ✓ ${item.iconKey} → ${outPath}${slug !== item.slug ? ` (used slug "${slug}")` : ''}`
          );
          fetched++;
          success = true;
          break;
        }
      } catch {
        // try next slug
      }
    }
    if (!success) {
      console.log(
        `  ✗ ${item.iconKey} (slug "${item.slug}") — all candidates failed`
      );
      skipped++;
    }
  }

  writeManifest(manifest);

  console.log(`\nDone. Fetched ${fetched}, skipped ${skipped}.`);
  if (costUsd !== undefined) console.log(`Cost: $${costUsd.toFixed(4)}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
