import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerUser, loginUser } from "../api/api";
import { useAuthStore } from "../store/auth";

export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      setAuth(data.accessToken, data.refreshToken);
    },
    onError: (error) => {
      console.error("Failed to register==>", error);
    },
  });
};

export const useLoginUser = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      setAuth(data.accessToken, data.refreshToken);
    },
    onError: (error) => {
      console.error("Failed to log in==>", error);
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
