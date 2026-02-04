"use client";

import { Heart } from 'lucide-react';
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
      toast.error('Please sign in first');
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
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    } catch {
      toast.error('Failed to update favorites');
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={isToggling}
        className={cn(
          'btn-icon bg-black/50',
          className
        )}
      >
        <Heart
          className={cn(
            'w-4 h-4 transition-colors',
            isFav ? 'fill-primary text-primary' : 'text-white'
          )}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isToggling}
      className={cn(
        isFav ? 'btn-primary' : 'btn-secondary',
        'gap-2',
        className
      )}
    >
      <Heart className={cn('w-4 h-4', isFav && 'fill-current')} />
      {isFav ? 'Remove' : 'Favorite'}
    </button>
  );
}
