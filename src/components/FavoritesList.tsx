"use client";

import { Heart, Play, X } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

interface FavoritesListProps {
  limit?: number;
  className?: string;
}

export function FavoritesList({ limit, className }: FavoritesListProps) {
  const { user } = useAuth();
  const { favorites, isLoading, removeFavorite } = useFavorites();

  const displayedFavorites = limit ? favorites.slice(0, limit) : favorites;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Heart className="w-10 h-10 mb-3 text-muted-foreground/30" />
        <p className="text-sm">Sign in to view favorites</p>
        <Link href="/login" className="btn-primary mt-4">Sign In</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-px bg-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-background p-2">
            <div className="aspect-poster skeleton-base" />
            <div className="mt-2 space-y-1.5">
              <div className="h-3.5 skeleton-base" />
              <div className="h-3.5 skeleton-base w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Heart className="w-10 h-10 mb-3 text-muted-foreground/30" />
        <p className="text-sm">No favorites yet</p>
        <p className="text-xs mt-1">Add dramas by tapping the heart icon</p>
      </div>
    );
  }

  const handleRemove = (drama_id: string, platform: string) => {
    removeFavorite(
      { drama_id, platform },
      {
        onSuccess: () => toast.success('Removed from favorites'),
        onError: () => toast.error('Failed to remove'),
      }
    );
  };

  return (
    <div className={cn('', className)}>
      <div className="flex items-center gap-3 mb-4">
        <span className="badge-count">{favorites.length}</span>
        <span className="text-sm text-muted-foreground">saved dramas</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-px bg-border">
        {displayedFavorites.map((item) => (
          <div
            key={`${item.drama_id}-${item.platform}`}
            className="relative group bg-background p-2"
          >
            <Link href={`/drama/${item.platform}/${item.drama_id}`}>
              <div className="card-interactive aspect-poster relative overflow-hidden">
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
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                  {item.drama_title}
                </p>
                {item.drama_genre && (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5 truncate">
                    {item.drama_genre}
                  </p>
                )}
              </div>
            </Link>
            <button
              onClick={() => handleRemove(item.drama_id, item.platform)}
              className="absolute top-3 right-3 btn-icon bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
