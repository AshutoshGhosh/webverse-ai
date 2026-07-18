import { NextResponse } from "next/server";
import { openai as getOpenAI, OPENAI_MODEL } from "@/lib/openai";
import { fetchRepoTree, fetchFileContent, fetchDefaultBranch } from "@/lib/github";
import { getGithubToken } from "@/lib/github-token";
import { createClient } from "@/lib/supabase/server";
import { parseRepoParams } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { parseDependencies } from "@/lib/dependencies";
import { saveAnalysis, getAnalysis } from "@/lib/supabase/analyses";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisUserPrompt,
  ANALYSIS_JSON_SCHEMA,
} from "@/lib/analysis-prompt";
import type { AnalysisResults, Dependency } from "@/lib/types";

// Manifest filenames we parse deterministically for the authoritative dependency list.
const MANIFEST_FILES = [
  "package.json",
  "requirements.txt",
  "pyproject.toml",
  "Cargo.toml",
  "go.mod",
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const params = parseRepoParams(body);
  if (!params) {
    return NextResponse.json({ error: "Invalid owner/repo" }, { status: 400 });
  }
  const { owner, repo } = params;
  const refresh = Boolean(body?.refresh);

  // Authorize with getUser() (revalidates the token server-side) — not getSession().
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit expensive AI analysis per user: 8 analyses / 5 minutes.
  const rl = rateLimit(`analyze:${user.id}`, 8, 5 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  const token = await getGithubToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      function send(event: {
        phase: string;
        message: string;
        type: string;
        progress: number;
        data?: unknown;
      }) {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        // Cache: reuse a stored analysis unless the client explicitly asked to refresh.
        if (!refresh) {
          const cached = await getAnalysis(owner, repo);
          if (cached) {
            send({ phase: "structure", message: "Loading saved analysis...", type: "start", progress: 20 });
            send({
              phase: "synthesis",
              message: "Loaded from your saved knowledge base.",
              type: "complete",
              progress: 100,
              data: cached.results,
            });
            return;
          }
        }

        // Phase 1: Structure
        send({ phase: "structure", message: "Scanning repository tree...", type: "start", progress: 5 });
        const branch = await fetchDefaultBranch(token, owner, repo);
        const { tree, truncated } = await fetchRepoTree(token, owner, repo, branch);

        if (tree.length === 0) {
          send({
            phase: "error",
            message: `Could not read the repository tree on branch "${branch}". The repository may be empty, private without access, or inaccessible.`,
            type: "error",
            progress: 0,
          });
          return;
        }

        const fileCount = tree.filter((f) => f.type === "blob").length;
        const dirCount = tree.filter((f) => f.type === "tree").length;
        const truncNote = truncated ? " (tree truncated by GitHub — large repo, partial view)" : "";
        send({
          phase: "structure",
          message: `Found ${fileCount} files across ${dirCount} directories (branch: ${branch})${truncNote}`,
          type: "progress",
          progress: 15,
        });

        // Select key files: all manifests first (for dependencies), then representative source.
        const blobs = tree.filter((f) => f.type === "blob");
        const manifestPaths = blobs.filter((f) => {
          const base = f.path.split("/").pop() || "";
          return MANIFEST_FILES.includes(base);
        });
        const readmePaths = blobs.filter((f) => /readme/i.test(f.path));
        const sourcePaths = blobs.filter(
          (f) =>
            (f.path.includes("src/") || f.path.includes("app/") || f.path.includes("lib/")) &&
            !f.path.includes("node_modules") &&
            /\.(ts|tsx|js|jsx|py|go|rs|java|rb|vue|svelte)$/.test(f.path)
        );
        const configPaths = blobs.filter((f) =>
          /(tsconfig|next\.config|vite\.config|dockerfile|\.env\.example)/i.test(f.path)
        );

        // Deduplicate while preserving priority order, cap the set we fetch.
        const keyFiles = dedupe([
          ...manifestPaths,
          ...readmePaths,
          ...configPaths,
          ...sourcePaths,
        ]).slice(0, 18);

        // Phase 2: Architecture — read key files
        send({ phase: "architecture", message: "Reading key files for architecture analysis...", type: "start", progress: 20 });
        const fileContents: { path: string; content: string }[] = [];
        for (const file of keyFiles) {
          const content = await fetchFileContent(token, owner, repo, file.path, branch);
          if (content) fileContents.push({ path: file.path, content: content.slice(0, 4000) });
        }
        send({ phase: "architecture", message: `Analyzed ${fileContents.length} key files`, type: "progress", progress: 35 });

        // Phase 3: Dependencies — parse manifests deterministically (authoritative list).
        send({ phase: "dependencies", message: "Parsing dependency manifests...", type: "start", progress: 42 });
        const parsedDeps: Dependency[] = parseDependencies(fileContents);
        send({
          phase: "dependencies",
          message: parsedDeps.length
            ? `Extracted ${parsedDeps.length} dependencies from manifests`
            : "No manifest dependencies found",
          type: "progress",
          progress: 50,
        });

        // Phase 4 & 5: Patterns / Health (performed within synthesis)
        send({ phase: "patterns", message: "Detecting design patterns and conventions...", type: "start", progress: 56 });
        send({ phase: "health", message: "Assessing engineering health metrics...", type: "start", progress: 62 });

        // Phase 6: Synthesis with AI (strict structured output)
        send({ phase: "synthesis", message: "Synthesizing intelligence with AI...", type: "start", progress: 70 });

        const treeOverview = blobs.map((f) => f.path).slice(0, 300).join("\n");
        const filesSummary = fileContents
          .map((f) => `--- ${f.path} ---\n${f.content}`)
          .join("\n\n");

        const response = await getOpenAI().chat.completions.create({
          model: OPENAI_MODEL,
          messages: [
            { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
            {
              role: "user",
              content: buildAnalysisUserPrompt({
                owner,
                repo,
                branch,
                fileCount,
                dirCount,
                truncated,
                treeOverview,
                filesSummary,
                dependencies: parsedDeps,
              }),
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "repository_analysis", strict: true, schema: ANALYSIS_JSON_SCHEMA },
          },
          temperature: 0.1,
          max_tokens: 8000,
        });

        send({ phase: "synthesis", message: "AI analysis complete", type: "progress", progress: 90 });

        const analysisContent = response.choices[0]?.message?.content || "{}";
        let results: AnalysisResults;
        try {
          results = JSON.parse(analysisContent) as AnalysisResults;
        } catch {
          send({
            phase: "error",
            message: "The AI returned a response that could not be parsed. Please try analyzing again.",
            type: "error",
            progress: 0,
          });
          return;
        }

        // Guarantee shape so downstream views never crash on missing keys.
        results.architecture ??= { nodes: [], edges: [], layers: [] };
        results.health ??= { overall_score: 0, categories: [] };
        results.patterns ??= [];
        results.insights ??= [];

        // Authoritative dependency override: trust our parser over the model.
        // Keep any extra deps the model found via imports that we didn't parse.
        results.dependencies = mergeDependencies(parsedDeps, results.dependencies ?? []);

        // Attach fetched source so chat can answer implementation questions.
        results.files = fileContents.map((f) => ({ path: f.path, excerpt: f.content.slice(0, 2500) }));

        // Persist to the user's knowledge base (best-effort — never blocks the response).
        await saveAnalysis(user.id, owner, repo, results, truncated);

        send({ phase: "synthesis", message: "Analysis complete!", type: "complete", progress: 100, data: results });
      } catch (error) {
        console.error("[api/analyze] failed:", error);
        send({
          phase: "error",
          message: error instanceof Error ? error.message : "Analysis failed",
          type: "error",
          progress: 0,
        });
      } finally {
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

function dedupe(files: { path: string; type: string; size?: number }[]) {
  const seen = new Set<string>();
  const out: typeof files = [];
  for (const f of files) {
    if (seen.has(f.path)) continue;
    seen.add(f.path);
    out.push(f);
  }
  return out;
}

// The parsed manifest list wins on (name+type); the model may contribute extras it saw imported.
function mergeDependencies(parsed: Dependency[], model: Dependency[]): Dependency[] {
  const byKey = new Map<string, Dependency>();
  for (const d of parsed) byKey.set(`${d.type}:${d.name}`, d);
  for (const d of model) {
    const key = `${d.type}:${d.name}`;
    if (!byKey.has(key) && d?.name) byKey.set(key, { ...d, version: d.version || "*" });
  }
  return [...byKey.values()];
}
