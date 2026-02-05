"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMeloloDetail, useMeloloStream } from "@/hooks/useMelolo";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import UniversalPlayer, { UniversalEpisode, VideoQuality } from "@/components/UniversalPlayer";

export default function MeloloWatchPage() {
  const params = useParams<{ bookId: string; videoId: string }>();
  const router = useRouter();
  
  const [currentVideoId, setCurrentVideoId] = useState(params.videoId || "");

  useEffect(() => {
    if (params.videoId && params.videoId !== currentVideoId) {
      setCurrentVideoId(params.videoId);
    }
  }, [params.videoId]);

  const { data: detailData, isLoading: detailLoading } = useMeloloDetail(params.bookId || "");
  const { data: streamData, isLoading: streamLoading } = useMeloloStream(currentVideoId);

  const drama = detailData?.data?.video_data;
  const rawVideoModel = streamData?.data?.video_model;

  const qualities = useMemo(() => {
    if (!rawVideoModel) return [];
    try {
      const parsedModel = JSON.parse(rawVideoModel);
      const videoList = parsedModel.video_list;
      if (!videoList) return [];

      const availableQualities: VideoQuality[] = [];
      const qualityMap: Record<string, { label: string; quality: number }> = {
        video_1: { label: "240p", quality: 240 },
        video_2: { label: "360p", quality: 360 },
        video_3: { label: "480p", quality: 480 },
        video_4: { label: "540p", quality: 540 },
        video_5: { label: "720p", quality: 720 },
      };

      Object.entries(videoList).forEach(([key, value]: [string, any]) => {
        if (value?.main_url) {
          try {
            const decoded = atob(value.main_url);
            const url = decoded.startsWith("http") ? decoded : value.main_url;
            const qInfo = qualityMap[key] || { label: key, quality: 480 };
            
            availableQualities.push({
              id: key,
              label: qInfo.label,
              quality: qInfo.quality,
              url: url,
              isDefault: key === 'video_5' || key === 'video_4',
            });
          } catch {
            const qInfo = qualityMap[key] || { label: key, quality: 480 };
            availableQualities.push({
              id: key,
              label: qInfo.label,
              quality: qInfo.quality,
              url: value.main_url,
              isDefault: key === 'video_5' || key === 'video_4',
            });
          }
        }
      });
      
      return availableQualities.sort((a, b) => b.quality - a.quality);
    } catch {
      return [];
    }
  }, [rawVideoModel]);

  const currentEpisodeIndex = drama?.video_list?.findIndex(v => v.vid === currentVideoId) ?? -1;
  const totalEpisodes = drama?.video_list?.length || 0;

  const handleEpisodeChange = (index: number) => {
    if (!drama?.video_list?.[index]) return;
    const nextVideoId = drama.video_list[index].vid;
    setCurrentVideoId(nextVideoId);
    const newUrl = `/watch/melolo/${params.bookId}/${nextVideoId}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  const universalEpisodes: UniversalEpisode[] = useMemo(() => {
    if (!drama?.video_list) return [];
    
    return drama.video_list.map((v, idx) => ({
      id: v.vid,
      number: idx + 1,
      title: v.name,
      thumbnail: v.cover,
      videoQualities: v.vid === currentVideoId ? qualities : [],
    }));
  }, [drama?.video_list, currentVideoId, qualities]);

  if (detailLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!drama) {
    return (
      <main className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Video tidak ditemukan</h2>
        <button onClick={() => router.back()} className="text-primary hover:underline">
          Kembali
        </button>
      </main>
    );
  }

  if (streamLoading || qualities.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <UniversalPlayer
      provider="melolo"
      bookId={params.bookId}
      title={drama.series_title || "Melolo"}
      description={drama.description || ""}
      episodes={universalEpisodes}
      currentEpisodeIndex={currentEpisodeIndex !== -1 ? currentEpisodeIndex : 0}
      onEpisodeChange={handleEpisodeChange}
    />
  );
}
