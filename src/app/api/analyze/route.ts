import { NextResponse } from "next/server";
import { openai as getOpenAI } from "@/lib/openai";
import { fetchRepoTree, fetchFileContent, fetchDefaultBranch } from "@/lib/github";
import { getGithubToken } from "@/lib/github-token";

const PHASES = [
  { key: "structure", label: "Mapping Repository Structure" },
  { key: "architecture", label: "Analyzing Architecture Patterns" },
  { key: "dependencies", label: "Evaluating Dependencies" },
  { key: "patterns", label: "Detecting Code Patterns" },
  { key: "health", label: "Assessing Engineering Health" },
  { key: "synthesis", label: "Synthesizing Intelligence" },
];

export async function POST(request: Request) {
  const { owner, repo } = await request.json();

  const token = await getGithubToken();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: { phase: string; message: string; type: string; progress: number; data?: unknown }) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        // Phase 1: Structure
        send({ phase: "structure", message: "Scanning repository tree...", type: "start", progress: 5 });
        const branch = await fetchDefaultBranch(token, owner, repo);
        const tree = await fetchRepoTree(token, owner, repo, branch);

        if (tree.length === 0) {
          send({
            phase: "error",
            message: `Could not read the repository tree on branch "${branch}". The repository may be empty or inaccessible.`,
            type: "error",
            progress: 0,
          });
          controller.close();
          return;
        }

        const fileCount = tree.filter(f => f.type === "blob").length;
        send({ phase: "structure", message: `Found ${fileCount} files across ${tree.filter(f => f.type === "tree").length} directories (branch: ${branch})`, type: "progress", progress: 15 });

        // Sample key files for analysis
        const keyFiles = tree
          .filter(f => f.type === "blob")
          .filter(f =>
            f.path.endsWith("package.json") ||
            f.path.endsWith("tsconfig.json") ||
            f.path.endsWith("Cargo.toml") ||
            f.path.endsWith("go.mod") ||
            f.path.endsWith("requirements.txt") ||
            f.path.includes("README") ||
            f.path.endsWith(".env.example") ||
            (f.path.includes("src/") && !f.path.includes("node_modules"))
          )
          .slice(0, 20);

        // Phase 2: Architecture
        send({ phase: "architecture", message: "Reading key files for architecture analysis...", type: "start", progress: 20 });
        const fileContents: { path: string; content: string }[] = [];
        for (const file of keyFiles.slice(0, 12)) {
          const content = await fetchFileContent(token, owner, repo, file.path, branch);
          if (content) {
            fileContents.push({ path: file.path, content: content.slice(0, 3000) });
          }
        }
        send({ phase: "architecture", message: `Analyzed ${fileContents.length} key files`, type: "progress", progress: 35 });

        // Phase 3: Dependencies
        send({ phase: "dependencies", message: "Evaluating dependency graph...", type: "start", progress: 40 });

        // Phase 4: Patterns
        send({ phase: "patterns", message: "Detecting design patterns and conventions...", type: "start", progress: 50 });

        // Phase 5: Health
        send({ phase: "health", message: "Assessing engineering health metrics...", type: "start", progress: 60 });

        // Phase 6: Synthesis with AI
        send({ phase: "synthesis", message: "Synthesizing intelligence with AI...", type: "start", progress: 70 });

        const treeOverview = tree
          .filter(f => f.type === "blob")
          .map(f => f.path)
          .slice(0, 200)
          .join("\n");

        const filesSummary = fileContents
          .map(f => `--- ${f.path} ---\n${f.content}`)
          .join("\n\n");

        const response = await getOpenAI().chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert software architect. Analyze the ACTUAL repository provided (its file tree and file contents) and produce a comprehensive analysis grounded in what you observe — never invent generic frameworks or answer hypothetically.

Rules:
- Derive architecture nodes from the real directories, modules, services, configs and dependencies you see in the file tree and files. Group them into meaningful layers (e.g. "UI", "State", "API", "Data", "Config", "External").
- Create edges that reflect real relationships (imports, API calls, data flow) visible in the files.
- The repository is non-empty, so architecture.nodes, architecture.layers, patterns, and dependencies MUST NOT be empty. Extract dependencies from package.json / requirements.txt / go.mod / Cargo.toml when present.
- Base the health score and findings on concrete evidence (tests present, config quality, structure, etc.).

Return ONLY valid JSON with this structure:
{
  "summary": "2-3 sentence overview",
  "architecture": {
    "nodes": [{"id": "string", "label": "string", "type": "module|service|database|external|config", "layer": "string", "size": 1}],
    "edges": [{"id": "string", "source": "node_id", "target": "node_id", "label": "string", "type": "import|api|data|event"}],
    "layers": ["string"]
  },
  "health": {
    "overall_score": 0-100,
    "categories": [{"name": "string", "score": 0-100, "max_score": 100, "findings": [{"severity": "info|warning|critical", "title": "string", "description": "string"}]}]
  },
  "patterns": [{"name": "string", "description": "string", "occurrences": 1, "files": ["string"]}],
  "dependencies": [{"name": "string", "version": "string", "type": "production|development", "outdated": false}],
  "insights": [{"type": "strength|concern|suggestion", "title": "string", "description": "string", "priority": 1}]
}`
            },
            {
              role: "user",
              content: `Repository: ${owner}/${repo}\n\nFile tree:\n${treeOverview}\n\nKey files:\n${filesSummary}`
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 8000,
        });

        send({ phase: "synthesis", message: "AI analysis complete", type: "progress", progress: 90 });

        const analysisContent = response.choices[0]?.message?.content || "{}";
        let results;
        try {
          // Strip markdown fences defensively in case the model wraps the JSON.
          const cleaned = analysisContent
            .replace(/^\s*```(?:json)?\s*/i, "")
            .replace(/\s*```\s*$/i, "")
            .trim();
          results = JSON.parse(cleaned);
        } catch {
          send({
            phase: "error",
            message: "The AI returned a response that could not be parsed. Please try analyzing again.",
            type: "error",
            progress: 0,
          });
          controller.close();
          return;
        }

        // Ensure the shape is complete so downstream views never crash on missing keys.
        results.architecture ??= { nodes: [], edges: [], layers: [] };
        results.health ??= { overall_score: 0, categories: [] };
        results.patterns ??= [];
        results.dependencies ??= [];
        results.insights ??= [];

        // Attach the fetched source code so the chat can answer implementation questions.
        results.files = fileContents.map((f) => ({ path: f.path, excerpt: f.content.slice(0, 2000) }));

        send({ phase: "synthesis", message: "Analysis complete!", type: "complete", progress: 100, data: results });
      } catch (error) {
        send({ phase: "error", message: error instanceof Error ? error.message : "Analysis failed", type: "error", progress: 0 });
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
