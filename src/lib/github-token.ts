import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const GITHUB_TOKEN_COOKIE = "gh_provider_token";

/**
 * Resolves the GitHub access token for the current request.
 *
 * Supabase only exposes `provider_token` immediately after sign-in and drops it
 * on session refresh, so we fall back to the httpOnly cookie we persisted in the
 * OAuth callback. Returns null if the user has no valid Supabase session.
 */
export async function getGithubToken(): Promise<string | null> {
  const supabase = await createClient();

  // Authorize with getUser() — it revalidates the auth token with Supabase,
  // unlike getSession() which merely decodes the cookie without verification.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // The GitHub provider_token is only present on the session right after
  // sign-in; the durable source is the httpOnly cookie set in the OAuth callback.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.provider_token) return session.provider_token;

  const cookieStore = await cookies();
  return cookieStore.get(GITHUB_TOKEN_COOKIE)?.value ?? null;
}
