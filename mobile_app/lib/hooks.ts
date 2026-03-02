import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  HomeResponse,
  TrendingResponse,
  RanksResponse,
  SearchSuggestResponse,
  DetailsResponse,
  MediaInfoResponse,
} from '@/lib/types';
import { SubjectType } from '@/lib/types';

export const queryKeys = {
  home: ['home'] as const,
  trending: (page?: number, perPage?: number) =>
    (page !== undefined
      ? ['trending', page, perPage]
      : ['trending']) as readonly ['trending', number?, number?],
  ranks: ['ranks'] as const,
  search: (q: string, type?: number, page?: number) =>
    ['search', q, type ?? SubjectType.All, page] as const,
  searchSuggest: (q: string) => ['search', 'suggest', q] as const,
  popularSearches: ['popular-searches'] as const,
  details: (url: string, isSeries: boolean) =>
    ['details', url, isSeries] as const,
  recommendations: (url: string, isSeries: boolean, page?: number) =>
    ['recommendations', url, isSeries, page] as const,
  mediaInfo: (
    url: string,
    isSeries: boolean,
    season?: number,
    episode?: number
  ) => ['media-info', url, isSeries, season, episode] as const,
};

// --- Discovery & Home ---

export function useHome() {
  return useQuery({
    queryKey: queryKeys.home,
    queryFn: async (): Promise<HomeResponse> => {
      const { data } = await api.get<HomeResponse>('/home');
      return data;
    },
  });
}

export function useTrending(page = 0, perPage = 18) {
  return useQuery({
    queryKey: queryKeys.trending(page, perPage),
    queryFn: async (): Promise<TrendingResponse> => {
      const { data } = await api.get<TrendingResponse>('/trending', {
        params: { page, per_page: perPage },
      });
      return data;
    },
  });
}

export function useRanks() {
  return useQuery({
    queryKey: queryKeys.ranks,
    queryFn: async (): Promise<RanksResponse> => {
      const { data } = await api.get<RanksResponse>('/ranks');
      return data;
    },
  });
}

// --- Search ---

export function useSearch(
  q: string,
  options?: { type?: number; page?: number; enabled?: boolean }
) {
  const { type = SubjectType.All, page = 1, enabled = true } = options ?? {};
  return useQuery({
    queryKey: queryKeys.search(q, type, page),
    queryFn: async () => {
      const { data } = await api.get<TrendingResponse>('/search', {
        params: { q, type, page },
      });
      return data;
    },
    enabled: enabled && q.length > 0,
  });
}

export function useSearchSuggest(q: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.searchSuggest(q),
    queryFn: async (): Promise<SearchSuggestResponse> => {
      const { data } = await api.get<SearchSuggestResponse>('/search/suggest', {
        params: { q },
      });
      return data;
    },
    enabled: enabled && q.length > 0,
  });
}

export function usePopularSearches() {
  return useQuery({
    queryKey: queryKeys.popularSearches,
    queryFn: async () => {
      const { data } = await api.get<{ title: string }[]>('/popular-searches');
      return data;
    },
  });
}

// --- Details & Related ---

export function useDetails(url: string, isSeries: boolean, enabled = true) {
  return useQuery({
    queryKey: queryKeys.details(url, isSeries),
    queryFn: async (): Promise<DetailsResponse> => {
      const { data } = await api.get<DetailsResponse>('/details', {
        params: { url, is_series: isSeries },
      });
      return data;
    },
    enabled: enabled && url.length > 0,
  });
}

export function useRecommendations(
  url: string,
  isSeries: boolean,
  page = 1,
  enabled = true
) {
  return useQuery({
    queryKey: queryKeys.recommendations(url, isSeries, page),
    queryFn: async () => {
      const { data } = await api.get<TrendingResponse>('/recommendations', {
        params: { url, is_series: isSeries, page },
      });
      return data;
    },
    enabled: enabled && url.length > 0,
  });
}

// --- Stream metadata ---

export function useMediaInfo(
  url: string,
  isSeries: boolean,
  options?: { season?: number; episode?: number; enabled?: boolean }
) {
  const {
    season = 1,
    episode = 1,
    enabled = true,
  } = options ?? {};
  return useQuery({
    queryKey: queryKeys.mediaInfo(url, isSeries, season, episode),
    queryFn: async (): Promise<MediaInfoResponse> => {
      const { data } = await api.get<MediaInfoResponse>('/media-info', {
        params: {
          url,
          is_series: isSeries,
          season,
          episode,
        },
      });
      return data;
    },
    enabled: enabled && url.length > 0,
  });
}
