"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFlickReelsDetail } from "@/hooks/useFlickReels";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import UniversalPlayer, { UniversalEpisode, VideoQuality } from "@/components/UniversalPlayer";

export default function FlickReelsWatchPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const initialVideoId = params.videoId as string;
  
  const [activeVideoId, setActiveVideoId] = useState(initialVideoId);
  const [videoReady, setVideoReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { data, isLoading, error, refetch } = useFlickReelsDetail(bookId);

  useEffect(() => {
    if (params.videoId && params.videoId !== activeVideoId) {
      setActiveVideoId(params.videoId as string);
      setRetryCount(0);
      setVideoReady(false);
    }
  }, [params.videoId]);

  const episodes = useMemo(() => data?.episodes || [], [data]);
  
  const currentIndex = useMemo(() => {
    return episodes.findIndex((ep) => ep.id === activeVideoId);
  }, [episodes, activeVideoId]);

  const currentEpisodeData = useMemo(() => {
    if (currentIndex === -1) return null;
    return episodes[currentIndex];
  }, [episodes, currentIndex]);

  const totalEpisodes = episodes.length;

  useEffect(() => {
    if (!currentEpisodeData?.raw?.videoUrl) return;
    
    const videoUrl = currentEpisodeData.raw.videoUrl;
    const warmupUrl = `/api/proxy/warmup?url=${encodeURIComponent(videoUrl)}`;
    
    setVideoReady(false);
    
    fetch(warmupUrl)
      .then(res => res.json())
      .then(data => {
        console.log("[Warmup] Result:", data.success ? "success" : "failed");
        setVideoReady(true);
      })
      .catch(err => {
        console.error("[Warmup] Error:", err);
        setVideoReady(true);
      });
  }, [currentEpisodeData?.raw?.videoUrl, retryCount]);

  const handleEpisodeChange = (index: number) => {
    const episode = episodes[index];
    if (!episode) return;
    
    setActiveVideoId(episode.id);
    setRetryCount(0);
    setVideoReady(false);
    window.history.pushState(null, "", `/watch/flickreels/${bookId}/${episode.id}`);
  };

  const universalEpisodes: UniversalEpisode[] = useMemo(() => {
    const timestamp = Date.now();
    
    return episodes.map((ep) => {
      const videoQualities: VideoQuality[] = [];
      
      if (ep.raw?.videoUrl) {
        const proxiedUrl = `/api/proxy/video?url=${encodeURIComponent(ep.raw.videoUrl)}&referer=${encodeURIComponent("https://www.flickreels.com/")}&_t=${timestamp}`;
        const isHls = ep.raw.videoUrl.includes('.m3u8');
        
        videoQualities.push({
          id: 'default',
          label: 'Auto',
          quality: 720,
          url: proxiedUrl,
          isDefault: true,
          isHls,
        });
      }

      return {
        id: ep.id,
        number: ep.index + 1,
        thumbnail: ep.raw?.chapter_cover,
        videoQualities,
      };
    });
  }, [episodes]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <h3 className="text-white font-medium text-lg">Memuat video...</h3>
          <p className="text-white/60 text-sm">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Drama tidak ditemukan</h2>
        <Link href="/" className="text-primary hover:underline">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  if (!videoReady) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <h3 className="text-white font-medium text-lg">Preparing video...</h3>
          <p className="text-white/60 text-sm">Please wait...</p>
        </div>
      </div>
    );
  }

  const { drama } = data;

  return (
    <UniversalPlayer
      provider="flickreels"
      bookId={bookId}
      title={drama.title}
      description={drama.description || ""}
      episodes={universalEpisodes}
      currentEpisodeIndex={currentIndex !== -1 ? currentIndex : 0}
      onEpisodeChange={handleEpisodeChange}
    />
  );
}
