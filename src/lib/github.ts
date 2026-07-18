interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  default_branch: string;
  private: boolean;
  owner: { avatar_url: string; login: string };
  html_url: string;
  created_at: string;
  updated_at: string;
}

// Encode each path segment so untrusted owner/repo/branch/path values can never
// break out of the intended GitHub REST path or inject query parameters.
const enc = encodeURIComponent;

function ghHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function fetchUserRepos(accessToken: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&type=all`,
      { headers: ghHeaders(accessToken) }
    );

    if (!res.ok) break;

    const batch: GitHubRepo[] = await res.json();
    repos.push(...batch);

    if (batch.length < perPage) break;
    page++;
  }

  return repos;
}

export async function fetchDefaultBranch(
  accessToken: string,
  owner: string,
  repo: string
): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${enc(owner)}/${enc(repo)}`,
    { headers: ghHeaders(accessToken) }
  );

  if (!res.ok) return "main";

  const data = await res.json();
  return data.default_branch || "main";
}

export interface RepoTree {
  tree: { path: string; type: string; size?: number }[];
  /** GitHub truncates very large trees; when true the analysis saw only a partial tree. */
  truncated: boolean;
}

export async function fetchRepoTree(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string
): Promise<RepoTree> {
  const res = await fetch(
    `https://api.github.com/repos/${enc(owner)}/${enc(repo)}/git/trees/${enc(branch)}?recursive=1`,
    { headers: ghHeaders(accessToken) }
  );

  if (!res.ok) return { tree: [], truncated: false };

  const data = await res.json();
  return { tree: data.tree || [], truncated: Boolean(data.truncated) };
}

export async function fetchFileContent(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | null> {
  // Split the file path into segments and encode each one so subdirectories
  // (the `/` separators) survive while every segment is individually escaped.
  const safePath = path.split("/").map(enc).join("/");
  const res = await fetch(
    `https://api.github.com/repos/${enc(owner)}/${enc(repo)}/contents/${safePath}?ref=${enc(branch)}`,
    { headers: ghHeaders(accessToken) }
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (data.encoding === "base64" && data.content) {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }
  return null;
}
