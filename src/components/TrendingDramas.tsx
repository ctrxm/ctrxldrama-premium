"use client";

import { useState } from 'react';
import { TrendingUp, Star, Eye, Heart, Loader2 } from 'lucide-react';
import { useTrending } from '@/hooks/useTrending';
import { FilterSection } from '@/components/FilterSection';
import { FavoriteButton } from '@/components/FavoriteButton';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { FilterOptions } from '@/types/features';

interface TrendingDramasProps {
  className?: string;
  showFilters?: boolean;
  limit?: number;
}

export function TrendingDramas({ className, showFilters = true, limit }: TrendingDramasProps) {
  const [filters, setFilters] = useState<FilterOptions>({ sortBy: 'popular' });
  const { data: trending, isLoading } = useTrending(filters);

  const displayedDramas = limit ? trending?.slice(0, limit) : trending;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold">Trending Sekarang</h2>
        </div>
        {showFilters && <FilterSection filters={filters} onFiltersChange={setFilters} />}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !displayedDramas?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Belum ada drama trending</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayedDramas.map((drama, index) => (
            <div
              key={`${drama.drama_id}-${drama.platform}`}
              className="relative group rounded-xl overflow-hidden bg-card"
            >
              <Link href={`/drama/${drama.platform}/${drama.drama_id}`}>
                <div className="aspect-[2/3] relative">
                  {drama.drama_cover ? (
                    <Image
                      src={drama.drama_cover}
                      alt={drama.drama_title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  {index < 3 && (
                    <div className="absolute top-2 left-2">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm',
                          index === 0 && 'bg-yellow-500',
                          index === 1 && 'bg-gray-400',
                          index === 2 && 'bg-amber-700'
                        )}
                      >
                        {index + 1}
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold line-clamp-2 mb-1">
                      {drama.drama_title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-white/80">
                      {drama.avg_rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {drama.avg_rating.toFixed(1)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {drama.view_count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {drama.favorite_count}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <FavoriteButton
                  drama_id={drama.drama_id}
                  platform={drama.platform}
                  drama_title={drama.drama_title}
                  drama_cover={drama.drama_cover || undefined}
                  drama_genre={drama.drama_genre || undefined}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
