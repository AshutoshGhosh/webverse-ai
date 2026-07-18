import { createClient } from "@/lib/supabase/server";
import type { AnalysisResults } from "@/lib/types";

export interface StoredAnalysis {
  results: AnalysisResults;
  truncated: boolean;
  updatedAt: string;
}

/**
 * Persists (upserts) an analysis for the current user, keyed by (user_id, owner, repo).
 * Runs under the user's session so RLS guarantees a user can only write their own rows.
 * Returns false if the write fails (e.g. the migration hasn't been applied) — callers
 * treat persistence as best-effort so the live analysis still succeeds without a DB.
 */
export async function saveAnalysis(
  userId: string,
  owner: string,
  repo: string,
  results: AnalysisResults,
  truncated: boolean
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("analyses")
    .upsert(
      {
        user_id: userId,
        owner,
        repo,
        results,
        truncated,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,owner,repo" }
    );

  if (error) {
    console.error("[analyses.saveAnalysis] persistence failed:", error.message);
    return false;
  }
  return true;
}

/**
 * Loads the most recent stored analysis for (owner, repo) belonging to the current user.
 * Returns null when there is no session, no matching row, or the table is missing.
 */
export async function getAnalysis(
  owner: string,
  repo: string
): Promise<StoredAnalysis | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("analyses")
    .select("results, truncated, updated_at")
    .eq("user_id", user.id)
    .eq("owner", owner)
    .eq("repo", repo)
    .maybeSingle();

  if (error || !data) return null;

  return {
    results: data.results as AnalysisResults,
    truncated: data.truncated ?? false,
    updatedAt: data.updated_at as string,
  };
}
