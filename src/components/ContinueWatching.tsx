"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ContinueWatchingSkeleton } from './SkeletonLoader';

interface WatchHistory {
  id: string;
  drama_id: string;
  drama_title: string;
  drama_cover: string;
  episode_number: number;
  progress: number;
  platform: string;
  updated_at: string;
}

export function ContinueWatching() {
  const { user } = useAuth();
  const [history, setHistory] = useState<WatchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    fetchWatchHistory();
  }, [user]);

  const fetchWatchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching watch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || (!isLoading && history.length === 0)) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          Continue Watching
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ContinueWatchingSkeleton key={i} />
          ))
        ) : (
          history.map((item) => (
            <Link
              key={item.id}
              href={`/detail/${item.platform}/${item.drama_id}`}
              className="group relative"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-gray-200 dark:bg-gray-800">
                <Image
                  src={item.drama_cover}
                  alt={item.drama_title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  unoptimized
                />
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              {/* Info */}
              <h3 className="text-sm font-semibold line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                {item.drama_title}
              </h3>
              <p className="text-xs text-muted-foreground">
                Episode {item.episode_number} • {Math.round(item.progress)}%
              </p>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
