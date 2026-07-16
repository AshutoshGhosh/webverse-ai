export interface Repository {
  id: string;
  github_id: number;
  owner: string;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  default_branch: string;
  is_private: boolean;
  avatar_url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: string;
  repository_id: string;
  user_id: string;
  status: AnalysisStatus;
  current_phase: string | null;
  progress: number;
  results: AnalysisResults | null;
  error: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export type AnalysisStatus = "queued" | "running" | "completed" | "failed";

export interface AnalysisResults {
  summary: string;
  architecture: ArchitectureData;
  health: HealthData;
  patterns: Pattern[];
  dependencies: Dependency[];
  insights: Insight[];
  files?: { path: string; excerpt: string }[];
}

export interface ArchitectureData {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  layers: string[];
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: "module" | "service" | "database" | "external" | "config";
  layer: string;
  size: number;
  metadata?: Record<string, string>;
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: "import" | "api" | "data" | "event";
}

export interface HealthData {
  overall_score: number;
  categories: HealthCategory[];
}

export interface HealthCategory {
  name: string;
  score: number;
  max_score: number;
  findings: HealthFinding[];
}

export interface HealthFinding {
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  file?: string;
  line?: number;
}

export interface Pattern {
  name: string;
  description: string;
  occurrences: number;
  files: string[];
}

export interface Dependency {
  name: string;
  version: string;
  type: "production" | "development";
  outdated: boolean;
  latest_version?: string;
}

export interface Insight {
  type: "strength" | "concern" | "suggestion";
  title: string;
  description: string;
  priority: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: ChatSource[];
}

export interface ChatSource {
  file: string;
  line_start: number;
  line_end: number;
  snippet: string;
}

export interface TimelineEvent {
  id: string;
  phase: string;
  message: string;
  timestamp: string;
  type: "start" | "progress" | "insight" | "complete" | "error";
  data?: Record<string, unknown>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  github_username: string;
}
