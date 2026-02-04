"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, Settings, List, Play, Pause, ChevronUp, ChevronDown, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import Hls from "hls.js";

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
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState<string>("auto");
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentEpisodeData = episodes.find(
    (ep) => ep.episodeNumber === currentEpisode
  );

  const qualityOptions = currentEpisodeData?.videoList.map((video, index) => {
    const qualityLabel = video.quality === 0 ? "1080p" : `${video.quality}p`;
    return {
      id: `${video.encode}-${video.quality}-${index}`,
      label: `${qualityLabel} (${video.encode})`,
      quality: video.quality === 0 ? 1080 : video.quality,
      video,
    };
  }).sort((a, b) => b.quality - a.quality) || [];

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

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    setProgress(video.currentTime);
    setDuration(video.duration);
  }, []);

  const handleVideoEnded = useCallback(() => {
    if (currentEpisode < totalEpisodes) {
      const nextEpisode = currentEpisode + 1;
      setCurrentEpisode(nextEpisode);
      onEpisodeChange(nextEpisode);
      setProgress(0);
    }
  }, [currentEpisode, totalEpisodes, onEpisodeChange]);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const goToPrevEpisode = useCallback(() => {
    if (currentEpisode > 1) {
      const prevEpisode = currentEpisode - 1;
      setCurrentEpisode(prevEpisode);
      onEpisodeChange(prevEpisode);
      setProgress(0);
    }
  }, [currentEpisode, onEpisodeChange]);

  const goToNextEpisode = useCallback(() => {
    if (currentEpisode < totalEpisodes) {
      const nextEpisode = currentEpisode + 1;
      setCurrentEpisode(nextEpisode);
      onEpisodeChange(nextEpisode);
      setProgress(0);
    }
  }, [currentEpisode, totalEpisodes, onEpisodeChange]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;
    videoRef.current.currentTime = newTime;
    setProgress(newTime);
  }, [duration]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          goToPrevEpisode();
          break;
        case "ArrowDown":
          goToNextEpisode();
          break;
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "m":
          toggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevEpisode, goToNextEpisode, togglePlayPause, toggleMute]);

  return (
    <div
      ref={containerRef}
      className="tiktok-player"
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
    >
      <video
        ref={videoRef}
        className="tiktok-video"
        playsInline
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onClick={togglePlayPause}
      />

      {!isPlaying && (
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          <div className="w-16 h-16 bg-black/60 flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </button>
      )}

      <div className={`tiktok-overlay transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="tiktok-nav">
          <Link
            href={`/detail/reelshort/${bookId}`}
            className="btn-icon bg-black/50"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </Link>

          <div className="flex-1 text-center">
            <p className="text-white text-sm font-medium line-clamp-1">{title}</p>
            <p className="text-white/60 text-xs">EP {currentEpisode} / {totalEpisodes}</p>
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
                  <div className="absolute right-0 top-full mt-2 bg-card border border-border z-50 min-w-[140px]">
                    <button
                      onClick={() => { setSelectedQuality("auto"); setShowQualityMenu(false); }}
                      className={`w-full px-4 py-2 text-left text-sm ${selectedQuality === "auto" ? 'text-primary' : 'text-foreground'} hover:bg-muted`}
                    >
                      Auto
                    </button>
                    {qualityOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => { setSelectedQuality(option.id); setShowQualityMenu(false); }}
                        className={`w-full px-4 py-2 text-left text-sm ${selectedQuality === option.id ? 'text-primary' : 'text-foreground'} hover:bg-muted`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <button onClick={onShowEpisodeList} className="btn-icon bg-black/50">
              <List className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="tiktok-sidebar">
          {currentEpisode > 1 && (
            <button onClick={goToPrevEpisode} className="tiktok-action-btn">
              <ChevronUp className="w-5 h-5" />
            </button>
          )}
          
          <button onClick={togglePlayPause} className="tiktok-action-btn">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <button onClick={toggleMute} className="tiktok-action-btn">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          {currentEpisode < totalEpisodes && (
            <button onClick={goToNextEpisode} className="tiktok-action-btn">
              <ChevronDown className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="tiktok-info">
          <p className="text-white text-sm">
            <span className="text-white/60">Episode</span> {currentEpisode}
          </p>
        </div>

        <div className="absolute bottom-12 left-4 right-4 z-30">
          <div className="flex items-center gap-2 text-[10px] text-white/60 mb-1">
            <span>{formatTime(progress)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div 
            className="h-1 bg-white/20 cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-primary"
              style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="tiktok-episode-indicator">
        {Array.from({ length: Math.min(totalEpisodes, 10) }).map((_, i) => {
          const epNum = i + 1;
          return (
            <div 
              key={i}
              className={`episode-dot ${currentEpisode === epNum ? 'active' : ''}`}
            />
          );
        })}
        {totalEpisodes > 10 && <span className="text-[10px] text-white/60">+{totalEpisodes - 10}</span>}
      </div>
    </div>
  );
}
