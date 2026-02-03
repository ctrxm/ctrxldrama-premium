"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, Settings, List, Play, Pause } from "lucide-react";
import Link from "next/link";
import Hls from "hls.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoItem {
  url: string;
  encode: string;
  quality: number;
  bitrate: string;
}

interface Episode {
  episodeNumber: number;
  videoList: VideoItem[];
  isLocked: boolean;
}

interface TikTokPlayerProps {
  bookId: string;
  initialEpisode: number;
  totalEpisodes: number;
  title: string;
  episodes: Episode[];
  onEpisodeChange: (episode: number) => void;
  onShowEpisodeList: () => void;
}

export default function TikTokPlayer({
  bookId,
  initialEpisode,
  totalEpisodes,
  title,
  episodes,
  onEpisodeChange,
  onShowEpisodeList,
}: TikTokPlayerProps) {
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState<string>("auto");
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current episode data
  const currentEpisodeData = episodes.find(
    (ep) => ep.episodeNumber === currentEpisode
  );

  // Get available quality options
  const qualityOptions = currentEpisodeData?.videoList.map((video, index) => {
    let qualityLabel = "";
    if (video.quality === 0) {
      qualityLabel = `1080p (${video.encode})`;
    } else {
      qualityLabel = `${video.quality}p (${video.encode})`;
    }

    return {
      id: `${video.encode}-${video.quality}-${index}`,
      label: qualityLabel,
      quality: video.quality === 0 ? 1080 : video.quality,
      video,
    };
  }).sort((a, b) => b.quality - a.quality) || [];

  // Get current video URL based on selected quality
  const getCurrentVideoUrl = useCallback(() => {
    if (!currentEpisodeData?.videoList?.length) return null;

    if (selectedQuality === "auto" || !qualityOptions.length) {
      const h264Video = currentEpisodeData.videoList.find(
        (v) => v.encode === "H264"
      );
      return h264Video || currentEpisodeData.videoList[0];
    }

    const selected = qualityOptions.find((q) => q.id === selectedQuality);
    return selected?.video || currentEpisodeData.videoList[0];
  }, [currentEpisodeData, selectedQuality, qualityOptions]);

  // Load video source
  const loadVideo = useCallback((videoUrl: string) => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      video.play().catch(() => {});
    }
  }, []);

  // Setup HLS player when episode changes
  useEffect(() => {
    const currentVideo = getCurrentVideoUrl();
    if (!currentVideo || !videoRef.current) return;

    loadVideo(currentVideo.url);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentEpisode, selectedQuality, getCurrentVideoUrl, loadVideo]);

  // Handle video time update for progress bar
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const progress = (video.currentTime / video.duration) * 100;
    setProgress(progress);
  }, []);

  // Handle video ended - auto advance to next episode
  const handleVideoEnded = useCallback(() => {
    if (currentEpisode < totalEpisodes) {
      const nextEpisode = currentEpisode + 1;
      setCurrentEpisode(nextEpisode);
      onEpisodeChange(nextEpisode);
      setProgress(0);
    }
  }, [currentEpisode, totalEpisodes, onEpisodeChange]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isTransitioning) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    setIsTransitioning(true);

    // Swipe up - next episode
    if (distance > 0 && currentEpisode < totalEpisodes) {
      const nextEpisode = currentEpisode + 1;
      setCurrentEpisode(nextEpisode);
      onEpisodeChange(nextEpisode);
      setProgress(0);
    }

    // Swipe down - previous episode
    if (distance < 0 && currentEpisode > 1) {
      const prevEpisode = currentEpisode - 1;
      setCurrentEpisode(prevEpisode);
      onEpisodeChange(prevEpisode);
      setProgress(0);
    }

    setTimeout(() => setIsTransitioning(false), 300);
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && currentEpisode > 1 && !isTransitioning) {
        const prevEpisode = currentEpisode - 1;
        setCurrentEpisode(prevEpisode);
        onEpisodeChange(prevEpisode);
        setProgress(0);
      } else if (e.key === "ArrowDown" && currentEpisode < totalEpisodes && !isTransitioning) {
        const nextEpisode = currentEpisode + 1;
        setCurrentEpisode(nextEpisode);
        onEpisodeChange(nextEpisode);
        setProgress(0);
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentEpisode, totalEpisodes, isTransitioning, onEpisodeChange, togglePlayPause]);

  return (
    <div
      ref={containerRef}
      className="tiktok-player-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-40 safe-top">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
          <Link
            href={`/detail/reelshort/${bookId}`}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>

          <div className="flex items-center gap-3">
            {/* Quality Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="tiktok-control-btn w-10 h-10">
                  <Settings className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[100]">
                <DropdownMenuItem
                  onClick={() => setSelectedQuality("auto")}
                  className={selectedQuality === "auto" ? "text-primary font-semibold" : ""}
                >
                  Auto (H264)
                </DropdownMenuItem>
                {qualityOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => setSelectedQuality(option.id)}
                    className={selectedQuality === option.id ? "text-primary font-semibold" : ""}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Episode List Toggle */}
            <button
              onClick={onShowEpisodeList}
              className="tiktok-control-btn w-10 h-10"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Wrapper */}
      <div className="tiktok-video-wrapper">
        <video
          ref={videoRef}
          className="tiktok-video"
          playsInline
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          onClick={togglePlayPause}
        />

        {/* Center Play/Pause Button */}
        {!isPlaying && (
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Info Overlay */}
      <div className="tiktok-info safe-bottom">
        <h2 className="text-lg font-bold mb-1 drop-shadow-lg">{title}</h2>
        <p className="text-sm text-white/80 drop-shadow-lg">
          Episode {currentEpisode} of {totalEpisodes}
        </p>
      </div>

      {/* Side Controls */}
      <div className="tiktok-controls safe-bottom">
        <button
          onClick={togglePlayPause}
          className="tiktok-control-btn"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="tiktok-progress">
        <div
          className="tiktok-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Swipe Indicators */}
      {currentEpisode > 1 && (
        <div className="swipe-indicator top">
          ↑ Swipe up for previous episode
        </div>
      )}
      {currentEpisode < totalEpisodes && (
        <div className="swipe-indicator bottom">
          ↓ Swipe down for next episode
        </div>
      )}
    </div>
  );
}
