"use client";

import Link from "next/link";
import { Play } from "lucide-react";

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
  return (
    <Link href={link} className="group block">
      <div className="card-interactive aspect-poster relative overflow-hidden">
        <img
          src={cover.includes(".heic") 
            ? `https://wsrv.nl/?url=${encodeURIComponent(cover)}&output=jpg` 
            : cover}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {topLeftBadge && (
          <div className="absolute top-0 left-0">
            <div 
              className={topLeftBadge.isPremium ? "badge-live" : "badge-new"}
            >
              {topLeftBadge.text}
            </div>
          </div>
        )}

        {episodes > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1.5">
            <div className="flex items-center gap-1.5">
              <Play className="w-3 h-3 text-primary fill-primary" />
              <span className="text-[10px] font-medium text-white uppercase tracking-wider">
                {episodes} EP
              </span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-primary flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
    </Link>
  );
}
