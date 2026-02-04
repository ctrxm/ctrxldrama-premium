"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useRatings } from '@/hooks/useRatings';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RatingStarsProps {
  drama_id: string;
  platform: string;
  showReview?: boolean;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  className?: string;
}

export function RatingStars({
  drama_id,
  platform,
  showReview = false,
  size = 'md',
  readOnly = false,
  className,
}: RatingStarsProps) {
  const { user } = useAuth();
  const { userRating, averageRating, totalRatings, submitRating, isSubmitting } = useRatings(drama_id, platform);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(userRating?.rating || 0);
  const [review, setReview] = useState(userRating?.review || '');
  const [showForm, setShowForm] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const displayRating = readOnly ? averageRating : (hoverRating || selectedRating || userRating?.rating || 0);

  const handleRatingClick = (rating: number) => {
    if (readOnly) return;
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }
    setSelectedRating(rating);
    if (showReview) {
      setShowForm(true);
    } else {
      submitRating({ rating }, {
        onSuccess: () => toast.success('Rating berhasil disimpan'),
        onError: () => toast.error('Gagal menyimpan rating'),
      });
    }
  };

  const handleSubmitReview = () => {
    if (!selectedRating) {
      toast.error('Pilih rating terlebih dahulu');
      return;
    }
    submitRating(
      { rating: selectedRating, review: review || undefined },
      {
        onSuccess: () => {
          toast.success('Ulasan berhasil disimpan');
          setShowForm(false);
        },
        onError: () => toast.error('Gagal menyimpan ulasan'),
      }
    );
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              className={cn(
                'transition-transform',
                !readOnly && 'hover:scale-110 cursor-pointer'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors',
                  star <= displayRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-400'
                )}
              />
            </button>
          ))}
        </div>
        {readOnly && (
          <span className="text-sm text-muted-foreground">
            {averageRating.toFixed(1)} ({totalRatings} ulasan)
          </span>
        )}
      </div>

      {showReview && showForm && (
        <div className="flex flex-col gap-2 mt-2">
          <Textarea
            placeholder="Tulis ulasan Anda (opsional)..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              size="sm"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Ulasan'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              size="sm"
            >
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
