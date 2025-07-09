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
  can_view_audit_logs: boolean;
  can_view_bookings: boolean;
  can_manage_bookings: boolean;
  // Staff management permissions
  can_manage_staff_services?: boolean;
  can_manage_staff_locations?: boolean;
  can_manage_all_exceptions?: boolean;
  can_view_staff_exceptions?: boolean;
  
  // Staff portal access permissions
  can_access_staff_portal?: boolean;
  can_create_own_exceptions?: boolean;
  can_edit_own_exceptions?: boolean;
  can_view_business_staff_exceptions?: boolean;
  can_manage_exception_settings?: boolean;
  business: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: number; email: string; is_staff: boolean; role: Role } | null;
  role: Role | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  setAuth: (
    token: string,
    refreshToken: string,
    user: AuthState["user"]
  ) => void;
  setRole: (role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refresh") || null,
  user: (() => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      return null;
    }
  })(),
  role: (() => {
    try {
      const role = localStorage.getItem("role");
      return role ? JSON.parse(role) : null;
    } catch (e) {
      console.error("Failed to parse role from localStorage", e);
      return null;
    }
  })(),
  isInitialized: true,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  setRole: (role) => {
    console.log('🔧 AuthStore: Setting role in store and localStorage:', role);
    localStorage.setItem("role", JSON.stringify(role));
    set({ role });
  },
  setAuth: (token, refreshToken, user) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refresh", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    // Also set role if it's included in user data
    if (user?.role) {
      localStorage.setItem("role", JSON.stringify(user.role));
      set({ accessToken: token, refreshToken, user, role: user.role, isAuthenticated: true });
    } else {
      set({ accessToken: token, refreshToken, user, isAuthenticated: true });
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    set({ accessToken: null, refreshToken: null, user: null, role: null, isAuthenticated: false });
  },
}));
