"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAnalysisStore } from "@/stores/analysis-store";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { variants, transition } from "@/lib/motion";

const Architecture3D = dynamic(
  () => import("@/components/three/architecture-3d").then((m) => m.Architecture3D),
  { ssr: false }
);

const NODE_COLORS: Record<string, string> = {
  module: "#4F7CFF",
  service: "#8B5CF6",
  database: "#22C55E",
  external: "#F59E0B",
  config: "#6B6B76",
};

export default function ArchitecturePage() {
  const { results } = useAnalysisStore();
  const architecture = results?.architecture;
  const [view, setView] = useState<"3d" | "2d">("3d");

  const initialNodes: Node[] = useMemo(() => {
    if (!architecture?.nodes) return [];
    return architecture.nodes.map((node, i) => ({
      id: node.id,
      position: {
        x: 150 + (i % 4) * 250,
        y: 100 + Math.floor(i / 4) * 180,
      },
      data: { label: node.label },
      style: {
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${NODE_COLORS[node.type] || "#4F7CFF"}40`,
        borderRadius: "14px",
        padding: "12px 20px",
        color: "white",
        fontSize: "13px",
        fontWeight: 500,
        boxShadow: `0 0 20px ${NODE_COLORS[node.type] || "#4F7CFF"}10`,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));
  }, [architecture]);

  const initialEdges: Edge[] = useMemo(() => {
    if (!architecture?.edges) return [];
    return architecture.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: edge.type === "api" || edge.type === "event",
      style: { stroke: "rgba(79,124,255,0.4)", strokeWidth: 1.5 },
      labelStyle: { fill: "#A7A7B2", fontSize: 10 },
    }));
  }, [architecture]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  if (!architecture || architecture.nodes.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-[#6B6B76] text-lg">No architecture data available</p>
          <p className="text-[#6B6B76] text-sm mt-2">Run an analysis first to generate the architecture graph</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-6">
      <motion.div
        className="mb-6 flex items-start justify-between gap-4"
        variants={variants.fadeUp}
        initial="initial"
        animate="animate"
        transition={transition.medium}
      >
        <div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
            Architecture Explorer
          </h1>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {Object.entries(NODE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-[#6B6B76] capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2D / 3D toggle */}
        <div className="flex items-center p-1 rounded-[12px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] shrink-0">
          {(["3d", "2d"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={`px-4 py-1.5 rounded-[9px] text-xs font-medium uppercase tracking-wide transition-colors ${
                view === mode
                  ? "bg-gradient-to-r from-[#4F7CFF] to-[#8B5CF6] text-white"
                  : "text-[#A7A7B2] hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </motion.div>

      <GlassPanel intensity="subtle" className="flex-1 rounded-[20px] overflow-hidden">
        {view === "3d" ? (
          <Architecture3D data={architecture} />
        ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="rgba(255,255,255,0.03)" gap={20} />
          <Controls
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
            }}
          />
          <MiniMap
            style={{
              background: "rgba(5,5,5,0.9)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
            }}
            nodeColor={() => "#4F7CFF"}
            maskColor="rgba(0,0,0,0.7)"
          />
        </ReactFlow>
        )}
      </GlassPanel>
    </div>
  );
}
