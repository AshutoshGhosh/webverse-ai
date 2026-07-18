"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { ArchitectureData, ArchitectureNode } from "@/lib/types";

const NODE_COLORS: Record<ArchitectureNode["type"], string> = {
  module: "#4F7CFF",
  service: "#8B5CF6",
  database: "#22C55E",
  external: "#F59E0B",
  config: "#6B6B76",
};

interface LayerRing {
  name: string;
  y: number;
  radius: number;
}

/** Stack nodes into layered rings — each architecture layer is a ring along the Y axis. */
function useLayout(data: ArchitectureData): {
  positions: Map<string, THREE.Vector3>;
  rings: LayerRing[];
} {
  return useMemo(() => {
    const positions = new Map<string, THREE.Vector3>();
    const rings: LayerRing[] = [];

    const byLayer = new Map<string, ArchitectureNode[]>();
    for (const node of data.nodes) {
      const key = node.layer || "default";
      if (!byLayer.has(key)) byLayer.set(key, []);
      byLayer.get(key)!.push(node);
    }

    const ordered =
      data.layers && data.layers.length
        ? data.layers.filter((l) => byLayer.has(l))
        : [];
    for (const key of byLayer.keys()) {
      if (!ordered.includes(key)) ordered.push(key);
    }

    const gapY = 3.4;
    const totalH = Math.max(0, (ordered.length - 1) * gapY);

    ordered.forEach((layer, li) => {
      const arr = byLayer.get(layer)!;
      const y = totalH / 2 - li * gapY;
      const radius = Math.max(2.4, arr.length * 0.6);
      rings.push({ name: layer, y, radius });
      arr.forEach((node, ni) => {
        const angle = (ni / arr.length) * Math.PI * 2;
        positions.set(
          node.id,
          new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
        );
      });
    });

    return { positions, rings };
  }, [data]);
}

/** Reads the user's OS "reduce motion" preference so we can disable auto-rotation. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function GraphNode({
  node,
  position,
  hovered,
  isConnected,
  onHover,
}: {
  node: ArchitectureNode;
  position: THREE.Vector3;
  hovered: string | null;
  isConnected: boolean;
  onHover: (id: string | null) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const color = NODE_COLORS[node.type] || "#4F7CFF";
  const size = THREE.MathUtils.clamp((node.size || 1) * 0.16 + 0.24, 0.24, 0.62);

  const active = hovered === node.id;
  const dimmed = hovered !== null && !active && !isConnected;

  useFrame(() => {
    if (!ref.current) return;
    const target = active ? 1.45 : 1;
    ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
  });

  return (
    <group position={position}>
      <mesh
        ref={ref}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 1.8 : 0.55}
          roughness={0.35}
          metalness={0.2}
          transparent
          opacity={dimmed ? 0.25 : 1}
        />
      </mesh>

      <Html center distanceFactor={11} style={{ pointerEvents: "none" }} zIndexRange={[10, 0]}>
        <div
          className="whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium transition-opacity"
          style={{
            transform: `translateY(${size * 32 + 10}px)`,
            color: active ? "#FFFFFF" : "#A7A7B2",
            background: active ? "rgba(255,255,255,0.06)" : "transparent",
            opacity: dimmed ? 0.3 : 1,
          }}
        >
          {node.label}
        </div>
      </Html>
    </group>
  );
}

function Edges({
  data,
  positions,
  hovered,
}: {
  data: ArchitectureData;
  positions: Map<string, THREE.Vector3>;
  hovered: string | null;
}) {
  const edges = useMemo(
    () =>
      data.edges
        .map((edge) => {
          const a = positions.get(edge.source);
          const b = positions.get(edge.target);
          if (!a || !b) return null;
          return { edge, a, b };
        })
        .filter(Boolean) as {
        edge: ArchitectureData["edges"][number];
        a: THREE.Vector3;
        b: THREE.Vector3;
      }[],
    [data, positions]
  );

  return (
    <>
      {edges.map(({ edge, a, b }) => {
        const touchesHover =
          hovered !== null && (edge.source === hovered || edge.target === hovered);
        const active = edge.type === "api" || edge.type === "event";
        const color = touchesHover ? "#22D3EE" : active ? "#8B5CF6" : "#4F7CFF";
        const opacity = hovered === null ? 0.28 : touchesHover ? 0.85 : 0.06;

        return (
          <Line
            key={edge.id}
            points={[
              [a.x, a.y, a.z],
              [b.x, b.y, b.z],
            ]}
            color={color}
            lineWidth={touchesHover ? 1.8 : 1}
            transparent
            opacity={opacity}
          />
        );
      })}
    </>
  );
}

function Scene({ data }: { data: ArchitectureData }) {
  const { positions, rings } = useLayout(data);
  const [hovered, setHovered] = useState<string | null>(null);

  // Auto-rotate for the "hero" feel, but stop the moment the user grabs the
  // scene (so it doesn't fight their drag), and never rotate if the user has
  // asked the OS to reduce motion.
  const prefersReducedMotion = usePrefersReducedMotion();
  const [userInteracted, setUserInteracted] = useState(false);
  const autoRotate = !prefersReducedMotion && !userInteracted;

  const connectedIds = useMemo(() => {
    if (!hovered) return new Set<string>();
    const set = new Set<string>();
    for (const edge of data.edges) {
      if (edge.source === hovered) set.add(edge.target);
      if (edge.target === hovered) set.add(edge.source);
    }
    return set;
  }, [hovered, data]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={40} />
      <pointLight position={[-10, -10, -10]} intensity={20} color="#8B5CF6" />

      <Edges data={data} positions={positions} hovered={hovered} />

      {/* Layer labels — a dim mono tag anchored beside each ring so the
          "layered architecture" reads clearly in 3D. */}
      {rings.map((ring) => (
        <Html
          key={ring.name}
          position={[-(ring.radius + 1.4), ring.y, 0]}
          center
          distanceFactor={13}
          style={{ pointerEvents: "none" }}
          zIndexRange={[5, 0]}
        >
          <div className="whitespace-nowrap font-[family-name:var(--font-jetbrains-mono),monospace] text-[10px] uppercase tracking-[0.22em] text-[#6B6B76]">
            {ring.name}
          </div>
        </Html>
      ))}

      {data.nodes.map((node) => {
        const pos = positions.get(node.id);
        if (!pos) return null;
        return (
          <GraphNode
            key={node.id}
            node={node}
            position={pos}
            hovered={hovered}
            isConnected={connectedIds.has(node.id)}
            onHover={setHovered}
          />
        );
      })}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
        minDistance={4}
        maxDistance={40}
        onStart={() => setUserInteracted(true)}
      />

      <EffectComposer>
        <Bloom
          intensity={0.7}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export function Architecture3D({ data }: { data: ArchitectureData }) {
  return (
    <Canvas
      camera={{ position: [0, 4, 16], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene data={data} />
    </Canvas>
  );
}

export default Architecture3D;
