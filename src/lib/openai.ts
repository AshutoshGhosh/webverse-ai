import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export async function streamAnalysis(
  systemPrompt: string,
  userPrompt: string,
  onChunk: (text: string) => void
): Promise<string> {
  const stream = await getClient().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    stream: true,
    temperature: 0.3,
  });

  let fullResponse = "";
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || "";
    if (text) {
      fullResponse += text;
      onChunk(text);
    }
  }
  return fullResponse;
}

export async function getStructuredOutput<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: Record<string, unknown>
): Promise<T> {
  const response = await getClient().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "analysis_output",
        strict: true,
        schema: schema,
      },
    },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");
  return JSON.parse(content) as T;
}

export { getClient as openai };
