"use client";

import { History, Play, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
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
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <History className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-center">Login untuk melihat riwayat tontonan</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="text-muted-foreground">Memuat...</span>
      </div>
    );
  }

  if (recentlyWatched.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <History className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-center">Belum ada riwayat tontonan</p>
      </div>
    );
  }

  const handleClearAll = () => {
    if (confirm('Hapus semua riwayat tontonan?')) {
      clearHistory(undefined, {
        onSuccess: () => toast.success('Riwayat dihapus'),
        onError: () => toast.error('Gagal menghapus riwayat'),
      });
    }
  };

  const handleRemove = (drama_id: string, platform: string) => {
    removeFromHistory(
      { drama_id, platform },
      {
        onSuccess: () => toast.success('Dihapus dari riwayat'),
        onError: () => toast.error('Gagal menghapus'),
      }
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5" />
          <h3 className="font-semibold">Riwayat Tontonan</h3>
        </div>
        {showClearAll && recentlyWatched.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            <Trash2 className="w-4 h-4 mr-1" />
            Hapus Semua
          </Button>
        )}
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="space-y-3">
          {recentlyWatched.map((item) => {
            const progress = item.duration > 0 ? (item.watch_position / item.duration) * 100 : 0;
            return (
              <div
                key={`${item.drama_id}-${item.platform}`}
                className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <Link
                  href={`/drama/${item.platform}/${item.drama_id}`}
                  className="relative w-24 h-14 rounded overflow-hidden flex-shrink-0"
                >
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
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/drama/${item.platform}/${item.drama_id}`}
                    className="text-sm font-medium line-clamp-1 hover:text-primary"
                  >
                    {item.drama_title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Episode {item.episode_number}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={progress} className="h-1 flex-1" />
                    <span className="text-xs text-muted-foreground">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(item.last_watched_at), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(item.drama_id, item.platform)}
                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
