import OpenAI from "openai";

/**
 * The chat model, configurable via the OPENAI_MODEL env var (defaults to gpt-4o).
 * Must be a model that supports Chat Completions with streaming and strict
 * structured outputs (e.g. gpt-4o, gpt-4o-mini, gpt-4.1).
 */
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

let _client: OpenAI | null = null;

/** Lazily-constructed singleton OpenAI client (avoids reading the API key at import time). */
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export { getClient as openai };
