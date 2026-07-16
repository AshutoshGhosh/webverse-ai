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

export async function fetchUserRepos(accessToken: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&type=all`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
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
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!res.ok) return "main";

  const data = await res.json();
  return data.default_branch || "main";
}

export async function fetchRepoTree(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string
): Promise<{ path: string; type: string; size?: number }[]> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return data.tree || [];
}

export async function fetchFileContent(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (data.encoding === "base64" && data.content) {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }
  return null;
}
