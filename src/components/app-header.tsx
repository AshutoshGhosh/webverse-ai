"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

/**
 * Global top navigation. Present across the app except the Brain workspace,
 * which has its own sidebar (with the same logo-home link + user menu).
 * Transparent over the hero, resolving to a blurred glass bar once scrolled.
 */
export function AppHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only show the Dashboard link when there's a session — when logged out it
  // just bounces back to the landing page, so hiding it avoids a dead link.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSignedIn(!!session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (pathname?.startsWith("/brain")) return null;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[rgba(5,5,5,0.65)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 h-16">
        <Logo />
        <div className="flex items-center gap-5">
          {signedIn && (
            <Link
              href="/dashboard"
              className="text-sm text-[#A7A7B2] hover:text-white transition-colors hidden sm:block"
            >
              Dashboard
            </Link>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
