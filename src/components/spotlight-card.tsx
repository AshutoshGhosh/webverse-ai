"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Adds a cursor-following radial highlight and an animated gradient border that
 * appear on hover. Wraps a card without changing its layout — the highlight and
 * border are absolutely-positioned overlay layers.
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn("group/spot relative h-full rounded-[24px]", className)}
    >
      {/* Animated gradient border (fades in on hover) */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[25px] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            "linear-gradient(130deg, rgba(79,124,255,0.6), rgba(139,92,246,0.5), rgba(34,211,238,0.4))",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
        }}
      />
      {/* Cursor-following glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--mx) var(--my), rgba(79,124,255,0.14), transparent 60%)",
        }}
      />
      {children}
    </div>
  );
}
