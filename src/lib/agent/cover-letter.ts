import { chatCompletion } from "@/lib/ai/openai";
import type { Profile } from "@/lib/config/schema";

const SYSTEM_PROMPT = `You are a professional cover letter writer.
Write concise, authentic cover letters that do not sound generic or AI-generated.
3 paragraphs max: hook (why this company/role), value prop (specific skills/achievements), call to action.`;

export async function generateCoverLetter(
  profile: Profile,
  jobTitle: string,
  company: string,
  jobDescription: string
): Promise<string> {
  const userMessage = `
## Candidate
Name: ${profile.personal.name}
Summary: ${profile.summary ?? ""}
Top skills: ${profile.skills?.primary?.slice(0, 8).join(", ") ?? ""}
Recent experience: ${profile.experience?.[0]?.title ?? ""} at ${profile.experience?.[0]?.company ?? ""}

## Role
Title: ${jobTitle}
Company: ${company}
Description: ${jobDescription.slice(0, 1500)}

Write a 3-paragraph cover letter. Tone: professional but direct. No filler phrases like "I am writing to express my interest".
`.trim();

  return chatCompletion([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ]);
}
