import { create } from "zustand";

export interface Role {
  id: string;
  name: string;
  description: string;
  can_view_staff: boolean;
  can_create_staff: boolean;
  can_edit_staff: boolean;
  can_view_clients: boolean;
  can_create_clients: boolean;
  can_edit_clients: boolean;
  can_view_sessions: boolean;
  can_create_sessions: boolean;
  can_edit_sessions: boolean;
  can_manage_attendance: boolean;
  can_manage_profile: boolean;
  can_manage_settings: boolean;
  can_view_calendar: boolean;
  business: string;
}

interface AuthState {
  accessToken: string | null;
  user: { id: number; email: string; is_staff: boolean; role: Role } | null;
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
