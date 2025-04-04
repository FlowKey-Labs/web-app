import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  user: { id: number; email: string; is_staff: boolean } | null;
  setAuth: (token: string, user: AuthState["user"]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem("accessToken") || null,
  user: (() => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  })(),

  setAuth: (token, user) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ accessToken: token, user });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    set({ accessToken: null, user: null });
  },
}));
