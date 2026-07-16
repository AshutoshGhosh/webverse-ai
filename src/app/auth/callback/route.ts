import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GITHUB_TOKEN_COOKIE } from "@/lib/github-token";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);

      // Supabase does not persist provider_token across session refreshes,
      // so we capture the GitHub access token here and store it ourselves.
      const providerToken = data.session?.provider_token;
      if (providerToken) {
        response.cookies.set(GITHUB_TOKEN_COOKIE, providerToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
      }

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
