import { create } from "zustand";
import type { UserMe } from "./api";

interface AuthState {
  user: UserMe | null;
  isLoading: boolean;
  setUser: (user: UserMe | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (v) => set({ isLoading: v }),
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null });
  },
}));
