import { NextResponse } from "next/server";
import { getGithubToken } from "@/lib/github-token";

export async function GET() {
  const token = await getGithubToken();

  if (!token) {
    return NextResponse.json(
      { error: "GitHub access token unavailable. Please sign in again." },
      { status: 401 }
    );
  }

  const res = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=updated&type=all",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: `GitHub request failed (${res.status}).` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(Array.isArray(data) ? data : []);
}
