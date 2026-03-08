const SDRAMA_BASE = process.env.SDRAMA_API_BASE || "https://api-short.stor.co.id/api";

export interface SDramaDrama {
  id: number;
  provider_id: number;
  external_id: string;
  title: string;
  cover_url: string;
  introduction: string;
  chapter_count: number;
  play_count?: number;
  shelf_time?: string;
  is_dubbed?: boolean;
  provider_slug: string;
  provider_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface SDramaTag {
  id: number;
  name: string;
  en_name: string;
  drama_count?: number;
}

export interface SDramaSubtitle {
  lang: string;
  url: string;
}

export interface SDramaEpisode {
  id: number;
  drama_id: number;
  external_id?: string;
  episode_index: number;
  episode_name: string;
  video_url: string;
  subtitle_url?: string;
  subtitles?: SDramaSubtitle[];
  qualities?: Record<string, string>;
  status?: string;
  released_at?: string;
  created_at?: string;
}

export interface SDramaDetail {
  drama: SDramaDrama;
  tags: SDramaTag[];
  episodes: SDramaEpisode[];
}

export interface SDramaListResponse {
  data: SDramaDrama[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface SDramaDetailResponse {
  data: SDramaDetail;
}

export interface SDramaEpisodesResponse {
  data: SDramaEpisode[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export async function listDramas(params: {
  provider?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: string;
  tag?: string;
}): Promise<SDramaListResponse> {
  const qs = new URLSearchParams();
  if (params.provider) qs.set("provider", params.provider);
  if (params.page) qs.set("page", String(params.page));
  if (params.per_page) qs.set("per_page", String(params.per_page));
  if (params.sort_by) qs.set("sort_by", params.sort_by);
  if (params.sort_order) qs.set("sort_order", params.sort_order);
  if (params.tag) qs.set("tag", params.tag);

  const res = await fetch(`${SDRAMA_BASE}/dramas?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`SDrama list failed: ${res.status}`);
  return res.json();
}

export async function popularDramas(params: {
  provider?: string;
  page?: number;
  per_page?: number;
}): Promise<SDramaListResponse> {
  const qs = new URLSearchParams();
  if (params.provider) qs.set("provider", params.provider);
  if (params.page) qs.set("page", String(params.page));
  if (params.per_page) qs.set("per_page", String(params.per_page));

  const res = await fetch(`${SDRAMA_BASE}/dramas/popular?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`SDrama popular failed: ${res.status}`);
  return res.json();
}

export async function getDrama(id: string | number): Promise<SDramaDetailResponse> {
  const res = await fetch(`${SDRAMA_BASE}/dramas/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`SDrama detail failed: ${res.status}`);
  return res.json();
}

export async function getEpisodes(dramaId: string | number, params?: {
  page?: number;
  per_page?: number;
  status?: string;
}): Promise<SDramaEpisodesResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.per_page) qs.set("per_page", String(params.per_page));
  if (params?.status) qs.set("status", params.status);

  const res = await fetch(`${SDRAMA_BASE}/dramas/${dramaId}/episodes?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`SDrama episodes failed: ${res.status}`);
  return res.json();
}

export async function searchDramas(params: {
  q: string;
  provider?: string;
  page?: number;
  per_page?: number;
}): Promise<SDramaListResponse> {
  const qs = new URLSearchParams();
  qs.set("q", params.q);
  if (params.provider) qs.set("provider", params.provider);
  if (params.page) qs.set("page", String(params.page));
  if (params.per_page) qs.set("per_page", String(params.per_page));

  const res = await fetch(`${SDRAMA_BASE}/search?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`SDrama search failed: ${res.status}`);
  return res.json();
}

export function normalizeEpisodeQualities(episode: SDramaEpisode) {
  const qualities: Array<{ id: string; label: string; quality: number; url: string; isDefault: boolean; isHls: boolean }> = [];

  if (episode.qualities && Object.keys(episode.qualities).length > 0) {
    const qualityOrder: Record<string, number> = {
      "1080p": 1080, "720p": 720, "480p": 480, "360p": 360, "240p": 240,
    };
    Object.entries(episode.qualities).forEach(([key, url]) => {
      if (url) {
        const numQuality = qualityOrder[key] || parseInt(key) || 480;
        qualities.push({
          id: key,
          label: key,
          quality: numQuality,
          url,
          isDefault: key === "720p",
          isHls: url.includes(".m3u8"),
        });
      }
    });
    qualities.sort((a, b) => b.quality - a.quality);
    if (!qualities.some(q => q.isDefault) && qualities.length > 0) {
      qualities[0].isDefault = true;
    }
  }

  if (episode.video_url && qualities.length === 0) {
    qualities.push({
      id: "default",
      label: "Auto",
      quality: 480,
      url: episode.video_url,
      isDefault: true,
      isHls: episode.video_url.includes(".m3u8"),
    });
  }

  return qualities;
}

export function dramaToLegacy(drama: SDramaDrama) {
  return {
    bookId: String(drama.id),
    bookName: drama.title,
    coverWap: drama.cover_url,
    cover: drama.cover_url,
    chapterCount: drama.chapter_count,
    introduction: drama.introduction || "",
    shelfTime: drama.shelf_time || "",
    inLibrary: false,
    tagNames: [],
  };
}
