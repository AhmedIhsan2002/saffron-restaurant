import { create } from "zustand";
import type { PublicSettings } from "../../types/settings";

interface SettingsState {
  settings: PublicSettings | null;
  loaded: boolean;
  setSettings: (s: PublicSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loaded: false,
  setSettings: (s) => set({ settings: s, loaded: true }),
}));