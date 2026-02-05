"use client";

import { useState, useEffect, useMemo } from "react";
import { useNetShortDetail } from "@/hooks/useNetShort";
import { Loader2, AlertCircle } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import UniversalPlayer, { UniversalEpisode, VideoQuality } from "@/components/UniversalPlayer";

export default function NetShortWatchPage() {
  const params = useParams<{ shortPlayId: string }>();
  const searchParams = useSearchParams();
  const shortPlayId = params.shortPlayId;
  const router = useRouter();
  
  const [currentEpisode, setCurrentEpisode] = useState(1);

  useEffect(() => {
    const ep = searchParams.get("ep");
    if (ep) {
      setCurrentEpisode(parseInt(ep) || 1);
    }
  }, [searchParams]);

  const { data, isLoading, error } = useNetShortDetail(shortPlayId || "");

  const handleEpisodeChange = (index: number) => {
    const episodeNumber = index + 1;
    setCurrentEpisode(episodeNumber);
    window.history.replaceState(null, '', `/watch/netshort/${shortPlayId}?ep=${episodeNumber}`);
  };

  const totalEpisodes = data?.totalEpisodes || 1;
  const currentEpisodeIndex = currentEpisode - 1;

  const universalEpisodes: UniversalEpisode[] = useMemo(() => {
    if (!data?.episodes) return [];
    
    return data.episodes.map((ep) => {
      const videoQualities: VideoQuality[] = [];
      
      if (ep.videoUrl) {
        const isHls = ep.videoUrl.includes('.m3u8');
        videoQualities.push({
          id: 'default',
          label: 'Auto',
          quality: 720,
          url: ep.videoUrl,
          isDefault: true,
          isHls,
        });
      }

      return {
        id: ep.episodeId,
        number: ep.episodeNo,
        videoQualities,
        subtitleUrl: ep.subtitleUrl,
      };
    });
  }, [data?.episodes]);

  if (isLoading) {
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

  if (!data || universalEpisodes.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <UniversalPlayer
      provider="netshort"
      bookId={shortPlayId}
      title={data.title || "NetShort"}
      description={data.description || ""}
      episodes={universalEpisodes}
      currentEpisodeIndex={currentEpisodeIndex}
      onEpisodeChange={handleEpisodeChange}
    />
  );
}
