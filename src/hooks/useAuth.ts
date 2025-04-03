import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "../store/auth";

interface LoginCredentials {
  email: string;
  password: string;
}

const login = async (credentials: LoginCredentials) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_APP_BASEURL}/api/auth/login/`,
    credentials
  );
  return data;
};

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.access, data.user);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  return () => {
    logout();
    window.location.href = "/login";
  };
};
