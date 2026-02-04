"use client";

import { Sparkles, Star, Loader2 } from 'lucide-react';
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
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!displayedRecs?.length) return null;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h2 className="text-xl font-bold">
          {user ? 'Rekomendasi Untuk Anda' : 'Drama Populer'}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayedRecs.map((drama) => (
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
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-semibold line-clamp-2 mb-1">
                    {drama.drama_title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    {drama.avg_rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {drama.avg_rating.toFixed(1)}
                      </span>
                    )}
                    {drama.drama_genre && (
                      <span className="truncate">{drama.drama_genre}</span>
                    )}
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
    </div>
  );
}
