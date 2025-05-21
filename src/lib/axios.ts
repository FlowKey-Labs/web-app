import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { END_POINTS } from "../api/api";
import { useAuthStore } from "../store/auth";

type ErrorResponse = {
  code: string;
  detail: string;
  messages?: { token_class: "access" | "refresh" }[];
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_BASEURL,
});

let isRefreshing = false;
let failedRequests: Array<() => void> = [];

const handleLogout = () => {
  const logout = useAuthStore.getState().logout;
  logout();
  window.location.href = "/login";
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        (error.response.data as ErrorResponse)?.code === "token_not_valid" &&
        error?.config?.url?.includes("refresh")
      ) {
        handleLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          failedRequests.push(() => {
            originalRequest._retry = true;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh = localStorage.getItem("refresh");

        if (!refresh) {
          handleLogout();
          return Promise.reject(error);
        }

        const response = await axios.post(END_POINTS.AUTH.REFRESH, { refresh });
        const newToken = response.data.access;

        const user = useAuthStore.getState().user;
        if (user) {
          useAuthStore.getState().setAuth(
            newToken,
            response.data.refresh,
            user
          );
        } else {
          localStorage.setItem("accessToken", newToken);
          localStorage.setItem("refresh", response.data.refresh);
        }

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };

        failedRequests.forEach((cb) => cb());
        failedRequests = [];
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {

        failedRequests.forEach((cb) => cb());
        failedRequests = [];
        isRefreshing = false;

        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
