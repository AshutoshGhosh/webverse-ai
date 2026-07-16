import { create } from "zustand";
import type { TimelineEvent, AnalysisResults } from "@/lib/types";

interface AnalysisState {
  status: "idle" | "running" | "completed" | "failed";
  currentPhase: string | null;
  progress: number;
  events: TimelineEvent[];
  results: AnalysisResults | null;
  error: string | null;
  setStatus: (status: AnalysisState["status"]) => void;
  setCurrentPhase: (phase: string | null) => void;
  setProgress: (progress: number) => void;
  addEvent: (event: TimelineEvent) => void;
  setResults: (results: AnalysisResults | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  status: "idle",
  currentPhase: null,
  progress: 0,
  events: [],
  results: null,
  error: null,
  setStatus: (status) => set({ status }),
  setCurrentPhase: (phase) => set({ currentPhase: phase }),
  setProgress: (progress) => set({ progress }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  setResults: (results) => set({ results }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      status: "idle",
      currentPhase: null,
      progress: 0,
      events: [],
      results: null,
      error: null,
    }),
}));
