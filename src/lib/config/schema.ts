import { z } from "zod";

export const ProfileSchema = z.object({
  personal: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    portfolio: z.string().optional(),
  }),
  summary: z.string().optional(),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        duration: z.string(),
        responsibilities: z.array(z.string()),
        skills: z.array(z.string()).optional(),
      })
    )
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.string(),
      })
    )
    .optional(),
  skills: z
    .object({
      primary: z.array(z.string()).optional(),
      backend: z.array(z.string()).optional(),
      tools: z.array(z.string()).optional(),
    })
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        url: z.string().optional(),
      })
    )
    .optional(),
});

export const ConfigSchema = z.object({
  search: z.object({
    keywords: z.array(z.string()),
    locations: z.array(z.string()),
    platforms: z.array(z.enum(["linkedin", "indeed", "naukri"])),
    experience_level: z.array(z.string()).optional(),
    job_type: z.array(z.string()).optional(),
    blacklist_companies: z.array(z.string()).optional(),
    blacklist_keywords: z.array(z.string()).optional(),
  }),
  application: z.object({
    min_fit_score: z.number().min(1).max(10).default(7),
    max_applications_per_run: z.number().default(20),
    auto_apply: z.boolean().default(false),
    cover_letter: z.boolean().default(true),
    tailor_resume: z.boolean().default(true),
  }),
  ai: z
    .object({
      model: z.string().default("gpt-4o"),
      resume_aggressiveness: z
        .enum(["conservative", "moderate", "aggressive"])
        .default("moderate"),
    })
    .optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type Config = z.infer<typeof ConfigSchema>;
