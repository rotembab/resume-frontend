import fs from 'node:fs';
import path from 'node:path';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { ZodError } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { resumeSchema } from '../src/data/resume.schema';
import { runClaude } from './_claude-cli';

const PRIVATE_DIR = 'private';
const DEFAULT_PDF_PATH = path.join(PRIVATE_DIR, 'resume.pdf');
const OUTPUT_PATH = path.join('src', 'data', 'resume.json');
const DEBUG_PATH = path.join('src', 'data', 'resume.raw.json');

// If no explicit path and the default doesn't exist, pick any PDF under private/.
const resolvePdfPath = (explicit?: string): string | null => {
  if (explicit) return fs.existsSync(explicit) ? explicit : null;
  if (fs.existsSync(DEFAULT_PDF_PATH)) return DEFAULT_PDF_PATH;
  if (!fs.existsSync(PRIVATE_DIR)) return null;
  const pdfs = fs
    .readdirSync(PRIVATE_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .map((f) => path.join(PRIVATE_DIR, f));
  if (pdfs.length === 1) return pdfs[0];
  if (pdfs.length > 1) {
    console.error(
      `Multiple PDFs in ${PRIVATE_DIR}/. Pass an explicit path:\n  ${pdfs.join('\n  ')}`
    );
    process.exit(1);
  }
  return null;
};

const main = async () => {
  const pdfPath = resolvePdfPath(process.argv[2]);

  if (!pdfPath) {
    console.error(
      `No resume PDF found. Drop one at ${DEFAULT_PDF_PATH} (or any *.pdf in ${PRIVATE_DIR}/), or pass a path: npm run resume:import -- /path/to/resume.pdf`
    );
    process.exit(1);
  }

  console.log(`Extracting text from ${pdfPath}...`);
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfData = await pdfParse(pdfBytes);
  const resumeText = pdfData.text.trim();

  if (!resumeText) {
    console.error(
      "No text extracted from the PDF. (Is it a scanned image? You'd need OCR for that.)"
    );
    process.exit(1);
  }

  const jsonSchema = zodToJsonSchema(resumeSchema, { name: 'Resume' });

  const prompt = `You are a resume parser. Extract the resume below into a JSON object that matches the schema EXACTLY.

Output structure — use these field names verbatim. Do NOT use "title", "summary" at profile level, or any field not in the schema:
- profile: { name, headline, description, location?, social: { github?, linkedin?, email? } }
- experience[]: { id, role, organization, type?, period: { start, end?, durationLabel }, summary, highlights? }
- skills[]: { id, name, category?, summary?, link?, iconKey? }

Do NOT add top-level fields like "languages", "phone", "education". The schema is complete as-is.

The "experience" array holds BOTH jobs AND education/courses. Education entries go in "experience" with type: "education" or "course". Do NOT drop a degree or course just because it isn't a job. Include EVERY experience item from the resume — jobs, degrees, and courses alike.

Rules:
- Every "id" is a kebab-case slug derived from the organization or skill name (e.g. "izer", "ono-bsc", "react", "framer-motion").
- "period.start" and "period.end" use ISO 8601 month precision ("YYYY-MM"); use "YYYY-MM-DD" only if the resume gives day precision.
- Omit "period.end" entirely for ongoing positions (do NOT write "Present").
- "period.durationLabel" is the human-readable form ("Nov 2023 - Present", "Jan 2021 - May 2021 · 4 months").
- "profile.social.email" is the bare address (no "mailto:"). Omit if not on the resume.
- "profile.headline" is the role/title (e.g. "Full Stack Developer").
- "profile.description" is the long-form bio paragraph.
- Omit any optional field that is not on the resume — do not include empty strings for URLs.
- All URL fields MUST be fully-qualified (start with "https://"). Resumes often shorten LinkedIn to "linkedin.com/in/..." — prepend "https://" when extracting.

Skills curation (important — do this even if the resume lists them differently):
- Dedupe near-identical skills (e.g. "Node" and "Node.js" → one "Node.js" entry; "React" and "React.js" → one "React" entry).
- Skip role labels masquerading as skills (e.g. "Frontend", "Backend", "Full Stack", "DevOps").
- Skip generic terms like "Sockets" if a more specific one ("WebSockets") is present.
- For EVERY skill in the output, populate ALL of these fields:
  - "iconKey": lowercase kebab-case slug suitable as a filename ("react", "nextjs", "framer-motion", "unreal-engine", "tanstack-query"). Always use ".js" → "js" with no dot (e.g. Next.js → "nextjs", Node.js → "nodejs").
  - "category": one of "language" | "framework" | "tool" | "database" | "platform" | "library" | "service". Pick the most accurate one.
  - "summary": a short tag describing what it is ("Programming Language", "React Framework", "NoSQL Database", "Container Orchestration"). 2-5 words.
  - "link": the official website URL.

Resume text:
${resumeText}`;

  console.log('Parsing via Claude Code CLI...');
  const { result, costUsd, durationMs } = await runClaude(prompt, {
    jsonSchema,
    model: 'sonnet',
  });

  // Safety net: prepend "https://" to bare domain URLs the model produced
  // (e.g. "linkedin.com/in/...") so the URL validator accepts them.
  const fixBareUrls = (value: unknown): unknown => {
    if (typeof value === 'string') {
      if (
        /^(www\.|[a-z0-9-]+\.)[a-z]{2,}/i.test(value) &&
        !value.includes('@')
      ) {
        return `https://${value}`;
      }
      return value;
    }
    if (Array.isArray(value)) return value.map(fixBareUrls);
    if (value && typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        // Skip non-URL string fields so we don't accidentally prefix descriptions
        if (k === 'github' || k === 'linkedin' || k === 'link' || k === 'url') {
          out[k] = fixBareUrls(v);
        } else if (v && typeof v === 'object') {
          out[k] = fixBareUrls(v);
        } else {
          out[k] = v;
        }
      }
      return out;
    }
    return value;
  };

  const normalized = fixBareUrls(result);
  fs.writeFileSync(DEBUG_PATH, JSON.stringify(normalized, null, 2) + '\n');

  let resume;
  try {
    resume = resumeSchema.parse(normalized);
  } catch (err) {
    if (err instanceof ZodError) {
      console.error(
        `Schema validation failed. Raw output kept at ${DEBUG_PATH}.`
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

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(resume, null, 2) + '\n');
  fs.rmSync(DEBUG_PATH, { force: true });

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(
    `  ${resume.experience.length} experience entries, ${resume.skills.length} skills`
  );
  if (costUsd !== undefined) console.log(`  Cost: $${costUsd.toFixed(4)}`);
  if (durationMs !== undefined)
    console.log(`  Time: ${(durationMs / 1000).toFixed(1)}s`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
