import { chatCompletion } from "@/lib/ai/openai";
import type { Profile } from "@/lib/config/schema";

const SYSTEM_PROMPT = `You are an expert resume writer.
CRITICAL RULES:
- NEVER fabricate, invent, or add facts not present in the original profile
- Only reorganize, emphasize, and reword existing content
- Add keywords from the job description only if the underlying skill/experience genuinely exists
- Keep the same JSON structure as the input profile
- Return valid JSON only.`;

export async function tailorResume(
  profile: Profile,
  jobTitle: string,
  jobDescription: string,
  aggressiveness: "conservative" | "moderate" | "aggressive" = "moderate"
): Promise<Profile> {
  const aggressivenessGuide = {
    conservative: "Minor rewording only. Change ≤20% of content.",
    moderate: "Reorder bullet points, emphasize relevant skills, add JD keywords where genuinely applicable.",
    aggressive: "Full restructure: reorder sections, rewrite bullets for maximum relevance. Same facts, different framing.",
  }[aggressiveness];

  const userMessage = `
## Job Title
${jobTitle}

## Job Description
${jobDescription}

## Original Profile (JSON)
${JSON.stringify(profile, null, 2)}

Tailor the profile for this job. Aggressiveness: ${aggressiveness}
Guidance: ${aggressivenessGuide}

Return the full modified profile as JSON matching the original structure exactly.
`.trim();

  const raw = await chatCompletion(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    { response_format: { type: "json_object" } }
  );

  return JSON.parse(raw) as Profile;
}
