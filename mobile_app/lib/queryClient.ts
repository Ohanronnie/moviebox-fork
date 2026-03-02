import { QueryClient } from '@tanstack/react-query';

/**
 * Default cache times (ms). Data is mostly static so we cache aggressively.
 * - staleTime: consider data fresh for this long (no refetch)
 * - gcTime (garbage collection): keep unused data in cache for this long
 */
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ONE_HOUR,
      gcTime: ONE_DAY,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
