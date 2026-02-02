"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useDramaDetail, useEpisodes } from "@/hooks/useDramaDetail";
import { 
  ArrowLeft, ChevronUp, ChevronDown, Loader2, Settings, List, 
  AlertCircle, Play, Pause, Volume2, VolumeX 
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DramaDetailDirect, DramaDetailResponseLegacy } from "@/types/drama";

// Helper to check if response is new format
function isDirectFormat(data: unknown): data is DramaDetailDirect {
  return data !== null && typeof data === 'object' && 'bookId' in data && 'coverWap' in data;
}

// Helper to check if response is legacy format
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
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [displayTime, setDisplayTime] = useState({ current: 0, duration: 0 });
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: detailData, isLoading: detailLoading } = useDramaDetail(bookId || "");
  const { data: episodes, isLoading: episodesLoading } = useEpisodes(bookId || "");

  // Initialize from URL params
  useEffect(() => {
    const ep = parseInt(searchParams.get("ep") || "0", 10);
    if (ep >= 0) {
      setCurrentEpisode(ep);
    }
  }, [searchParams]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  // Update URL when episode changes
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

  // All useMemo hooks must be called BEFORE any early returns
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

  // Keep selected quality valid for the current episode
  useEffect(() => {
    if (!availableQualities.length) return;
    if (!availableQualities.includes(quality)) {
      setQuality(availableQualities[0]);
    }
  }, [availableQualities, quality]);

  // Get video URL with selected quality
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
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleSeek = useCallback((value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setDisplayTime({ 
        current: value, 
        duration: videoRef.current.duration 
      });
    }
  }, []);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Handle both new and legacy API formats
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

  // Loading state
  if (detailLoading || episodesLoading) {
    return (
      <main className="fixed inset-0 bg-black flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-white font-semibold text-lg">Loading video...</h3>
          <p className="text-white/60 text-sm">Please wait a moment</p>
        </div>
      </main>
    );
  }

  // Error state
  if (!book || !episodes) {
    return (
      <main className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 rounded-full glass-strong flex items-center justify-center mb-6">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Drama not found</h2>
        <p className="text-white/60 mb-6">The content you're looking for is unavailable</p>
        <Link 
          href="/" 
          className="btn-premium"
        >
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
      {/* Video Player */}
      <div className="w-full h-full relative">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
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
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent safe-top pointer-events-auto">
              <button 
                onClick={() => router.back()}
                className="p-2 sm:p-3 rounded-xl glass-strong hover:bg-white/20 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              
              <div className="flex-1 text-center px-4">
                <h1 className="text-white font-semibold text-sm sm:text-base line-clamp-1">
                  {book.bookName}
                </h1>
                <p className="text-white/70 text-xs sm:text-sm">
                  Episode {currentEpisode + 1} / {totalEpisodes}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 sm:p-3 rounded-xl glass-strong hover:bg-white/20 transition-all duration-300">
                      <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-strong border-border/50">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Quality</div>
                    {availableQualities.map((q) => (
                      <DropdownMenuItem
                        key={q}
                        onClick={() => setQuality(q)}
                        className={quality === q ? "text-primary font-semibold" : ""}
                      >
                        {q}p {quality === q && "✓"}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  onClick={() => setShowEpisodeList(true)}
                  className="p-2 sm:p-3 rounded-xl glass-strong hover:bg-white/20 transition-all duration-300"
                >
                  <List className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Center Play/Pause Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                onClick={togglePlay}
                className="pointer-events-auto p-6 sm:p-8 rounded-full glass-strong hover:scale-110 transition-all duration-300"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white" />
                ) : (
                  <Play className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-white ml-1" />
                )}
              </button>
            </div>

            {/* Side Navigation */}
            <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 sm:gap-4 pointer-events-auto">
              {currentEpisode > 0 && (
                <button
                  onClick={goToPrevEpisode}
                  className="p-3 sm:p-4 rounded-full glass-strong hover:bg-white/20 transition-all duration-300"
                >
                  <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              )}
              
              {currentEpisode < totalEpisodes - 1 && (
                <button
                  onClick={goToNextEpisode}
                  className="p-3 sm:p-4 rounded-full glass-strong hover:bg-white/20 transition-all duration-300"
                >
                  <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent safe-bottom pointer-events-auto">
              <div className="space-y-3 sm:space-y-4">
                {/* Episode Info */}
                <div className="space-y-1">
                  <h2 className="text-white font-semibold text-sm sm:text-base">
                    {currentEpisodeData?.chapterName || `Episode ${currentEpisode + 1}`}
                  </h2>
                  {book.introduction && (
                    <p className="text-white/80 text-xs sm:text-sm line-clamp-2">
                      {book.introduction}
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-white/80 text-xs sm:text-sm tabular-nums">
                    {formatTime(displayTime.current)}
                  </span>
                  <div 
                    className="flex-1 h-1 sm:h-1.5 bg-white/20 rounded-full cursor-pointer relative group"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percent = x / rect.width;
                      const newTime = percent * displayTime.duration;
                      handleSeek(newTime);
                    }}
                  >
                    <div 
                      className="h-full bg-primary rounded-full relative transition-all duration-150"
                      style={{ width: `${displayTime.duration ? (displayTime.current / displayTime.duration) * 100 : 0}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg" />
                    </div>
                  </div>
                  <span className="text-white/80 text-xs sm:text-sm tabular-nums">
                    {formatTime(displayTime.duration)}
                  </span>
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Episode List Drawer */}
      {showEpisodeList && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={() => setShowEpisodeList(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 max-h-[70vh] glass-premium rounded-t-3xl z-50 overflow-hidden animate-in slide-in-from-bottom">
            <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between">
              <h2 className="font-bold text-xl text-foreground">
                Episodes ({totalEpisodes})
              </h2>
              <button
                onClick={() => setShowEpisodeList(false)}
                className="px-4 py-2 rounded-lg glass-strong hover:bg-white/10 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(70vh-80px)] custom-scrollbar">
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-3">
                {episodes.map((ep, idx) => (
                  <button
                    key={ep.chapterId}
                    onClick={() => handleEpisodeChange(idx)}
                    className={`
                      aspect-square rounded-xl font-semibold text-sm sm:text-base
                      transition-all duration-300
                      ${idx === currentEpisode
                        ? 'bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30 scale-105' 
                        : 'glass-strong hover:bg-white/10 text-foreground'
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
