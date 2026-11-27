import { create } from "zustand";

// UI-only state (never server data): mobile navigation drawer.
interface UiState { navOpen: boolean; setNavOpen: (o: boolean) => void }
export const useUiStore = create<UiState>((set) => ({ navOpen: false, setNavOpen: (navOpen) => set({ navOpen }) }));
