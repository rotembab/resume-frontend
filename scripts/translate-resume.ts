import fs from 'node:fs';
import path from 'node:path';
import { ZodError } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { resumeSchema, Resume } from '../src/data/resume.schema';
import { runClaude } from './_claude-cli';

const SOURCE_PATH = path.join('src', 'data', 'resume.json');

type LanguageConfig = {
  code: string;
  name: string;
  outputPath: string;
  styleGuidance?: string;
};

const ALL_TARGET_LANGUAGES: LanguageConfig[] = [
  {
    code: 'he',
    name: 'Hebrew',
    outputPath: 'src/data/resume.he.json',
    styleGuidance: `Use the natural conventions of the Israeli tech industry — do NOT translate literally.
- Leave these terms in Latin script (or use the conventional transliteration, never a literal Hebrew word): "Frontend", "Backend", "Full Stack", "Stack", "Production", "Debug", "Bug fix", "Deploy", "Build", "Pipeline", "Code review", "End-to-end", "Feature".
- Use "סטאק" (transliterated), never "ערימה". Use "פרודקשן", never "ייצור". Use "פיצ'ר" or leave "feature" in English, never "תכונה" for a software feature.
- Use "פרונט" / "בק" or leave "frontend" / "backend" in English — never "חזית" / "חלק אחורי".
- All tool, framework, library, language, and product names stay in Latin script verbatim (React, TypeScript, Vite, Mantine, Kotlin, Java, Next.js, Docker, etc.).
- Write like an Israeli senior developer would write their own LinkedIn — concise, mixed Hebrew/English, no translationese.`,
  },
  {
    code: 'jp',
    name: 'Japanese',
    outputPath: 'src/data/resume.jp.json',
  },
];

const requestedCodes = process.argv.slice(2);
const TARGET_LANGUAGES =
  requestedCodes.length > 0
    ? ALL_TARGET_LANGUAGES.filter((l) => requestedCodes.includes(l.code))
    : ALL_TARGET_LANGUAGES;

const main = async () => {
  if (!fs.existsSync(SOURCE_PATH)) {
    console.error(`Source resume not found at ${SOURCE_PATH}.`);
    console.error('Run `npm run resume:import` first.');
    process.exit(1);
  }

  if (TARGET_LANGUAGES.length === 0) {
    console.error(
      `No matching language(s) for "${requestedCodes.join(', ')}". Choose from: ${ALL_TARGET_LANGUAGES.map((l) => l.code).join(', ')}`
    );
    process.exit(1);
  }

  const sourceRaw = fs.readFileSync(SOURCE_PATH, 'utf8');
  const source: Resume = resumeSchema.parse(JSON.parse(sourceRaw));
  const sourceJson = JSON.stringify(source);
  const jsonSchema = zodToJsonSchema(resumeSchema, { name: 'Resume' });

  for (const language of TARGET_LANGUAGES) {
    console.log(`Translating to ${language.name} via Claude Code CLI...`);

    const prompt = `Translate the resume JSON below into ${language.name}, producing a JSON object that matches the schema you're constrained to.

Rules:
- Translate ONLY: profile.name (transliterate), profile.headline, profile.description, profile.location, experience[].role, experience[].organization, experience[].summary, experience[].highlights, experience[].period.durationLabel, skills[].name (transliterate or keep), skills[].summary.
- Preserve VERBATIM: every id, iconKey, every URL (link, social.github, social.linkedin, social.email), every ISO date (period.start, period.end), every type, every category.
- Keep the exact JSON structure and keys.
${language.styleGuidance ? `\n${language.styleGuidance}\n` : ''}
Source resume JSON:
${sourceJson}`;

    const { result, costUsd, durationMs } = await runClaude(prompt, {
      jsonSchema,
      model: 'sonnet',
    });

    let translated: Resume;
    try {
      translated = resumeSchema.parse(result);
    } catch (err) {
      if (err instanceof ZodError) {
        const debugPath = `${language.outputPath}.raw.json`;
        fs.writeFileSync(debugPath, JSON.stringify(result, null, 2) + '\n');
        console.error(
          `Schema validation failed for ${language.name}. Raw output kept at ${debugPath}.`
        );
        for (const issue of err.issues) {
          console.error(
            `  ${issue.path.join('.') || '<root>'}: ${issue.message} (${issue.code})`
          );
        }
        process.exit(1);
      }
      throw err;
    }

    fs.writeFileSync(
      language.outputPath,
      JSON.stringify(translated, null, 2) + '\n'
    );
    console.log(`  Wrote ${language.outputPath}`);
    if (costUsd !== undefined) console.log(`  Cost: $${costUsd.toFixed(4)}`);
    if (durationMs !== undefined)
      console.log(`  Time: ${(durationMs / 1000).toFixed(1)}s`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
