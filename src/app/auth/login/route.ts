import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();

  // Least-privilege by default: `public_repo read:user` grants read access to
  // public repositories only (WebVerse never writes). To analyze PRIVATE repos,
  // set GITHUB_OAUTH_SCOPES="repo read:user" in the environment.
  const scopes = process.env.GITHUB_OAUTH_SCOPES || "public_repo read:user";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback`,
      scopes,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/?error=auth`);
  }

  return NextResponse.redirect(data.url);
}
