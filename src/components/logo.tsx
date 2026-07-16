import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Standalone brand icon (the neon brain-network mark). Use this anywhere a plain
 * icon is needed instead of the lucide `Brain` glyph, to keep branding consistent.
 */
export function LogoIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo-mark.png"
      alt="WebVerse"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-[calc(0.28*1em)]", className)}
      style={{ borderRadius: Math.max(4, Math.round(size * 0.26)) }}
    />
  );
}

/**
 * WebVerse brand lockup — the neon brain-network icon paired with the
 * "WebVerse / The AI Engineering Brain" wordmark. Always links home.
 * `compact` renders the icon only (e.g. collapsed sidebar).
 */
export function Logo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="WebVerse — The AI Engineering Brain, go to home"
      className={cn("group flex items-center gap-3 cursor-pointer select-none", className)}
    >
      <Image
        src="/logo-mark.png"
        alt="WebVerse"
        width={40}
        height={40}
        priority
        className="rounded-[11px] shrink-0 shadow-[0_0_20px_rgba(79,124,255,0.25)] transition-transform duration-300 group-hover:scale-105"
      />

      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[18px] font-bold tracking-tight font-[family-name:var(--font-space-grotesk)] bg-gradient-to-r from-[#4F7CFF] via-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(139,92,246,0.45)]">
            WebVerse
          </span>
          <span className="mt-1 text-[10.5px] tracking-[0.04em] text-[#8FA6E0] drop-shadow-[0_0_8px_rgba(79,124,255,0.3)]">
            The AI Engineering Brain
          </span>
        </span>
      )}
    </Link>
  );
}
