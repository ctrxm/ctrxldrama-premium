"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, X } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import TikTokPlayer from "@/components/TikTokPlayer";
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

interface Episode {
  episodeNumber: number;
  videoList: VideoItem[];
  isLocked: boolean;
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
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [loadedEpisodes, setLoadedEpisodes] = useState<Episode[]>([]);

  // Get episode from URL
  useEffect(() => {
    const ep = searchParams.get("ep");
    if (ep) {
      setCurrentEpisode(parseInt(ep) || 1);
    }
  }, [searchParams]);

  // Fetch detail for title and episode count
  const { data: detailData } = useQuery({
    queryKey: ["reelshort", "detail", bookId],
    queryFn: () => fetchDetail(bookId || ""),
    enabled: !!bookId,
  });

  // Fetch current episode
  const { data: episodeData, isLoading, error } = useQuery({
    queryKey: ["reelshort", "episode", bookId, currentEpisode],
    queryFn: () => fetchEpisode(bookId || "", currentEpisode),
    enabled: !!bookId && currentEpisode > 0,
  });

  // Preload next episode
  useQuery({
    queryKey: ["reelshort", "episode", bookId, currentEpisode + 1],
    queryFn: () => fetchEpisode(bookId || "", currentEpisode + 1),
    enabled: !!bookId && currentEpisode < (detailData?.totalEpisodes || 0),
  });

  // Update loaded episodes when episode data changes
  useEffect(() => {
    if (episodeData && !episodeData.isLocked) {
      setLoadedEpisodes((prev) => {
        const exists = prev.find((ep) => ep.episodeNumber === currentEpisode);
        if (exists) return prev;
        return [
          ...prev,
          {
            episodeNumber: currentEpisode,
            videoList: episodeData.videoList,
            isLocked: episodeData.isLocked,
          },
        ];
      });
    }
  }, [episodeData, currentEpisode]);

  const handleEpisodeChange = (episode: number) => {
    setCurrentEpisode(episode);
    router.replace(`/watch/reelshort/${bookId}?ep=${episode}`, { scroll: false });
  };

  const goToEpisode = (ep: number) => {
    setCurrentEpisode(ep);
    router.replace(`/watch/reelshort/${bookId}?ep=${ep}`, { scroll: false });
    setShowEpisodeList(false);
  };

  const totalEpisodes = detailData?.totalEpisodes || 1;

  // Loading state
  if (isLoading && loadedEpisodes.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Error state
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

  // Locked episode state
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

  return (
    <>
      {/* TikTok-Style Player */}
      {loadedEpisodes.length > 0 && detailData && (
        <TikTokPlayer
          bookId={bookId}
          initialEpisode={currentEpisode}
          totalEpisodes={totalEpisodes}
          title={detailData.title}
          description={detailData.introduction || ""}
          episodes={loadedEpisodes}
          onEpisodeChange={handleEpisodeChange}
          onShowEpisodeList={() => setShowEpisodeList(true)}
        />
      )}

      {/* Episode List Modal */}
      {showEpisodeList && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-card w-full sm:max-w-2xl sm:rounded-t-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-bold">Episodes</h3>
              <button
                onClick={() => setShowEpisodeList(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Episode Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((ep) => (
                  <button
                    key={ep}
                    onClick={() => goToEpisode(ep)}
                    className={`
                      aspect-square rounded-lg font-semibold text-sm transition-all
                      ${
                        ep === currentEpisode
                          ? "bg-primary text-white"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }
                    `}
                  >
                    {ep}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
