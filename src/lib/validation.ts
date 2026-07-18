// GitHub owner (login) and repo name rules, enforced before any value is
// interpolated into a GitHub API URL. Owners: alphanumeric + single hyphens.
// Repos: alphanumeric plus `. _ -`. Both are length-capped.
const OWNER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPO_RE = /^[A-Za-z0-9._-]{1,100}$/;

export interface RepoParams {
  owner: string;
  repo: string;
}

/**
 * Validates and normalizes { owner, repo } from untrusted request input.
 * Returns null when either value is missing or fails its pattern, so route
 * handlers can reject with a 400 instead of forwarding garbage to GitHub.
 */
export function parseRepoParams(input: unknown): RepoParams | null {
  if (typeof input !== "object" || input === null) return null;
  const { owner, repo } = input as Record<string, unknown>;

  if (typeof owner !== "string" || typeof repo !== "string") return null;

  const o = owner.trim();
  const r = repo.trim();

  if (!OWNER_RE.test(o) || !REPO_RE.test(r)) return null;
  return { owner: o, repo: r };
}
