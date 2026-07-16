export const SITE = {
  name: "WebVerse",
  tagline: "The AI Engineering Brain",
  description: "Transform any GitHub repository into a living engineering knowledge base.",
} as const;

export const ANALYSIS_PHASES = [
  { key: "read_repository", label: "Reading repository..." },
  { key: "detect_framework", label: "Detecting framework..." },
  { key: "find_architecture", label: "Understanding architecture..." },
  { key: "map_dependencies", label: "Mapping dependencies..." },
  { key: "analyze_health", label: "Analyzing code health..." },
  { key: "generate_brain", label: "Building Engineering Brain..." },
] as const;

export const SPRING = {
  fast: { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.6 },
  medium: { type: "spring" as const, stiffness: 260, damping: 28, mass: 0.8 },
  gentle: { type: "spring" as const, stiffness: 180, damping: 24, mass: 1.0 },
  elegant: { type: "spring" as const, stiffness: 120, damping: 20, mass: 1.2 },
} as const;
