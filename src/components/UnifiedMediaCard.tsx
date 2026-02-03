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
  
  const BADGE_BASE = "px-2.5 py-1 rounded-md font-bold text-white shadow-sm leading-none tracking-wide flex items-center gap-1 font-sans text-[10px] uppercase";

  return (
    <Link
      href={link}
      className="group relative block"
    >
      {/* Visual Container */}
      <div className="card-corporate aspect-[2/3] relative overflow-hidden">
        <img
          src={cover.includes(".heic") 
            ? `https://wsrv.nl/?url=${encodeURIComponent(cover)}&output=jpg` 
            : cover}
          alt={title}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Flat Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badges Container */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none z-10 gap-2">
          
          {/* Top Left Badge */}
          <div className="flex-1 min-w-0 flex justify-start"> 
            {topLeftBadge && (
              <div 
                className={`
                  ${BADGE_BASE} truncate max-w-full
                  ${topLeftBadge.isPremium ? 'badge-premium' : ''}
                `}
                style={!topLeftBadge.isPremium ? { 
                  backgroundColor: topLeftBadge.color || "#DC2626",
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
                className={`${BADGE_BASE}`}
                style={{ 
                  backgroundColor: topRightBadge.isTransparent 
                    ? "rgba(0, 0, 0, 0.6)" 
                    : (topRightBadge.color || "rgba(0, 0, 0, 0.6)"),
                  color: topRightBadge.textColor || "#FFFFFF"
                }}
              >
                {topRightBadge.text}
              </div>
            )}
          </div>
        </div>

        {/* Episode Count Badge */}
        {episodes > 0 && (
          <div className="absolute bottom-2 left-2 episode-badge pointer-events-none">
            <Play className="w-3.5 h-3.5 fill-primary text-primary" />
            <span className="font-semibold">{episodes} Episodes</span>
          </div>
        )}

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="pt-3 pb-1">
        <h3 className="font-bold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
    </Link>
  );
}
