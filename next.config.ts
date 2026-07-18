import type { NextConfig } from "next";

// Baseline security headers applied to every route. A strict CSP is intentionally
// omitted here because the app uses inline styles / dynamic sources; add one once
// nonce-based styling is in place.
const securityHeaders = [
  // SAMEORIGIN (not DENY) so the /deck route can embed the self-contained
  // pitch deck (public/pitch-deck.html) in a same-origin iframe, while still
  // blocking framing by other sites (clickjacking protection).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Serve the self-contained pitch deck (public/pitch-deck.html) directly at the
  // clean /deck URL — no iframe, so no X-Frame-Options / framing issues.
  async rewrites() {
    return [{ source: "/deck", destination: "/pitch-deck.html" }];
  },
};

export default nextConfig;
