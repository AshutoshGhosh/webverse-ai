"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { FileCode2, GitBranch, Shield } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { LogoIcon } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { variants, transition } from "@/lib/motion";
import { useAnalysisStore } from "@/stores/analysis-store";

export default function BrainOverviewPage() {
  const params = useParams<{ owner: string; repo: string }>();
  const { results } = useAnalysisStore();

  return (
    <div className="p-8">
      <motion.div
        className="max-w-[1100px] mx-auto"
        variants={variants.fadeUp}
        initial="initial"
        animate="animate"
        transition={transition.medium}
      >
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
            Engineering Brain
          </h1>
          <p className="text-[#A7A7B2] mt-1">
            {params.owner}/{params.repo}
          </p>
        </div>

        {/* Summary */}
        {results?.summary && (
          <GlassPanel intensity="medium" className="p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-[14px] bg-gradient-to-br from-[#4F7CFF]/10 to-[#8B5CF6]/10 border border-[rgba(79,124,255,0.15)]">
                <LogoIcon size={20} />
              </div>
              <div>
                <h2 className="text-sm font-medium text-white mb-1">AI Summary</h2>
                <p className="text-sm text-[#A7A7B2] leading-relaxed">{results.summary}</p>
              </div>
            </div>
          </GlassPanel>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <FileCode2 size={18} className="text-[#4F7CFF]" />
              <CardTitle className="text-base">Architecture</CardTitle>
            </div>
            <CardDescription>
              {results?.architecture?.nodes?.length || 0} modules, {results?.architecture?.layers?.length || 0} layers
            </CardDescription>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <GitBranch size={18} className="text-[#8B5CF6]" />
              <CardTitle className="text-base">Patterns</CardTitle>
            </div>
            <CardDescription>
              {results?.patterns?.length || 0} design patterns detected
            </CardDescription>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <Shield size={18} className="text-[#22C55E]" />
              <CardTitle className="text-base">Health Score</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">
                {results?.health?.overall_score || "—"}
              </span>
              <span className="text-sm text-[#6B6B76]">/ 100</span>
            </div>
          </Card>
        </div>

        {/* Insights */}
        {results?.insights && results.insights.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 font-[family-name:var(--font-space-grotesk)]">
              Key Insights
            </h2>
            <div className="space-y-3">
              {results.insights.map((insight, i) => (
                <motion.div
                  key={i}
                  variants={variants.fadeUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...transition.fast, delay: i * 0.05 }}
                >
                  <GlassPanel intensity="subtle" className="p-4 flex items-start gap-3">
                    <Badge
                      variant={
                        insight.type === "strength"
                          ? "success"
                          : insight.type === "concern"
                          ? "warning"
                          : "purple"
                      }
                    >
                      {insight.type}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-white">{insight.title}</p>
                      <p className="text-xs text-[#A7A7B2] mt-0.5">{insight.description}</p>
                    </div>
                  </GlassPanel>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
