import OpenAI from "openai";

let _client: OpenAI | null = null;

/**
 * Returns a shared OpenAI client instance.
 * Throws if OPENAI_API_KEY is not set.
 */
export function getOpenAIClient(): OpenAI {
  if (_client) return _client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  _client = new OpenAI({ apiKey });
  return _client;
}
