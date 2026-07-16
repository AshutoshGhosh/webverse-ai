"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  FolderTree,
  Network,
  Package,
  Boxes,
  Activity,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { LogoIcon } from "@/components/logo";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { variants, transition } from "@/lib/motion";
import { useAnalysisStore } from "@/stores/analysis-store";
import type { TimelineEvent } from "@/lib/types";

const PHASES = [
  { key: "structure", label: "Mapping Repository Structure", icon: FolderTree },
  { key: "architecture", label: "Analyzing Architecture", icon: Network },
  { key: "dependencies", label: "Evaluating Dependencies", icon: Package },
  { key: "patterns", label: "Detecting Design Patterns", icon: Boxes },
  { key: "health", label: "Assessing Engineering Health", icon: Activity },
  { key: "synthesis", label: "Synthesizing Intelligence", icon: Sparkles },
] as const;

export default function AnalyzePage() {
  const params = useParams<{ owner: string; repo: string }>();
  const router = useRouter();
  const {
    status,
    events,
    progress,
    error,
    setStatus,
    addEvent,
    setProgress,
    setResults,
    setError,
    reset,
  } = useAnalysisStore();
  const startedRef = useRef(false);

  useEffect(() => {
    // Synchronous guard — survives React StrictMode's double-invoked effect,
    // so the analysis stream only ever starts once.
    if (startedRef.current) return;
    startedRef.current = true;
    reset();
    startAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startAnalysis() {
    setStatus("running");
    setProgress(0);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: params.owner, repo: params.repo }),
      });

      if (!res.ok || !res.body) {
        setStatus("failed");
        setError("Failed to start analysis");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          const event: TimelineEvent = {
            id: crypto.randomUUID(),
            phase: data.phase,
            message: data.message,
            timestamp: new Date().toISOString(),
            type: data.type,
            data: data.data,
          };
          addEvent(event);
          setProgress(data.progress);

          if (data.type === "complete" && data.data) {
            setResults(data.data);
            setStatus("completed");
          }
          if (data.type === "error") {
            setStatus("failed");
            setError(data.message);
          }
        }
      }
    } catch (err) {
      setStatus("failed");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  function retry() {
    reset();
    startedRef.current = true;
    startAnalysis();
  }

  // Derive per-phase state from the event stream (latest message + furthest phase reached).
  const { messages, reachedIndex } = useMemo(() => {
    const msgs: Record<string, string> = {};
    let max = -1;
    for (const ev of events) {
      const idx = PHASES.findIndex((p) => p.key === ev.phase);
      if (idx === -1) continue;
      msgs[ev.phase] = ev.message;
      if (idx > max) max = idx;
    }
    return { messages: msgs, reachedIndex: max };
  }, [events]);

  const completed = status === "completed";
  const failed = status === "failed";

  const railFill = completed
    ? 100
    : reachedIndex <= 0
    ? 0
    : (reachedIndex / (PHASES.length - 1)) * 100;

  function phaseStatus(i: number): "done" | "active" | "pending" {
    if (completed) return "done";
    if (i < reachedIndex) return "done";
    if (i === reachedIndex) return "active";
    return "pending";
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
      {/* Ambient wash */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(79,124,255,0.10)_0%,rgba(139,92,246,0.05)_40%,transparent_70%)]"
          animate={{ scale: completed ? [1, 1.15, 1] : [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="relative w-full max-w-[720px]"
        variants={variants.fadeUp}
        initial="initial"
        animate="animate"
        transition={transition.medium}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            className="relative inline-flex items-center justify-center w-20 h-20 mb-5"
          >
            {/* Pulsing rings while running */}
            {!completed && !failed && (
              <>
                <motion.span
                  className="absolute inset-0 rounded-full border border-[rgba(79,124,255,0.4)]"
                  animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.span
                  className="absolute inset-0 rounded-full border border-[rgba(139,92,246,0.4)]"
                  animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
                />
              </>
            )}
            <motion.div
              className={`relative w-16 h-16 rounded-full flex items-center justify-center border ${
                completed
                  ? "bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.4)]"
                  : failed
                  ? "bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.4)]"
                  : "bg-gradient-to-br from-[#4F7CFF]/20 to-[#8B5CF6]/20 border-[rgba(79,124,255,0.3)]"
              }`}
              animate={
                completed || failed
                  ? {}
                  : { boxShadow: ["0 0 20px rgba(79,124,255,0.2)", "0 0 45px rgba(139,92,246,0.45)", "0 0 20px rgba(79,124,255,0.2)"] }
              }
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              {completed ? (
                <CheckCircle2 size={30} className="text-[#22C55E]" />
              ) : failed ? (
                <AlertCircle size={30} className="text-[#EF4444]" />
              ) : (
                <LogoIcon size={34} />
              )}
            </motion.div>
          </motion.div>

          <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
            {completed
              ? "Engineering Brain Ready"
              : failed
              ? "Analysis Interrupted"
              : "Building Intelligence"}
          </h1>
          <p className="text-[#A7A7B2] mt-2">
            {completed ? (
              <>
                Fully analyzed{" "}
                <span className="text-white font-medium">
                  {params.owner}/{params.repo}
                </span>
              </>
            ) : failed ? (
              error || "Something went wrong during analysis."
            ) : (
              <>
                Scanning{" "}
                <span className="text-white font-medium">
                  {params.owner}/{params.repo}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Progress */}
        <GlassPanel intensity="subtle" className="p-5 mb-6">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-sm text-[#A7A7B2]">
              {completed ? "Complete" : failed ? "Stopped" : "Processing"}
            </span>
            <div className="flex items-baseline gap-1">
              <motion.span
                key={progress}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-white font-[family-name:var(--font-space-grotesk)] tabular-nums"
              >
                {progress}
              </motion.span>
              <span className="text-sm text-[#6B6B76]">%</span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#4F7CFF] via-[#6D5CFF] to-[#8B5CF6] relative"
              animate={{ width: `${progress}%` }}
              transition={{ ...transition.medium }}
            >
              {!completed && !failed && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
          </div>
        </GlassPanel>

        {/* Phase pipeline */}
        <GlassPanel intensity="medium" className="p-6">
          <div className="relative pl-1">
            {/* Rail — centered on the 52px icon column (pl-1 → 4px + 26px = 30px).
                Sits BEHIND the opaque icon nodes so it only shows as a connector between them. */}
            <div className="absolute left-[30px] -translate-x-1/2 top-7 bottom-7 w-px bg-[rgba(255,255,255,0.08)]" />
            <motion.div
              className="absolute left-[30px] -translate-x-1/2 top-7 w-px bg-gradient-to-b from-[#4F7CFF] to-[#8B5CF6]"
              animate={{ height: `calc(${railFill}% - 0px)` }}
              transition={{ ...transition.medium }}
              style={{ maxHeight: "calc(100% - 56px)" }}
            />

            <div className="space-y-1">
              {PHASES.map((phase, i) => {
                const st = phaseStatus(i);
                const Icon = phase.icon;
                return (
                  <div key={phase.key} className="flex items-center gap-4 py-2.5">
                    {/* Icon node */}
                    <div className="relative shrink-0">
                      {st === "active" && (
                        <motion.span
                          className="absolute inset-0 rounded-[13px] bg-[#4F7CFF]/30"
                          animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                      <div
                        className={`relative w-[52px] h-[52px] rounded-[13px] flex items-center justify-center border transition-colors duration-500 ${
                          st === "done"
                            ? "bg-[linear-gradient(rgba(34,197,94,0.12),rgba(34,197,94,0.12)),#0B0B0D] border-[rgba(34,197,94,0.35)]"
                            : st === "active"
                            ? "bg-[linear-gradient(to_bottom_right,rgba(79,124,255,0.22),rgba(139,92,246,0.22)),#0B0B0D] border-[rgba(79,124,255,0.5)]"
                            : "bg-[linear-gradient(rgba(255,255,255,0.03),rgba(255,255,255,0.03)),#0B0B0D] border-[rgba(255,255,255,0.06)]"
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {st === "done" ? (
                            <motion.span
                              key="done"
                              initial={{ scale: 0, rotate: -30 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <CheckCircle2 size={22} className="text-[#22C55E]" />
                            </motion.span>
                          ) : (
                            <motion.span
                              key="icon"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <Icon
                                size={20}
                                className={
                                  st === "active"
                                    ? "text-[#4F7CFF]"
                                    : "text-[#6B6B76]"
                                }
                              />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium transition-colors duration-500 ${
                          st === "pending" ? "text-[#6B6B76]" : "text-white"
                        }`}
                      >
                        {phase.label}
                      </p>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={messages[phase.key] || st}
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-xs text-[#6B6B76] mt-0.5 truncate"
                        >
                          {st === "pending"
                            ? "Queued"
                            : messages[phase.key] ||
                              (st === "active" ? "Working..." : "Done")}
                        </motion.p>
                      </AnimatePresence>
                    </div>

                    {/* Active spinner (only the active phase) */}
                    {st === "active" && (
                      <motion.div
                        className="shrink-0 w-4 h-4 rounded-full border-2 border-[#4F7CFF] border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </GlassPanel>

        {/* Actions */}
        <AnimatePresence>
          {completed && (
            <motion.div
              className="mt-8 flex justify-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transition.medium}
            >
              <motion.div
                animate={{ boxShadow: ["0 0 0px rgba(79,124,255,0)", "0 0 40px rgba(79,124,255,0.5)", "0 0 0px rgba(79,124,255,0)"] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="rounded-button"
              >
                <Button
                  size="lg"
                  onClick={() => router.push(`/brain/${params.owner}/${params.repo}`)}
                >
                  Open Engineering Brain
                  <ArrowRight size={18} />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {failed && (
            <motion.div
              className="mt-8 flex justify-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button variant="secondary" onClick={retry}>
                Retry Analysis
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
