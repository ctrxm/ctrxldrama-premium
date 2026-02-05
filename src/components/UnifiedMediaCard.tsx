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
  index = 0,
}: UnifiedMediaCardProps) {
  return (
    <Link href={link} className="group block">
      <div className="relative aspect-poster rounded-xl overflow-hidden bg-card poster-shadow">
        <img
          src={cover.includes(".heic") 
            ? `https://wsrv.nl/?url=${encodeURIComponent(cover)}&output=jpg` 
            : cover}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {topLeftBadge && (
          <div className="absolute top-2 left-2">
            <span className={topLeftBadge.isPremium ? "badge-live" : "badge-new"}>
              {topLeftBadge.text}
            </span>
          </div>
        )}

        {episodes > 0 && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="badge-episode inline-flex items-center gap-1.5">
              <Play className="w-3 h-3 fill-current" />
              <span>{episodes} Episode</span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>
      </div>

      <div className="mt-3 px-0.5">
        <h3 className="text-sm font-medium text-foreground/90 line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {title}
        </h3>
      </div>
    </Link>
  );
}
