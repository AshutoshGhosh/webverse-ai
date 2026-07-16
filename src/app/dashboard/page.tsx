"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, GitFork, Lock, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassPanel } from "@/components/ui/glass-panel";
import { variants, transition } from "@/lib/motion";
import { useRouter } from "next/navigation";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
  owner: { avatar_url: string; login: string };
  updated_at: string;
}

export default function DashboardPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function loadRepos() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push("/");
          return;
        }

        const res = await fetch("/api/github/repos");

        if (!res.ok) {
          setError(
            res.status === 401
              ? "Your GitHub access token has expired. Please sign in again to reconnect your repositories."
              : `Failed to load repositories (server returned ${res.status}).`
          );
          return;
        }

        const data = await res.json();
        setRepos(Array.isArray(data) ? data : []);
      } catch {
        setError("Something went wrong while loading your repositories. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadRepos();
  }, [router]);

  const filtered = repos.filter(
    (r) =>
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen px-8 pb-8 pt-28">
      <motion.div
        className="max-w-[1280px] mx-auto"
        variants={variants.fadeUp}
        initial="initial"
        animate="animate"
        transition={transition.medium}
      >
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
            Select Repository
          </h1>
          <p className="text-[#A7A7B2] mt-1">
            Choose a repository to analyze with the AI Engineering Brain
          </p>
        </div>

        {/* Search */}
        <GlassPanel intensity="subtle" className="p-4 mb-8">
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={18} />}
          />
        </GlassPanel>

        {/* Error state */}
        {!loading && error && (
          <GlassPanel intensity="subtle" className="p-10 text-center">
            <p className="text-[#A7A7B2] mb-6 max-w-md mx-auto">{error}</p>
            <Button onClick={() => { window.location.href = "/auth/login"; }}>
              Sign in with GitHub
            </Button>
          </GlassPanel>
        )}

        {/* Repo Grid */}
        {!error && (loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px]" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={variants.listStagger}
            initial="initial"
            animate="animate"
          >
            {filtered.map((repo) => (
              <motion.div key={repo.id} variants={variants.fadeUp} transition={transition.fast}>
                <Card
                  className="cursor-pointer p-5 h-full"
                  onClick={() => router.push(`/analyze/${repo.owner.login}/${repo.name}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={repo.owner.avatar_url}
                        alt=""
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-sm font-medium text-white truncate max-w-[180px]">
                        {repo.full_name}
                      </span>
                    </div>
                    {repo.private ? (
                      <Lock size={14} className="text-[#6B6B76] shrink-0" />
                    ) : (
                      <Globe size={14} className="text-[#6B6B76] shrink-0" />
                    )}
                  </div>

                  {repo.description && (
                    <p className="text-xs text-[#A7A7B2] mb-4 line-clamp-2">
                      {repo.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-auto">
                    {repo.language && (
                      <Badge variant="muted">{repo.language}</Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-[#6B6B76]">
                      <Star size={12} />
                      <span>{repo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#6B6B76]">
                      <GitFork size={12} />
                      <span>{repo.forks_count}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ))}

        {!error && !loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#6B6B76] text-lg">No repositories found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
