import { useQuery } from "@tanstack/react-query";
import type { DramaDetailResponse, Episode } from "@/types/drama";

import { fetchJson } from "@/lib/fetcher";

const API_BASE = "/api/dramabox";

async function fetchDramaDetail(bookId: string): Promise<DramaDetailResponse> {
  return fetchJson<DramaDetailResponse>(`${API_BASE}/detail/${bookId}`);
}

async function fetchAllEpisodes(bookId: string): Promise<Episode[]> {
  return fetchJson<Episode[]>(`${API_BASE}/allepisode/${bookId}`);
}

export function useDramaDetail(bookId: string) {
  return useQuery({
    queryKey: ["drama", "detail", bookId],
    queryFn: () => fetchDramaDetail(bookId),
    enabled: !!bookId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useEpisodes(bookId: string) {
  return useQuery({
    queryKey: ["drama", "episodes", bookId],
    queryFn: () => fetchAllEpisodes(bookId),
    enabled: !!bookId,
    staleTime: 1000 * 60 * 5,
  });
}
