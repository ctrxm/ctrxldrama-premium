/**
 * Optimized Video Player Component
 * Designed to eliminate lag and skip issues
 * 
 * Key optimizations:
 * - Minimal re-renders using refs
 * - Debounced state updates
 * - Hardware acceleration
 * - Disabled service worker for video
 */

import { useEffect, useRef, useCallback, memo } from "react";

interface OptimizedVideoPlayerProps {
  src: string;
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  onLoadedMetadata?: (duration: number) => void;
  className?: string;
  autoPlay?: boolean;
  poster?: string;
}

const OptimizedVideoPlayer = memo(function OptimizedVideoPlayer({
  src,
  onTimeUpdate,
  onEnded,
  onLoadedMetadata,
  className = "",
  autoPlay = true,
  poster,
}: OptimizedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeUpdateTimerRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Debounced time update to prevent excessive re-renders
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !onTimeUpdate) return;
    
    const currentTime = videoRef.current.currentTime;
    
    // Only update every 1 second to reduce overhead
    if (Math.abs(currentTime - lastTimeRef.current) >= 1) {
      lastTimeRef.current = currentTime;
      onTimeUpdate(currentTime);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current || !onLoadedMetadata) return;
    onLoadedMetadata(videoRef.current.duration);
  }, [onLoadedMetadata]);

  const handleEnded = useCallback(() => {
    onEnded?.();
  }, [onEnded]);

  // Setup video element with optimal settings
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force hardware acceleration
    video.style.transform = "translateZ(0)";
    video.style.willChange = "transform";
    
    // Optimal video settings
    video.playsInline = true;
    video.preload = "auto";
    
    // Disable picture-in-picture to save resources
    video.disablePictureInPicture = true;
    
    // Set playback rate to exactly 1.0
    video.playbackRate = 1.0;
    
    return () => {
      video.style.willChange = "auto";
    };
  }, []);

  // Handle autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlay) return;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.warn("Autoplay failed:", error);
      }
    };

    // Small delay to ensure video is ready
    const timer = setTimeout(playVideo, 100);
    return () => clearTimeout(timer);
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      poster={poster}
      playsInline
      preload="auto"
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      // Disable context menu to prevent interference
      onContextMenu={(e) => e.preventDefault()}
      // Critical: prevent default behaviors that might cause lag
      onStalled={(e) => {
        console.log("Video stalled, attempting recovery...");
        const video = e.currentTarget;
        if (video.readyState < 3) {
          video.load();
        }
      }}
      // Handle errors gracefully
      onError={(e) => {
        console.error("Video error:", e);
      }}
    />
  );
});

export default OptimizedVideoPlayer;
