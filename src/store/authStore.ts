import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { uid } from "@/lib/utils";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, _password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, _password: string) => Promise<void>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email) => {
        await delay(700);
        set({
          user: { id: uid("user"), name: email.split("@")[0], email, plan: "gratuito" },
          isAuthenticated: true,
        });
      },
      loginWithGoogle: async () => {
        await delay(700);
        set({
          user: { id: uid("user"), name: "Você", email: "voce@gmail.com", plan: "gratuito" },
          isAuthenticated: true,
        });
      },
      register: async (name, email) => {
        await delay(800);
        set({
          user: { id: uid("user"), name, email, plan: "gratuito" },
          isAuthenticated: true,
        });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
    }),
    { name: "hype-auth" }
  )
);

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
