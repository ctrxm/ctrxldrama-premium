"use client";

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  drama_id: string;
  platform: string;
  drama_title: string;
  drama_cover?: string;
  drama_genre?: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export function FavoriteButton({
  drama_id,
  platform,
  drama_title,
  drama_cover,
  drama_genre,
  variant = 'icon',
  className,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isToggling } = useFavorites();

  const isFav = isFavorite(drama_id, platform);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }

    try {
      await toggleFavorite({
        drama_id,
        platform,
        drama_title,
        drama_cover,
        drama_genre,
      });
      toast.success(isFav ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit');
    } catch {
      toast.error('Gagal memperbarui favorit');
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={isToggling}
        className={cn(
          'p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors',
          className
        )}
      >
        <Heart
          className={cn(
            'w-5 h-5 transition-colors',
            isFav ? 'fill-red-500 text-red-500' : 'text-white'
          )}
        />
      </button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isToggling}
      variant={isFav ? 'default' : 'outline'}
      className={className}
    >
      <Heart
        className={cn('w-4 h-4 mr-2', isFav && 'fill-current')}
      />
      {isFav ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
    </Button>
  );
}
