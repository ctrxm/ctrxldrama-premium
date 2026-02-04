"use client";

import { Star } from 'lucide-react';
import { useRecommendations } from '@/hooks/useTrending';
import { useAuth } from '@/contexts/AuthContext';
import { FavoriteButton } from '@/components/FavoriteButton';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface RecommendationsSectionProps {
  className?: string;
  limit?: number;
}

export function RecommendationsSection({ className, limit = 10 }: RecommendationsSectionProps) {
  const { user } = useAuth();
  const { data: recommendations, isLoading } = useRecommendations(user?.id);

  const displayedRecs = recommendations?.slice(0, limit);

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-3 w-32 skeleton-base" />
          <div className="flex-1 divider" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-px bg-border">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-background p-2">
              <div className="aspect-poster skeleton-base" />
              <div className="mt-2 space-y-1.5">
                <div className="h-3.5 skeleton-base" />
                <div className="h-3.5 skeleton-base w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!displayedRecs?.length) return null;

  return (
    <section className={cn('', className)}>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="section-title">
          {user ? 'Recommended For You' : 'Popular Dramas'}
        </h2>
        <div className="flex-1 divider" />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-px bg-border">
        {displayedRecs.map((drama) => (
          <div
            key={`${drama.drama_id}-${drama.platform}`}
            className="relative group bg-background p-2"
          >
            <Link href={`/drama/${drama.platform}/${drama.drama_id}`}>
              <div className="card-interactive aspect-poster relative overflow-hidden">
                {drama.drama_cover ? (
                  <Image
                    src={drama.drama_cover}
                    alt={drama.drama_title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}

                {drama.avg_rating > 0 && (
                  <div className="absolute top-0 left-0 bg-black/80 px-2 py-1 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="text-[10px] font-semibold text-white">
                      {drama.avg_rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                  {drama.drama_title}
                </p>
                {drama.drama_genre && (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5 truncate">
                    {drama.drama_genre}
                  </p>
                )}
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
    </section>
  );
}
