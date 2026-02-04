"use client";

import { Play, ArrowRight } from 'lucide-react';
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

  return (
    <section className={cn('', className)}>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="section-title">Continue Watching</h2>
        <div className="flex-1 divider" />
        <Link href="/history" className="btn-ghost text-xs">
          View All
          <ArrowRight className="w-3 h-3 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-border">
        {recentlyWatched.map((item) => {
          const progress = item.duration > 0 ? (item.watch_position / item.duration) * 100 : 0;
          return (
            <Link
              key={`${item.drama_id}-${item.platform}`}
              href={`/drama/${item.platform}/${item.drama_id}?episode=${item.episode_number}`}
              className="group bg-background p-2"
            >
              <div className="aspect-video relative overflow-hidden border border-border">
                {item.drama_cover ? (
                  <Image
                    src={item.drama_cover}
                    alt={item.drama_title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 bg-primary flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium line-clamp-1 text-foreground">{item.drama_title}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">EP {item.episode_number}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
