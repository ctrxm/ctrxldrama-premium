"use client";

import { Clock, Play, Trash2, X } from 'lucide-react';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

interface WatchHistoryListProps {
  limit?: number;
  showClearAll?: boolean;
  className?: string;
}

export function WatchHistoryList({
  limit,
  showClearAll = true,
  className,
}: WatchHistoryListProps) {
  const { user } = useAuth();
  const { getRecentlyWatched, clearHistory, removeFromHistory, isLoading } = useWatchHistory();

  const recentlyWatched = getRecentlyWatched(limit || 20);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Clock className="w-10 h-10 mb-3 text-muted-foreground/30" />
        <p className="text-sm">Sign in to view watch history</p>
        <Link href="/login" className="btn-primary mt-4">Sign In</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-2">
            <div className="w-28 h-16 skeleton-base flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 skeleton-base" />
              <div className="h-3 skeleton-base w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recentlyWatched.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Clock className="w-10 h-10 mb-3 text-muted-foreground/30" />
        <p className="text-sm">No watch history</p>
        <p className="text-xs mt-1">Your watched episodes will appear here</p>
      </div>
    );
  }

  const handleClearAll = () => {
    if (confirm('Clear all watch history?')) {
      clearHistory(undefined, {
        onSuccess: () => toast.success('History cleared'),
        onError: () => toast.error('Failed to clear'),
      });
    }
  };

  const handleRemove = (drama_id: string, platform: string) => {
    removeFromHistory(
      { drama_id, platform },
      {
        onSuccess: () => toast.success('Removed'),
        onError: () => toast.error('Failed to remove'),
      }
    );
  };

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="badge-count">{recentlyWatched.length}</span>
          <span className="text-sm text-muted-foreground">episodes watched</span>
        </div>
        {showClearAll && recentlyWatched.length > 0 && (
          <button onClick={handleClearAll} className="btn-ghost text-xs text-muted-foreground">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear All
          </button>
        )}
      </div>

      <div className="divide-y divide-border">
        {recentlyWatched.map((item) => {
          const progress = item.duration > 0 ? (item.watch_position / item.duration) * 100 : 0;
          return (
            <div
              key={`${item.drama_id}-${item.platform}`}
              className="flex gap-3 py-3 group"
            >
              <Link
                href={`/drama/${item.platform}/${item.drama_id}?episode=${item.episode_number}`}
                className="relative w-28 h-16 border border-border overflow-hidden flex-shrink-0"
              >
                {item.drama_cover ? (
                  <Image
                    src={item.drama_cover}
                    alt={item.drama_title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/drama/${item.platform}/${item.drama_id}?episode=${item.episode_number}`}
                  className="text-sm font-medium line-clamp-1 hover:text-primary transition-colors"
                >
                  {item.drama_title}
                </Link>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                  Episode {item.episode_number} · {Math.round(progress)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(item.last_watched_at), { addSuffix: true })}
                </p>
              </div>
              <button
                onClick={() => handleRemove(item.drama_id, item.platform)}
                className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
