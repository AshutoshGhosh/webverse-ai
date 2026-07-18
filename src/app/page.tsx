"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { Sparkles, Network, Shield, MessageSquare } from "lucide-react";
import { LogoIcon } from "@/components/logo";

function GithubIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { variants, transition } from "@/lib/motion";
import { AmbientBackground } from "@/components/ambient-background";
import { MagneticButton } from "@/components/magnetic-button";
import { SpotlightCard } from "@/components/spotlight-card";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Analysis",
    description: "GPT-4o analyzes your entire codebase structure, patterns, and health in seconds.",
  },
  {
    icon: Network,
    title: "Architecture Visualization",
    description: "Interactive dependency graphs that reveal how your system actually connects.",
  },
  {
    icon: MessageSquare,
    title: "Engineering Brain Chat",
    description: "Ask anything about your codebase and get contextual, accurate answers.",
  },
  {
    icon: Shield,
    title: "Health Reports",
    description: "Comprehensive quality scoring across testing, security, patterns, and more.",
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set([".hero-gradient", ".hero-title span", ".hero-subtitle", ".hero-cta"], {
          clearProps: "all",
        });
        return;
      }

      // Cinematic intro — slow, elegant, staggered.
      gsap.fromTo(
        ".hero-gradient",
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 2.4, ease: "power3.out" }
      );
      gsap.fromTo(
        ".hero-title span",
        { opacity: 0, y: 44, filter: "blur(12px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.3, stagger: 0.14, ease: "power3.out", delay: 0.3 }
      );
      gsap.fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", delay: 0.95 }
      );
      gsap.fromTo(
        ".hero-cta",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", delay: 1.2 }
      );

      // Scroll story: as the hero leaves, it gently recedes (scale + fade + blur).
      gsap.to(".hero-content", {
        y: -90,
        scale: 0.94,
        opacity: 0.12,
        filter: "blur(6px)",
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, heroRef);

    // Settle mouse parallax (horizontal only, so it never fights the scroll scrub).
    let cleanupMouse = () => {};
    if (!reduce) {
      const titleX = gsap.quickTo(".hero-title", "x", { duration: 0.9, ease: "power3.out" });
      const subX = gsap.quickTo(".hero-subtitle", "x", { duration: 0.9, ease: "power3.out" });
      const onMove = (e: MouseEvent) => {
        const cx = e.clientX / window.innerWidth - 0.5;
        titleX(cx * 18);
        subX(cx * 11);
      };
      window.addEventListener("mousemove", onMove);
      cleanupMouse = () => window.removeEventListener("mousemove", onMove);
    }

    return () => {
      ctx.revert();
      cleanupMouse();
    };
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Slow-drifting aurora + particles behind everything */}
      <AmbientBackground />

      <div className="relative z-10">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6">
        {/* Background Gradient */}
        <div className="hero-gradient absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(79,124,255,0.08)_0%,rgba(139,92,246,0.04)_40%,transparent_70%)]" />
          <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(79,124,255,0.05)_0%,transparent_60%)] animate-pulse" />
          <div className="absolute bottom-[20%] right-[15%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.05)_0%,transparent_60%)] animate-pulse" />
        </div>

        <div className="hero-content relative z-10 text-center max-w-[900px]">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(79,124,255,0.2)] bg-[rgba(79,124,255,0.05)] mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...transition.medium }}
          >
            <LogoIcon size={16} />
            <span className="text-xs text-[#4F7CFF] font-medium">AI Engineering Intelligence</span>
          </motion.div>

          {/* Title */}
          <h1 className="hero-title text-5xl md:text-7xl font-bold text-white font-[family-name:var(--font-space-grotesk)] leading-[1.1] mb-6">
            <span className="inline-block">Transform </span>
            <span className="inline-block">repositories </span>
            <span className="inline-block bg-gradient-to-r from-[#4F7CFF] to-[#8B5CF6] bg-clip-text text-transparent">into intelligence</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle text-lg md:text-xl text-[#A7A7B2] max-w-[600px] mx-auto mb-10 leading-relaxed">
            WebVerse turns any GitHub repository into a living engineering knowledge base. Understand architecture, assess health, and chat with your code.
          </p>

          {/* CTA */}
          <div className="hero-cta flex items-center justify-center gap-4">
            <MagneticButton>
              <Button size="xl" onClick={() => { window.location.href = "/auth/login"; }}>
                <GithubIcon size={18} />
                Connect with GitHub
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button variant="secondary" size="xl" onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Learn more
              </Button>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={variants.fadeUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={transition.medium}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-space-grotesk)] mb-4">
              Everything your engineering brain needs
            </h2>
            <p className="text-[#A7A7B2] max-w-[500px] mx-auto">
              From high-level architecture to granular code patterns, get instant understanding of any codebase.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={variants.fadeUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                transition={{ ...transition.fast, delay: i * 0.1 }}
              >
                <SpotlightCard>
                  <Card className="p-7 h-full">
                    <div className="p-2.5 rounded-[14px] bg-gradient-to-br from-[#4F7CFF]/10 to-[#8B5CF6]/10 border border-[rgba(79,124,255,0.15)] w-fit mb-4 transition-transform duration-500 ease-out group-hover/spot:scale-110 group-hover/spot:-translate-y-0.5">
                      <feature.icon size={20} className="text-[#4F7CFF]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 font-[family-name:var(--font-space-grotesk)]">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#A7A7B2] leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <motion.div
          className="max-w-[700px] mx-auto text-center"
          variants={variants.fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={transition.medium}
        >
          <GlassPanel intensity="medium" className="p-12">
            <LogoIcon size={40} className="mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-space-grotesk)] mb-4">
              Ready to understand your codebase?
            </h2>
            <p className="text-[#A7A7B2] mb-8">
              Connect your GitHub account and get instant engineering intelligence.
            </p>
            <MagneticButton>
              <Button size="lg" onClick={() => { window.location.href = "/auth/login"; }}>
                <GithubIcon size={18} />
                Get Started Free
              </Button>
            </MagneticButton>
          </GlassPanel>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] py-8 px-6">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoIcon size={20} />
            <span className="text-sm font-semibold text-white font-[family-name:var(--font-space-grotesk)]">WebVerse</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/deck"
              className="text-xs text-[#6B6B76] hover:text-[#A7A7B2] transition-colors"
            >
              Pitch Deck
            </a>
            <span className="text-[#3A3A42]">·</span>
            <p className="text-xs text-[#6B6B76]">Built with AI. For engineers, by an engineer.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
