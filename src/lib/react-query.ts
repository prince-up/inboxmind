import { QueryClient } from '@tanstack/react-query';

/**
 * Shared query client with conservative extension-safe defaults.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      gcTime: 5 * 60 * 1000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
});
