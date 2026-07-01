import { z } from 'zod';

const isoDate = z
  .string()
  .regex(
    /^\d{4}-\d{2}(-\d{2})?$/,
    'Use ISO 8601 month or day precision: YYYY-MM or YYYY-MM-DD'
  );

export const profileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional(),
  social: z.object({
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    email: z.string().email().optional(),
  }),
});

export const experienceTypeSchema = z.enum(['job', 'education', 'course']);

export const experienceSchema = z.object({
  id: z.string().min(1),
  role: z.string().min(1),
  organization: z.string().min(1),
  type: experienceTypeSchema.optional(),
  period: z.object({
    start: isoDate,
    end: isoDate.optional(),
    durationLabel: z.string().min(1),
  }),
  summary: z.string(),
  highlights: z.array(z.string()).optional(),
});

export const skillCategorySchema = z.enum([
  'language',
  'framework',
  'tool',
  'database',
  'platform',
  'library',
  'service',
]);

export const skillSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: skillCategorySchema.optional(),
  summary: z.string().optional(),
  link: z.string().url().optional(),
  iconKey: z.string().optional(),
});

export const resumeSchema = z.object({
  profile: profileSchema,
  experience: z.array(experienceSchema),
  skills: z.array(skillSchema),
});

export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Resume = z.infer<typeof resumeSchema>;
