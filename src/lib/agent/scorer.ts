import { chatCompletion } from "@/lib/ai/openai";
import type { Profile } from "@/lib/config/schema";

export interface ScoreResult {
  score: number;
  reasoning: string;
  matchedSkills: string[];
  missingSkills: string[];
}

const SYSTEM_PROMPT = `You are a senior career advisor and technical recruiter.
Evaluate candidate-job fit strictly and honestly. Never fabricate or assume skills not present in the profile.
Return valid JSON only.`;

export async function scoreJob(
  jobTitle: string,
  jobDescription: string,
  profile: Profile
): Promise<ScoreResult> {
  const userMessage = `
## Candidate Profile
${JSON.stringify(profile, null, 2)}

## Job Title
${jobTitle}

## Job Description
${jobDescription}

Score the fit 1-10 and return JSON:
{
  "score": <number 1-10>,
  "reasoning": "<2-3 sentence explanation>",
  "matchedSkills": ["<skill>", ...],
  "missingSkills": ["<skill>", ...]
}

Rules:
- 8-10: Strong match, apply confidently
- 6-7: Partial match, worth applying
- 1-5: Weak match, skip
- Only list skills explicitly in the profile as matched
- List truly required skills absent from profile as missing
`.trim();

  const raw = await chatCompletion(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    { response_format: { type: "json_object" } }
  );

  const parsed = JSON.parse(raw) as ScoreResult;
  return {
    score: Math.max(1, Math.min(10, Math.round(parsed.score))),
    reasoning: parsed.reasoning ?? "",
    matchedSkills: parsed.matchedSkills ?? [],
    missingSkills: parsed.missingSkills ?? [],
  };
}
