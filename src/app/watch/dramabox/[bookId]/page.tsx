"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useDramaDetail, useEpisodes } from "@/hooks/useDramaDetail";
import { 
  ArrowLeft, ChevronUp, ChevronDown, Loader2, Settings, List, 
  AlertCircle, Play, Pause, Volume2, VolumeX, X
} from "lucide-react";
import Link from "next/link";
import type { DramaDetailDirect, DramaDetailResponseLegacy } from "@/types/drama";

function isDirectFormat(data: unknown): data is DramaDetailDirect {
  return data !== null && typeof data === 'object' && 'bookId' in data && 'coverWap' in data;
}

function isLegacyFormat(data: unknown): data is DramaDetailResponseLegacy {
  return data !== null && typeof data === 'object' && 'data' in data && (data as DramaDetailResponseLegacy).data?.book !== undefined;
}

export default function DramaBoxWatchPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [quality, setQuality] = useState(720);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [displayTime, setDisplayTime] = useState({ current: 0, duration: 0 });
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: detailData, isLoading: detailLoading } = useDramaDetail(bookId || "");
  const { data: episodes, isLoading: episodesLoading } = useEpisodes(bookId || "");

  useEffect(() => {
    const ep = parseInt(searchParams.get("ep") || "0", 10);
    if (ep >= 0) {
      setCurrentEpisode(ep);
    }
  }, [searchParams]);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const handleEpisodeChange = (index: number) => {
    setCurrentEpisode(index);
    setShowEpisodeList(false);
    router.push(`/watch/dramabox/${bookId}?ep=${index}`);
  };

  const goToPrevEpisode = useCallback(() => {
    if (currentEpisode > 0) {
      handleEpisodeChange(currentEpisode - 1);
    }
  }, [currentEpisode]);

  const goToNextEpisode = useCallback(() => {
    if (episodes && currentEpisode < episodes.length - 1) {
      handleEpisodeChange(currentEpisode + 1);
    }
  }, [currentEpisode, episodes]);

  const currentEpisodeData = useMemo(() => {
    if (!episodes) return null;
    return episodes[currentEpisode] || null;
  }, [episodes, currentEpisode]);

  const defaultCdn = useMemo(() => {
    if (!currentEpisodeData) return null;
    return (
      currentEpisodeData.cdnList.find((cdn) => cdn.isDefault === 1) || currentEpisodeData.cdnList[0] || null
    );
  }, [currentEpisodeData]);

  const availableQualities = useMemo(() => {
    const list = defaultCdn?.videoPathList
      ?.map((v) => v.quality)
      .filter((q): q is number => typeof q === "number");

    const unique = Array.from(new Set(list && list.length ? list : [720]));
    return unique.sort((a, b) => b - a);
  }, [defaultCdn]);

  useEffect(() => {
    if (!availableQualities.length) return;
    if (!availableQualities.includes(quality)) {
      setQuality(availableQualities[0]);
    }
  }, [availableQualities, quality]);

  const getVideoUrl = () => {
    if (!currentEpisodeData || !defaultCdn) return "";

    const videoPath =
      defaultCdn.videoPathList.find((v) => v.quality === quality) ||
      defaultCdn.videoPathList.find((v) => v.isDefault === 1) ||
      defaultCdn.videoPathList[0];

    return videoPath?.videoPath || "";
  };

  const handleVideoEnded = () => {
    goToNextEpisode();
  };

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime;
      if (Math.floor(newTime) !== Math.floor(displayTime.current)) {
        setDisplayTime({ 
          current: newTime, 
          duration: videoRef.current.duration 
        });
      }
    }
  }, [displayTime.current]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDisplayTime({ 
        current: 0, 
        duration: videoRef.current.duration 
      });
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
    resetControlsTimeout();
  }, [isPlaying, resetControlsTimeout]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * displayTime.duration;
    videoRef.current.currentTime = newTime;
    setDisplayTime({ 
      current: newTime, 
      duration: videoRef.current.duration 
    });
  }, [displayTime.duration]);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  let book: { bookId: string; bookName: string; introduction?: string } | null = null;

  if (isDirectFormat(detailData)) {
    book = { 
      bookId: detailData.bookId, 
      bookName: detailData.bookName,
      introduction: detailData.introduction 
    };
  } else if (isLegacyFormat(detailData)) {
    book = { 
      bookId: detailData.data.book.bookId, 
      bookName: detailData.data.book.bookName,
      introduction: detailData.data.book.introduction
    };
  }

  const totalEpisodes = episodes?.length || 0;

  if (detailLoading || episodesLoading) {
    return (
      <main className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <div className="loading-spinner mb-4" />
        <p className="text-sm text-muted-foreground">Loading video...</p>
      </main>
    );
  }

  if (!book || !episodes) {
    return (
      <main className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-primary mb-4" />
        <h2 className="text-xl font-display font-bold text-foreground mb-2">Not Found</h2>
        <p className="text-muted-foreground mb-6 text-sm">Content unavailable</p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </main>
    );
  }

  const videoUrl = getVideoUrl();

  return (
    <main 
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
    >
      <div className="w-full h-full relative">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            playsInline
            autoPlay
            preload="auto"
            poster={currentEpisodeData?.chapterImg}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
            onContextMenu={(e) => e.preventDefault()}
            disablePictureInPicture
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="loading-spinner" />
          </div>
        )}

        {!isPlaying && showControls && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <div className="w-16 h-16 bg-black/60 flex items-center justify-center">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </button>
        )}

        <div className={`absolute inset-0 pointer-events-none transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent safe-top pointer-events-auto">
            <button 
              onClick={() => router.back()}
              className="btn-icon bg-black/50"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex-1 text-center px-4">
              <h1 className="text-white font-medium text-sm line-clamp-1">
                {book.bookName}
              </h1>
              <p className="text-white/60 text-xs">
                EP {currentEpisode + 1} / {totalEpisodes}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="btn-icon bg-black/50"
                >
                  <Settings className="w-4 h-4 text-white" />
                </button>
                
                {showQualityMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowQualityMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-card border border-border z-50 min-w-[100px]">
                      {availableQualities.map((q) => (
                        <button
                          key={q}
                          onClick={() => { setQuality(q); setShowQualityMenu(false); }}
                          className={`w-full px-4 py-2 text-left text-sm ${quality === q ? 'text-primary' : 'text-foreground'} hover:bg-muted`}
                        >
                          {q}p
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setShowEpisodeList(true)}
                className="btn-icon bg-black/50"
              >
                <List className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto">
            {currentEpisode > 0 && (
              <button
                onClick={goToPrevEpisode}
                className="btn-icon bg-black/50"
              >
                <ChevronUp className="w-5 h-5 text-white" />
              </button>
            )}
            
            <button onClick={togglePlay} className="btn-icon bg-black/50">
              {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
            </button>
            
            <button onClick={toggleMute} className="btn-icon bg-black/50">
              {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>
            
            {currentEpisode < totalEpisodes - 1 && (
              <button
                onClick={goToNextEpisode}
                className="btn-icon bg-black/50"
              >
                <ChevronDown className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent safe-bottom pointer-events-auto">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="tabular-nums">{formatTime(displayTime.current)}</span>
                <div 
                  className="flex-1 h-1 bg-white/20 cursor-pointer"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${displayTime.duration ? (displayTime.current / displayTime.duration) * 100 : 0}%` }}
                  />
                </div>
                <span className="tabular-nums">{formatTime(displayTime.duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEpisodeList && (
        <>
          <div
            className="fixed inset-0 bg-black/80 z-50"
            onClick={() => setShowEpisodeList(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 max-h-[70vh] bg-card border-t border-border z-50 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-label">Episodes ({totalEpisodes})</span>
              <button
                onClick={() => setShowEpisodeList(false)}
                className="btn-icon"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(70vh-60px)] scrollbar-thin">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1">
                {episodes.map((ep, idx) => (
                  <button
                    key={ep.chapterId}
                    onClick={() => handleEpisodeChange(idx)}
                    className={`
                      aspect-square flex items-center justify-center text-sm font-medium transition-colors
                      ${idx === currentEpisode
                        ? 'bg-primary text-white' 
                        : 'bg-muted hover:bg-muted/70 text-foreground'
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
