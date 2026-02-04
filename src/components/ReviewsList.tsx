"use client";

import { Star, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRatings } from '@/hooks/useRatings';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface ReviewsListProps {
  drama_id: string;
  platform: string;
  className?: string;
}

export function ReviewsList({ drama_id, platform, className }: ReviewsListProps) {
  const { ratings, averageRating, totalRatings, isLoading } = useRatings(drama_id, platform);

  const ratingsWithReview = ratings.filter((r) => r.review);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <h3 className="font-semibold">Ulasan</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-foreground">{averageRating.toFixed(1)}</span>
          </div>
          <span>({totalRatings} rating)</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : ratingsWithReview.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Belum ada ulasan. Jadilah yang pertama!
        </p>
      ) : (
        <div className="space-y-4">
          {ratingsWithReview.map((rating) => (
            <div key={rating.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
              <Avatar className="w-10 h-10">
                <AvatarFallback>
                  {rating.user_email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    {rating.user_email?.split('@')[0] || 'Pengguna'}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'w-3.5 h-3.5',
                          star <= rating.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-400'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(rating.created_at), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </span>
                </div>
                <p className="text-sm">{rating.review}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
