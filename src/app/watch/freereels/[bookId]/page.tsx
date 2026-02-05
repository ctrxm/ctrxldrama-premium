"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useFreeReelsDetail } from "@/hooks/useFreeReels";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import UniversalPlayer, { UniversalEpisode, VideoQuality } from "@/components/UniversalPlayer";

export default function FreeReelsWatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [videoQuality, setVideoQuality] = useState<'h264' | 'h265'>('h264');

  const { data, isLoading, error } = useFreeReelsDetail(bookId);

  useEffect(() => {
    const epParam = searchParams.get("ep");
    if (epParam) {
      const epIndex = parseInt(epParam, 10) - 1;
      if (!isNaN(epIndex) && epIndex >= 0) {
        setCurrentEpisodeIndex(epIndex);
      }
    }
  }, [searchParams]);

  const drama = data?.data;
  const episodes = useMemo(() => drama?.episodes || [], [drama]);
  const totalEpisodes = episodes.length;

  const handleEpisodeChange = (index: number) => {
    setCurrentEpisodeIndex(index);
    const nextEp = index + 1;
    router.push(`/watch/freereels/${bookId}?ep=${nextEp}`);
  };

  const universalEpisodes: UniversalEpisode[] = useMemo(() => {
    return episodes.map((ep: any, idx: number) => {
      const videoQualities: VideoQuality[] = [];
      
      let sourceUrl = "";
      if (videoQuality === 'h265' && ep.external_audio_h265_m3u8) {
        sourceUrl = ep.external_audio_h265_m3u8;
      } else {
        sourceUrl = ep.external_audio_h264_m3u8 || ep.videoUrl || "";
      }
      
      if (sourceUrl) {
        const proxiedUrl = `/api/proxy/video?url=${encodeURIComponent(sourceUrl)}`;
        
        videoQualities.push({
          id: 'h264',
          label: 'H.264',
          quality: 720,
          url: ep.external_audio_h264_m3u8 ? `/api/proxy/video?url=${encodeURIComponent(ep.external_audio_h264_m3u8)}` : proxiedUrl,
          isDefault: videoQuality === 'h264',
          isHls: true,
        });
        
        if (ep.external_audio_h265_m3u8) {
          videoQualities.push({
            id: 'h265',
            label: 'H.265',
            quality: 1080,
            url: `/api/proxy/video?url=${encodeURIComponent(ep.external_audio_h265_m3u8)}`,
            isDefault: videoQuality === 'h265',
            isHls: true,
          });
        }
      }

      return {
        id: ep.id || `ep-${idx}`,
        number: (ep.index || idx) + 1,
        videoQualities,
        subtitleUrl: ep.subtitleUrl && ep.originalAudioLanguage !== 'id-ID' ? ep.subtitleUrl : undefined,
      };
    });
  }, [episodes, videoQuality]);

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

  if (error || !drama) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Video tidak ditemukan</h2>
        <Link href="/" className="text-primary hover:underline">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  return (
    <UniversalPlayer
      provider="freereels"
      bookId={bookId}
      title={drama.title}
      description={drama.description || ""}
      episodes={universalEpisodes}
      currentEpisodeIndex={currentEpisodeIndex}
      onEpisodeChange={handleEpisodeChange}
    />
  );
}
