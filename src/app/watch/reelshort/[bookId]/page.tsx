"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import UniversalPlayer, { UniversalEpisode, VideoQuality } from "@/components/UniversalPlayer";
import { fetchJson } from "@/lib/fetcher";

interface VideoItem {
  url: string;
  encode: string;
  quality: number;
  bitrate: string;
}

interface EpisodeData {
  success: boolean;
  isLocked: boolean;
  videoList: VideoItem[];
}

interface DetailData {
  success: boolean;
  bookId: string;
  title: string;
  cover: string;
  totalEpisodes: number;
  introduction?: string;
}

async function fetchEpisode(bookId: string, episodeNumber: number): Promise<EpisodeData> {
  return fetchJson<EpisodeData>(`/api/reelshort/watch?bookId=${bookId}&episodeNumber=${episodeNumber}`);
}

async function fetchDetail(bookId: string): Promise<DetailData> {
  return fetchJson<DetailData>(`/api/reelshort/detail?bookId=${bookId}`);
}

export default function ReelShortWatchPage() {
  const params = useParams<{ bookId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = params.bookId;

  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [loadedEpisodes, setLoadedEpisodes] = useState<Map<number, EpisodeData>>(new Map());

  useEffect(() => {
    const ep = searchParams.get("ep");
    if (ep) {
      setCurrentEpisode(parseInt(ep) || 1);
    }
  }, [searchParams]);

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["reelshort", "detail", bookId],
    queryFn: () => fetchDetail(bookId || ""),
    enabled: !!bookId,
  });

  const { data: episodeData, isLoading: episodeLoading, error } = useQuery({
    queryKey: ["reelshort", "episode", bookId, currentEpisode],
    queryFn: () => fetchEpisode(bookId || "", currentEpisode),
    enabled: !!bookId && currentEpisode > 0,
  });

  useQuery({
    queryKey: ["reelshort", "episode", bookId, currentEpisode + 1],
    queryFn: () => fetchEpisode(bookId || "", currentEpisode + 1),
    enabled: !!bookId && currentEpisode < (detailData?.totalEpisodes || 0),
  });

  useEffect(() => {
    if (episodeData && !episodeData.isLocked) {
      setLoadedEpisodes((prev) => {
        const next = new Map(prev);
        next.set(currentEpisode, episodeData);
        return next;
      });
    }
  }, [episodeData, currentEpisode]);

  const handleEpisodeChange = (index: number) => {
    const episodeNumber = index + 1;
    setCurrentEpisode(episodeNumber);
    router.replace(`/watch/reelshort/${bookId}?ep=${episodeNumber}`, { scroll: false });
  };

  const totalEpisodes = detailData?.totalEpisodes || 1;

  const universalEpisodes: UniversalEpisode[] = useMemo(() => {
    const episodes: UniversalEpisode[] = [];
    
    for (let i = 1; i <= totalEpisodes; i++) {
      const epData = loadedEpisodes.get(i);
      
      const videoQualities: VideoQuality[] = epData?.videoList?.map((v, idx) => ({
        id: `${v.encode}-${v.quality}-${idx}`,
        label: `${v.quality === 0 ? '1080' : v.quality}p (${v.encode})`,
        quality: v.quality === 0 ? 1080 : v.quality,
        url: v.url,
        isDefault: v.encode === 'H264',
        isHls: v.url.includes('.m3u8'),
      })) || [];

      episodes.push({
        id: `ep-${i}`,
        number: i,
        videoQualities,
      });
    }
    
    return episodes;
  }, [totalEpisodes, loadedEpisodes]);

  const currentEpisodeIndex = currentEpisode - 1;
  const hasCurrentEpisodeData = loadedEpisodes.has(currentEpisode);

  if (detailLoading || (episodeLoading && !hasCurrentEpisodeData)) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-white text-lg mb-4">Failed to load video</p>
        <button
          onClick={() => router.refresh()}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (episodeData?.isLocked) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center p-4">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
        <p className="text-white text-lg font-medium mb-4">This episode is locked</p>
        <button
          onClick={() => router.push(`/detail/reelshort/${bookId}`)}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Details
        </button>
      </div>
    );
  }

  if (!hasCurrentEpisodeData || !detailData) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <UniversalPlayer
      provider="reelshort"
      bookId={bookId}
      title={detailData.title}
      description={detailData.introduction || ""}
      episodes={universalEpisodes}
      currentEpisodeIndex={currentEpisodeIndex}
      onEpisodeChange={handleEpisodeChange}
    />
  );
}
