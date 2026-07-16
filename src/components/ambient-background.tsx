"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Slow-drifting aurora blobs plus faint rising particles, fixed behind the page.
 *
 * Two motion layers combine so it reads like footage playing behind the content:
 *  - Autonomous CSS drift on each blob/particle (alive even at rest).
 *  - A scroll-SCRUBBED transform on the wrapper (GSAP + Lenis): scrolling down
 *    advances the scene (pan + zoom + rotate), scrolling up reverses it — like
 *    scrubbing a video, not a hard parallax.
 *
 * All motion is transform/opacity only and disabled under prefers-reduced-motion.
 */
function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const size = 1.5 + ((i * 7) % 5) * 0.6;
        return {
          left: (i * 37.5) % 100,
          bottom: -(i % 5) * 8 - 5,
          size,
          duration: 26 + ((i * 5) % 22),
          delay: -((i * 3.3) % 30),
          opacity: 0.25 + ((i % 4) * 0.12),
        };
      }),
    []
  );

  return (
    <>
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}vh`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ["--p-opacity" as string]: p.opacity,
          }}
        />
      ))}
    </>
  );
}

export function AmbientBackground() {
  const [mounted, setMounted] = useState(false);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Scrub the whole ambient layer against page scroll — smooth + reversible.
      gsap.to(layer.current, {
        yPercent: -16,
        scale: 1.18,
        rotate: 4,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.1,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div ref={layer} className="absolute inset-0 will-change-transform">
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
        <div className="aurora-blob aurora-3" />
        {mounted && <Particles />}
      </div>
    </div>
  );
}
