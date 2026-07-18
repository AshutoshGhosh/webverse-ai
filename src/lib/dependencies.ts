import type { Dependency } from "@/lib/types";

/**
 * Deterministically extracts dependencies from real manifest files.
 *
 * The LLM is good at prose and pattern detection but unreliable at transcribing
 * exact package names and versions. So we parse manifests ourselves and treat
 * this list as the source of truth, merging it over whatever the model returns.
 * Supports npm (package.json), Python (requirements.txt / pyproject.toml),
 * Rust (Cargo.toml) and Go (go.mod).
 */
export function parseDependencies(
  files: { path: string; content: string }[]
): Dependency[] {
  const out: Dependency[] = [];
  const seen = new Set<string>();

  const push = (name: string, version: string, type: Dependency["type"]) => {
    const key = `${type}:${name}`;
    if (!name || seen.has(key)) return;
    seen.add(key);
    out.push({ name, version: version || "*", type, outdated: false });
  };

  for (const file of files) {
    const base = file.path.split("/").pop() || file.path;

    if (base === "package.json") {
      try {
        const pkg = JSON.parse(file.content);
        for (const [n, v] of Object.entries(pkg.dependencies ?? {})) {
          push(n, String(v), "production");
        }
        for (const [n, v] of Object.entries(pkg.devDependencies ?? {})) {
          push(n, String(v), "development");
        }
      } catch {
        /* malformed / truncated manifest — skip */
      }
    } else if (base === "requirements.txt") {
      for (const raw of file.content.split("\n")) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const m = line.match(/^([A-Za-z0-9._-]+)\s*(?:[=<>!~]=?\s*(.+))?/);
        if (m) push(m[1], (m[2] || "*").trim(), "production");
      }
    } else if (base === "Cargo.toml") {
      collectTomlDeps(file.content, out, seen, push);
    } else if (base === "pyproject.toml") {
      collectTomlDeps(file.content, out, seen, push);
    } else if (base === "go.mod") {
      // Matches both single-line `require x v1.2.3` and require-block entries.
      const re = /^\s*(?:require\s+)?([\w.\-/]+)\s+v([\w.\-+]+)/gm;
      let m: RegExpExecArray | null;
      while ((m = re.exec(file.content))) {
        if (m[1] === "require") continue;
        push(m[1], `v${m[2]}`, "production");
      }
    }
  }

  return out;
}

// Minimal TOML `[dependencies]` / `[tool.poetry.dependencies]` table reader —
// good enough to list names + version strings without a full TOML parser.
function collectTomlDeps(
  content: string,
  _out: Dependency[],
  _seen: Set<string>,
  push: (name: string, version: string, type: Dependency["type"]) => void
) {
  let inDeps = false;
  let dev = false;
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("[")) {
      inDeps = /dependencies\]?$/.test(line) || /dependencies\]/.test(line);
      dev = /dev|dev-dependencies/.test(line);
      continue;
    }
    if (!inDeps || !line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Za-z0-9._-]+)\s*=\s*(.+)$/);
    if (m) {
      const version = m[2].replace(/["'{].*/, "").trim() || m[2].replace(/["']/g, "").trim();
      push(m[1], version || "*", dev ? "development" : "production");
    }
  }
}
