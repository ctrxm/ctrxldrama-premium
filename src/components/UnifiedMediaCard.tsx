"use client";

import Link from "next/link";
import { Play, Sparkles } from "lucide-react";

export interface BadgeConfig {
  text: string;
  color?: string;
  textColor?: string;
  isTransparent?: boolean;
  isPremium?: boolean;
}

export interface UnifiedMediaCardProps {
  title: string;
  cover: string;
  link: string;
  episodes?: number;
  topLeftBadge?: BadgeConfig | null;
  topRightBadge?: BadgeConfig | null;
  index?: number;
}

export function UnifiedMediaCard({
  title,
  cover,
  link,
  episodes = 0,
  topLeftBadge,
  topRightBadge,
  index = 0,
}: UnifiedMediaCardProps) {
  
  const BADGE_BASE = "px-2 py-1 md:px-2.5 md:py-1 rounded-lg font-bold text-white shadow-lg leading-none tracking-wide flex items-center gap-1 font-sans text-[9px] md:text-[10px] uppercase";

  return (
    <Link
      href={link}
      className="group relative block slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Visual Container */}
      <div className="card-premium aspect-[2/3] relative overflow-hidden">
        <img
          src={cover.includes(".heic") 
            ? `https://wsrv.nl/?url=${encodeURIComponent(cover)}&output=jpg` 
            : cover}
          alt={title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Badges Container */}
        <div className="absolute top-2 left-2 right-2 md:top-3 md:left-3 md:right-3 flex justify-between items-start pointer-events-none z-10 gap-2">
          
          {/* Top Left Badge */}
          <div className="flex-1 min-w-0 flex justify-start"> 
            {topLeftBadge && (
              <div 
                className={`
                  ${BADGE_BASE} truncate max-w-full
                  ${topLeftBadge.isPremium ? 'badge-premium' : ''}
                `}
                style={!topLeftBadge.isPremium ? { 
                  backgroundColor: topLeftBadge.color || "#E52E2E",
                  color: topLeftBadge.textColor || "#FFFFFF"
                } : {}}
              >
                {topLeftBadge.isPremium && <Sparkles className="w-3 h-3 fill-current" />}
                {topLeftBadge.text}
              </div>
            )}
          </div>

          {/* Top Right Badge */}
          <div className="shrink-0 flex justify-end">
            {topRightBadge && (
              <div 
                className={`
                  ${BADGE_BASE}
                  ${topRightBadge.isTransparent ? 'glass-strong' : ''}
                `}
                style={{ 
                  backgroundColor: topRightBadge.isTransparent 
                    ? "rgba(10, 22, 40, 0.7)" 
                    : (topRightBadge.color || "rgba(10, 22, 40, 0.7)"),
                  color: topRightBadge.textColor || "#FFFFFF",
                  backdropFilter: topRightBadge.isTransparent ? "blur(12px)" : "none"
                }}
              >
                {topRightBadge.text}
              </div>
            )}
          </div>
        </div>

        {/* Episode Count Badge */}
        {episodes > 0 && (
          <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 episode-badge pointer-events-none">
            <Play className="w-3 h-3 md:w-3.5 md:h-3.5 fill-primary text-primary" />
            <span className="font-semibold">{episodes} Episodes</span>
          </div>
        )}

        {/* Center Play Button with Glow */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-60" />
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6 md:w-7 md:h-7 text-white fill-white ml-1" />
            </div>
          </div>
        </div>

        {/* Shimmer Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="shimmer" />
        </div>
      </div>

      {/* Title with Premium Styling */}
      <div className="pt-3 md:pt-4 pb-1">
        <h3 className="font-bold text-sm md:text-base leading-snug line-clamp-2 text-foreground group-hover:gradient-text transition-all duration-300">
          {title}
        </h3>
      </div>
    </Link>
  );
}
