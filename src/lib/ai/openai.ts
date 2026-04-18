import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as { openai: OpenAI };

export const openai =
  globalForOpenAI.openai ??
  new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });

if (process.env.NODE_ENV !== "production") globalForOpenAI.openai = openai;

export const AI_MODEL = "deepseek-chat";

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
