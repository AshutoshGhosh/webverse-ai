"use client";

import { useEffect, useRef } from "react";

/**
 * A cursor companion: a soft glow ring that lags and settles toward the pointer
 * with damped easing, plus a snappier inner dot. Runs app-wide. Disabled on
 * touch devices and when the user prefers reduced motion. The native cursor is
 * kept for usability.
 */
export function CursorFollow() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...target };
    const dotPos = { ...target };
    let raf = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        if (ring.current) ring.current.style.opacity = "1";
        if (dot.current) dot.current.style.opacity = "1";
      }
    };
    const onLeave = () => {
      visible = false;
      if (ring.current) ring.current.style.opacity = "0";
      if (dot.current) dot.current.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    const loop = () => {
      // Snappy dot, laggy ring -> the "settle" feel.
      dotPos.x += (target.x - dotPos.x) * 0.35;
      dotPos.y += (target.y - dotPos.y) * 0.35;
      ringPos.x += (target.x - ringPos.x) * 0.12;
      ringPos.y += (target.y - ringPos.y) * 0.12;

      if (dot.current) {
        dot.current.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%, -50%)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] hidden md:block">
      <div
        ref={ring}
        className="absolute top-0 left-0 w-10 h-10 rounded-full border border-[rgba(79,124,255,0.45)] opacity-0 transition-opacity duration-300 [box-shadow:0_0_26px_rgba(79,124,255,0.28)] will-change-transform"
      />
      <div
        ref={dot}
        className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#8B5CF6] opacity-0 transition-opacity duration-300 [box-shadow:0_0_12px_rgba(139,92,246,0.85)] will-change-transform"
      />
    </div>
  );
}
