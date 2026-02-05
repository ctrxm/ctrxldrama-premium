"use client";

import { Play, ArrowRight, Clock } from 'lucide-react';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface ContinueWatchingSectionProps {
  className?: string;
  limit?: number;
}

export function ContinueWatchingSection({ className, limit = 6 }: ContinueWatchingSectionProps) {
  const { user } = useAuth();
  const { getRecentlyWatched } = useWatchHistory();

  const recentlyWatched = getRecentlyWatched(limit);

  if (!user || recentlyWatched.length === 0) return null;

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const watched = new Date(date);
    const diffMs = now.getTime() - watched.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <section className={cn('', className)}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Continue Watching</h2>
        </div>
        <Link href="/history" className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
          View All
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {recentlyWatched.map((item) => {
          const progress = item.duration > 0 ? (item.watch_position / item.duration) * 100 : 0;
          return (
            <Link
              key={`${item.drama_id}-${item.platform}`}
              href={`/watch/${item.platform}/${item.drama_id}?episode=${item.episode_number}`}
              className="group"
            >
              <div className="aspect-video relative overflow-hidden rounded-xl bg-card">
                {item.drama_cover ? (
                  <img
                    src={item.drama_cover}
                    alt={item.drama_title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-violet-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-violet-500/30 transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                  <div className="h-1 bg-white/20">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-white/80 font-medium">
                    EP {item.episode_number}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 px-0.5">
                <p className="text-sm font-semibold line-clamp-1 text-foreground group-hover:text-violet-400 transition-colors">{item.drama_title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{formatTimeAgo(item.last_watched_at)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
