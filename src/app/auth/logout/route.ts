import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GITHUB_TOKEN_COOKIE } from "@/lib/github-token";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();
  await supabase.auth.signOut();
  const response = NextResponse.redirect(origin);
  response.cookies.delete(GITHUB_TOKEN_COOKIE);
  return response;
}
