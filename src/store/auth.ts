import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  user: { id: number; email: string; is_staff: boolean } | null;
  setAuth: (
    token: string,
    refreshToken: string,
    user: AuthState["user"]
  ) => void;
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

  setAuth: (token, refreshToken, user) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refresh", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    set({ accessToken: token, user });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    set({ accessToken: null, user: null });
  },
}));
