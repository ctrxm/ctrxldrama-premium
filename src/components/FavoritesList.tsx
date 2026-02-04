"use client";

import { Heart, Play, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
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
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Heart className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-center">Login untuk melihat favorit</p>
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

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Heart className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-center">Belum ada drama favorit</p>
        <p className="text-sm text-center mt-1">
          Tambahkan drama ke favorit dengan menekan ikon hati
        </p>
      </div>
    );
  }

  const handleRemove = (drama_id: string, platform: string) => {
    removeFavorite(
      { drama_id, platform },
      {
        onSuccess: () => toast.success('Dihapus dari favorit'),
        onError: () => toast.error('Gagal menghapus'),
      }
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
        <h3 className="font-semibold">Drama Favorit ({favorites.length})</h3>
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {displayedFavorites.map((item) => (
            <div
              key={`${item.drama_id}-${item.platform}`}
              className="relative group rounded-lg overflow-hidden"
            >
              <Link href={`/drama/${item.platform}/${item.drama_id}`}>
                <div className="aspect-[2/3] relative">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {item.drama_title}
                    </p>
                    {item.drama_genre && (
                      <p className="text-white/70 text-xs line-clamp-1">
                        {item.drama_genre}
                      </p>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-10 h-10 text-white" />
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleRemove(item.drama_id, item.platform)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
