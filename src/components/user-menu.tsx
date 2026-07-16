"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface SessionUser {
  name: string;
  avatar: string;
}

/**
 * Reads the current Supabase session and renders the logged-in user's details.
 *
 * Layouts:
 * - default (no props)  — a clean horizontal row (avatar + name + "Sign out").
 *                         Used by the global header.
 * - `stacked`           — a tidy vertical block (avatar + name on one line,
 *                         a full-width "Sign out" affordance below). Used by the
 *                         expanded Brain sidebar.
 * - `compact`           — avatar + icon-only sign-out, centered. Used by the
 *                         collapsed Brain sidebar. Takes precedence over `stacked`.
 */
export function UserMenu({
  compact = false,
  stacked = false,
}: {
  compact?: boolean;
  stacked?: boolean;
}) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const map = (session: Session | null): SessionUser | null =>
      session
        ? {
            name:
              (session.user.user_metadata?.full_name as string) ||
              session.user.email ||
              "",
            avatar: (session.user.user_metadata?.avatar_url as string) || "",
          }
        : null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(map(session));
      setLoaded(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(map(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!loaded) return null;

  if (!user) {
    return (
      <Button size="sm" onClick={() => { window.location.href = "/auth/login"; }}>
        Connect GitHub
      </Button>
    );
  }

  const signOut = () => {
    window.location.href = "/auth/logout";
  };

  const avatar = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.avatar}
      alt={user.name}
      className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.12)] object-cover shrink-0"
    />
  );

  // Collapsed sidebar: avatar centered with an icon-only sign-out below.
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2">
        {avatar}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          onClick={signOut}
          className="h-8 w-8 rounded-[10px]"
        >
          <LogOut size={16} />
        </Button>
      </div>
    );
  }

  // Expanded sidebar: a tidy vertical block — name on its own line, then sign out.
  if (stacked) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          {avatar}
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
            {user.name}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start gap-2 px-2 text-[#A7A7B2]"
        >
          <LogOut size={14} className="shrink-0" />
          Sign out
        </Button>
      </div>
    );
  }

  // Default (global header): a clean horizontal row.
  return (
    <div className="flex items-center gap-3">
      {avatar}
      <span className="hidden max-w-[160px] truncate text-sm text-[#A7A7B2] sm:block">
        {user.name}
      </span>
      <Button variant="ghost" size="sm" onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}
