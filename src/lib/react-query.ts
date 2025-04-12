import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes before refetching
      //   cacheTime: 10 * 60 * 1000, // 10 minutes before garbage collection
      refetchOnWindowFocus: false, // Avoid unnecessary refetching when switching tabs
    },
  },
});
