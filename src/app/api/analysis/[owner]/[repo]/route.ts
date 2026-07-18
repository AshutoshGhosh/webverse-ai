import { NextResponse } from "next/server";
import { getAnalysis } from "@/lib/supabase/analyses";
import { parseRepoParams } from "@/lib/validation";

// Returns the persisted analysis for (owner, repo) so client views can rehydrate
// after a page refresh instead of losing the in-memory store. getAnalysis is
// user-scoped via RLS, so a user only ever reads their own analyses.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const resolved = await params;
  const valid = parseRepoParams(resolved);
  if (!valid) {
    return NextResponse.json({ error: "Invalid owner/repo" }, { status: 400 });
  }

  const stored = await getAnalysis(valid.owner, valid.repo);
  if (!stored) {
    return NextResponse.json({ results: null }, { status: 404 });
  }

  return NextResponse.json({ results: stored.results, updatedAt: stored.updatedAt });
}
