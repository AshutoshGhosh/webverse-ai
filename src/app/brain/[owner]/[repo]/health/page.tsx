"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle, Info, XCircle } from "lucide-react";
import { useAnalysisStore } from "@/stores/analysis-store";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { variants, transition } from "@/lib/motion";

export default function HealthPage() {
  const { results } = useAnalysisStore();
  const health = results?.health;

  if (!health) {
    return (
      <div className="h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-[#6B6B76] text-lg">No health data available</p>
          <p className="text-[#6B6B76] text-sm mt-2">Run an analysis first to generate health metrics</p>
        </div>
      </div>
    );
  }

  const scoreColor =
    health.overall_score >= 80 ? "#22C55E" : health.overall_score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div className="p-8">
      <motion.div
        className="max-w-[900px] mx-auto"
        variants={variants.fadeUp}
        initial="initial"
        animate="animate"
        transition={transition.medium}
      >
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
            Engineering Health Report
          </h1>
          <p className="text-sm text-[#A7A7B2] mt-1">
            Comprehensive quality assessment
          </p>
        </div>

        {/* Overall Score */}
        <GlassPanel intensity="medium" className="p-8 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 mb-4" style={{ borderColor: scoreColor }}>
            <div>
              <span className="text-4xl font-bold text-white">{health.overall_score}</span>
              <span className="text-sm text-[#6B6B76] block">/100</span>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-white">
            {health.overall_score >= 80 ? "Excellent" : health.overall_score >= 60 ? "Good" : "Needs Improvement"}
          </h2>
          <p className="text-sm text-[#A7A7B2] mt-1">Overall Engineering Health</p>
        </GlassPanel>

        {/* Categories */}
        <div className="space-y-6">
          {health.categories.map((category, i) => (
            <motion.div
              key={category.name}
              variants={variants.fadeUp}
              initial="initial"
              animate="animate"
              transition={{ ...transition.fast, delay: i * 0.08 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-[#4F7CFF]" />
                    <CardTitle className="text-base">{category.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{category.score}</span>
                    <span className="text-xs text-[#6B6B76]">/ {category.max_score}</span>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="h-2 rounded-full bg-[rgba(255,255,255,0.04)] mb-4 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: category.score / category.max_score >= 0.8 ? "#22C55E" : category.score / category.max_score >= 0.6 ? "#F59E0B" : "#EF4444",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(category.score / category.max_score) * 100}%` }}
                    transition={{ ...transition.medium, delay: i * 0.1 }}
                  />
                </div>

                {/* Findings */}
                {category.findings.length > 0 && (
                  <div className="space-y-2">
                    {category.findings.map((finding, j) => (
                      <div
                        key={j}
                        className="flex items-start gap-2 px-3 py-2 rounded-[10px] bg-[rgba(255,255,255,0.02)]"
                      >
                        {finding.severity === "critical" ? (
                          <XCircle size={14} className="text-[#EF4444] mt-0.5 shrink-0" />
                        ) : finding.severity === "warning" ? (
                          <AlertTriangle size={14} className="text-[#F59E0B] mt-0.5 shrink-0" />
                        ) : (
                          <Info size={14} className="text-[#4F7CFF] mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="text-sm text-white">{finding.title}</p>
                          <p className="text-xs text-[#6B6B76] mt-0.5">{finding.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
