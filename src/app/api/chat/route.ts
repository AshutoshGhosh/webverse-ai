import { openai as getOpenAI } from "@/lib/openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { messages, repoContext } = await request.json();

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const arch = repoContext.architecture;
  const hasAnalysis =
    !!repoContext.summary && (arch?.nodes?.length || arch?.layers?.length);

  const architectureText = arch
    ? `Layers: ${JSON.stringify(arch.layers || [])}
Modules/services (nodes): ${JSON.stringify(
        (arch.nodes || []).map((n: { label: string; type: string; layer: string }) => ({
          label: n.label,
          type: n.type,
          layer: n.layer,
        }))
      )}
Relationships (edges): ${JSON.stringify(
        (arch.edges || []).map((e: { source: string; target: string; type: string; label?: string }) => ({
          from: e.source,
          to: e.target,
          type: e.type,
          label: e.label,
        }))
      )}`
    : "No architecture data available.";

  const patternsText = JSON.stringify(
    (repoContext.patterns || []).map((p: { name: string; description: string }) => ({
      name: p.name,
      description: p.description,
    }))
  );
  const dependenciesText = JSON.stringify(
    (repoContext.dependencies || []).map((d: { name: string; version: string }) => `${d.name}@${d.version}`)
  );
  const insightsText = JSON.stringify(repoContext.insights || []);
  const healthText = repoContext.health
    ? `Overall score: ${repoContext.health.overall_score}/100. Categories: ${JSON.stringify(
        (repoContext.health.categories || []).map((c: { name: string; score: number }) => `${c.name}: ${c.score}`)
      )}`
    : "No health data available.";

  // Build a source-code excerpts section, capping the total combined text so we don't blow the token budget.
  const MAX_CODE_CHARS = 12000;
  const files: { path: string; excerpt: string }[] = repoContext.files || [];
  let codeChars = 0;
  const codeBlocks: string[] = [];
  for (const f of files) {
    const block = `--- ${f.path} ---\n${f.excerpt}`;
    if (codeChars + block.length > MAX_CODE_CHARS) break;
    codeBlocks.push(block);
    codeChars += block.length;
  }
  const codeText = codeBlocks.length
    ? codeBlocks.join("\n\n")
    : "No source code excerpts available.";

  const systemPrompt = `You are the "Engineering Brain" — an expert assistant for the repository "${repoContext.owner}/${repoContext.repo}".

Answer using ONLY the analysis context below, which was produced by scanning this specific repository. The context includes both a high-level analysis AND actual SOURCE CODE EXCERPTS from real files in this repository. When answering implementation questions (e.g. how error handling, validation, or a specific feature works), read the source code excerpts and quote or reference the ACTUAL code and file paths you see there. Do NOT fall back to generic descriptions of "typical" frontend/backend projects, and do NOT speculate about frameworks that are not evidenced in the context. Only say the information is unavailable if NEITHER the analysis NOR the source code excerpts cover it — and in that case tell the user to run (or re-run) the analysis — do not guess.

Be concise but thorough. Use markdown. When you reference a file, format it as \`path/to/file.ts\`.
${hasAnalysis ? "" : "\nNOTE: No analysis data is currently available for this repository. Tell the user to run the analysis first before you can answer specifics."}

=== ANALYSIS CONTEXT ===
Summary: ${repoContext.summary || "No analysis summary available."}

Architecture:
${architectureText}

Detected patterns: ${patternsText}

Dependencies: ${dependenciesText}

Health: ${healthText}

Insights: ${insightsText}

=== SOURCE CODE EXCERPTS ===
${codeText}
=== END CONTEXT ===`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await getOpenAI().chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          ],
          stream: true,
          temperature: 0.4,
          max_tokens: 2000,
        });

        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Chat failed" })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
