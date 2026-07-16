import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  activePanel: "chat" | "architecture" | "health" | null;
  setSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActivePanel: (panel: UIState["activePanel"]) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  activePanel: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setActivePanel: (panel) => set({ activePanel: panel }),
}));
