"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Wraps content in a magnetic hover field — the element eases toward the cursor
 * and springs back on leave. Purely a transform wrapper (does not alter layout).
 * No-op when the user prefers reduced motion.
 */
export function MagneticButton({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 150, damping: 15, mass: 0.3 });

  function handleMove(e: React.MouseEvent) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: reduce ? 0 : sx, y: reduce ? 0 : sy, display: "inline-block" }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
