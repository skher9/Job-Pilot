import OpenAI from "openai";

export const AI_MODEL = "deepseek-chat";

const globalForOpenAI = globalThis as unknown as { openai: OpenAI | undefined };

export function getOpenAI(): OpenAI {
  if (!globalForOpenAI.openai) {
    globalForOpenAI.openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY ?? "missing",
      baseURL: "https://api.deepseek.com",
    });
  }
  return globalForOpenAI.openai;
}

// Keep backward compat — lazily resolved on first access
export const openai = new Proxy({} as OpenAI, {
  get(_t, prop) {
    return (getOpenAI() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export async function chatCompletion(
  messages: OpenAI.ChatCompletionMessageParam[],
  options?: { temperature?: number; response_format?: { type: "json_object" } }
): Promise<string> {
  const res = await openai.chat.completions.create({
    model: AI_MODEL,
    messages,
    temperature: options?.temperature ?? 0.3,
    response_format: options?.response_format,
  });
  return res.choices[0]?.message?.content ?? "";
}
