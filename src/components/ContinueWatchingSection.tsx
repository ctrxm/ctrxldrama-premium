"use client";

import { Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-green-500" />
          <h2 className="text-xl font-bold">Lanjutkan Menonton</h2>
        </div>
        <Link href="/history">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Lihat Semua
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recentlyWatched.map((item) => {
          const progress = item.duration > 0 ? (item.watch_position / item.duration) * 100 : 0;
          return (
            <Link
              key={`${item.drama_id}-${item.platform}`}
              href={`/drama/${item.platform}/${item.drama_id}?episode=${item.episode_number}`}
              className="group relative rounded-lg overflow-hidden"
            >
              <div className="aspect-video relative">
                {item.drama_cover ? (
                  <Image
                    src={item.drama_cover}
                    alt={item.drama_title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                  <Progress value={progress} className="h-1 rounded-none" />
                </div>
              </div>
              <div className="p-2 bg-card">
                <p className="text-sm font-medium line-clamp-1">{item.drama_title}</p>
                <p className="text-xs text-muted-foreground">Episode {item.episode_number}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
