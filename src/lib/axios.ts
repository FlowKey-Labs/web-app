import axios from "axios";
import { useAuthStore } from "../store/auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_BASEURL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  console.log("token==>", token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
