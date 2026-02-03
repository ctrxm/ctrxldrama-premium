"use client";

import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Star, Eye, Flame } from 'lucide-react';
import { DramaCardSkeleton } from './SkeletonLoader';

interface TrendingSectionProps {
  dramas: any[];
  isLoading?: boolean;
  platform?: string;
}

export function TrendingSection({ dramas, isLoading, platform = 'dramabox' }: TrendingSectionProps) {
  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Trending Now
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <DramaCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!dramas || dramas.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Trending Now
        </h2>
        <Link
          href="/browse?tab=trending"
          className="text-sm text-primary hover:underline font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {dramas.slice(0, 6).map((drama, index) => {
          const dramaId = drama.bookId || drama.book_id || drama.short_play_id;
          const dramaTitle = drama.bookName || drama.name || drama.book_name || drama.title;
          const dramaCover = drama.cover || drama.cover_url || drama.thumb_url;
          const dramaRating = drama.rating || drama.score;

          // Skip if no valid data
          if (!dramaId || !dramaTitle || !dramaCover) {
            return null;
          }

          return (
            <Link
              key={dramaId}
              href={`/detail/${platform}/${dramaId}`}
              className="group relative"
            >
              {/* Rank Badge */}
              {index < 3 && (
                <div className="absolute -top-2 -left-2 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white animate-pulse'
                      : index === 1
                      ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                      : 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                </div>
              )}

              {/* Trending Badge */}
              <div className="absolute top-2 right-2 z-10">
                <div className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 animate-pulse shadow-lg">
                  <Flame className="w-3 h-3" />
                  HOT
                </div>
              </div>

              {/* Thumbnail */}
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 mb-2">
                <Image
                  src={dramaCover}
                  alt={dramaTitle}
                  fill
                  className="object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-75"
                  unoptimized
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                    {dramaRating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-white">{dramaRating}</span>
                      </div>
                    )}
                    {drama.view_count && (
                      <div className="flex items-center gap-1 text-white/80">
                        <Eye className="w-3 h-3" />
                        <span className="text-xs">{formatViews(drama.view_count)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Info */}
              <h3 className="text-sm font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {dramaTitle}
              </h3>
              
              {/* Tags */}
              {drama.tagNames && drama.tagNames.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-secondary text-[10px] font-medium rounded">
                    {drama.tagNames[0]}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
}
