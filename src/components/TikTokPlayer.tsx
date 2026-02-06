"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, Settings, List, Play, Pause, ChevronUp, ChevronDown, Volume2, VolumeX, Info, X, Gauge, PictureInPicture2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  description?: string;
  episodes: Episode[];
  onEpisodeChange: (episode: number) => void;
  onShowEpisodeList: () => void;
}

export default function TikTokPlayer({
  bookId,
  initialEpisode,
  totalEpisodes,
  title,
  description = "",
  episodes,
  onEpisodeChange,
  onShowEpisodeList,
}: TikTokPlayerProps) {
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState<string>("auto");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentEpisodeData = episodes.find(
    (ep) => ep.episodeNumber === currentEpisode
  );

  const HD_QUALITY_THRESHOLD = 720;
  
  const qualityOptions = currentEpisodeData?.videoList.map((video, index) => {
    const qualityValue = video.quality === 0 ? 1080 : video.quality;
    const qualityLabel = video.quality === 0 ? "1080p" : `${video.quality}p`;
    const isHD = qualityValue >= HD_QUALITY_THRESHOLD;
    return {
      id: `${video.encode}-${video.quality}-${index}`,
      label: `${qualityLabel} (${video.encode})`,
      quality: qualityValue,
      isHD,
      video,
    };
  }).sort((a, b) => b.quality - a.quality) || [];

  const getCurrentVideoUrl = useCallback(() => {
    if (!currentEpisodeData?.videoList?.length) return null;

    if (selectedQuality === "auto" || !qualityOptions.length) {
      const h264Video = currentEpisodeData.videoList.find((v) => v.encode === "H264");
      return h264Video || currentEpisodeData.videoList[0];
    }

    const selected = qualityOptions.find((q) => q.id === selectedQuality);
    if (selected) {
      return selected.video;
    }
    
    return currentEpisodeData.videoList[0];
  }, [currentEpisodeData, selectedQuality, qualityOptions]);

  const loadVideo = useCallback((videoUrl: string) => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    setIsLoading(true);

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

  const changePlaybackSpeed = useCallback((speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  }, []);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        setIsPiPActive(true);
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  }, []);

  useEffect(() => {
    setIsPiPSupported(document.pictureInPictureEnabled === true);
    
    const handlePiPChange = () => {
      setIsPiPActive(!!document.pictureInPictureElement);
    };
    
    document.addEventListener('enterpictureinpicture', handlePiPChange);
    document.addEventListener('leavepictureinpicture', handlePiPChange);
    
    return () => {
      document.removeEventListener('enterpictureinpicture', handlePiPChange);
      document.removeEventListener('leavepictureinpicture', handlePiPChange);
    };
  }, []);

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
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/40">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-16 h-16 animate-pulse">
              <Image
                src="/logo.png"
                alt="Loading..."
                fill
                className="object-contain"
                sizes="64px"
              />
            </div>
            <span className="text-white/60 text-xs">Loading...</span>
          </div>
        </div>
      )}

      {!isPlaying && !isLoading && (
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </button>
      )}

      <div className={`tiktok-overlay transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="tiktok-nav">
          <Link
            href={`/detail/reelshort/${bookId}`}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </Link>

          <div className="flex-1 text-center px-4">
            <p className="text-white text-sm font-semibold line-clamp-1">{title}</p>
            <p className="text-white/60 text-xs">Episode {currentEpisode} of {totalEpisodes}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
              >
                <Settings className="w-4 h-4 text-white" />
              </button>
              
              {showQualityMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowQualityMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 z-50 min-w-[160px] overflow-hidden">
                    <button
                      onClick={() => { setSelectedQuality("auto"); setShowQualityMenu(false); }}
                      className={`w-full px-4 py-3 text-left text-sm ${selectedQuality === "auto" ? 'text-violet-400 bg-white/5' : 'text-white'} hover:bg-white/10 transition-colors`}
                    >
                      Auto
                    </button>
                    {qualityOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => { 
                          setSelectedQuality(option.id); 
                          setShowQualityMenu(false); 
                        }}
                        className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between ${
                          selectedQuality === option.id ? 'text-violet-400 bg-white/5' : 'text-white'
                        } hover:bg-white/10 transition-colors`}
                      >
                        <span className="flex items-center gap-2">
                          {option.label}
                          {option.isHD && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold">
                              HD
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <button onClick={onShowEpisodeList} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
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

          <div className="relative">
            <button 
              onClick={() => setShowSpeedMenu(!showSpeedMenu)} 
              className="tiktok-action-btn"
            >
              <Gauge className="w-5 h-5" />
              {playbackSpeed !== 1 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 text-[9px] font-bold flex items-center justify-center">
                  {playbackSpeed}x
                </span>
              )}
            </button>
            {showSpeedMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSpeedMenu(false)} />
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/10">
                    <span className="text-[10px] text-white/50 uppercase tracking-wider">Speed</span>
                  </div>
                  {speedOptions.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changePlaybackSpeed(speed)}
                      className={`w-full px-4 py-2.5 text-left text-sm whitespace-nowrap ${playbackSpeed === speed ? 'text-violet-400 bg-white/5' : 'text-white'} hover:bg-white/10 transition-colors`}
                    >
                      {speed}x {speed === 1 && '(Normal)'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {isPiPSupported && (
            <button 
              onClick={togglePiP} 
              className={`tiktok-action-btn ${isPiPActive ? 'text-violet-400' : ''}`}
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>
          )}

          {description && (
            <button 
              onClick={() => setShowDescription(true)} 
              className="tiktok-action-btn"
            >
              <Info className="w-5 h-5" />
            </button>
          )}
          
          {currentEpisode < totalEpisodes && (
            <button onClick={goToNextEpisode} className="tiktok-action-btn">
              <ChevronDown className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="tiktok-info">
          <p className="text-white font-semibold text-base mb-1">{title}</p>
          <p className="text-white/60 text-sm">
            Episode {currentEpisode}
          </p>
          {description && (
            <p className="text-white/50 text-xs mt-2 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="absolute bottom-16 left-4 right-4 z-30">
          <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
            <span>{formatTime(progress)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div 
            className="h-1 bg-white/20 rounded-full cursor-pointer overflow-hidden"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
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
        {totalEpisodes > 10 && <span className="text-[10px] text-white/60 ml-1">+{totalEpisodes - 10}</span>}
      </div>

      {showDescription && description && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDescription(false)} />
          <div className="relative w-full max-w-lg bg-zinc-900 rounded-t-3xl p-6 pb-10 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">About This Drama</h3>
              <button 
                onClick={() => setShowDescription(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <h4 className="text-base font-semibold text-white mb-2">{title}</h4>
            <p className="text-sm text-white/70 leading-relaxed">{description}</p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
              <span className="text-xs text-white/50">Total Episodes: {totalEpisodes}</span>
              <span className="text-xs text-white/50">Current: Episode {currentEpisode}</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
