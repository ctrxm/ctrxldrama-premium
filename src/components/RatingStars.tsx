"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
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
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const displayRating = readOnly ? averageRating : (hoverRating || selectedRating || userRating?.rating || 0);

  const handleRatingClick = (rating: number) => {
    if (readOnly) return;
    if (!user) {
      toast.error('Please sign in first');
      return;
    }
    setSelectedRating(rating);
    if (showReview) {
      setShowForm(true);
    } else {
      submitRating({ rating }, {
        onSuccess: () => toast.success('Rating saved'),
        onError: () => toast.error('Failed to save rating'),
      });
    }
  };

  const handleSubmitReview = () => {
    if (!selectedRating) {
      toast.error('Select a rating first');
      return;
    }
    submitRating(
      { rating: selectedRating, review: review || undefined },
      {
        onSuccess: () => {
          toast.success('Review saved');
          setShowForm(false);
        },
        onError: () => toast.error('Failed to save review'),
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
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground'
                )}
              />
            </button>
          ))}
        </div>
        {readOnly && (
          <span className="text-xs text-muted-foreground">
            {averageRating.toFixed(1)} ({totalRatings})
          </span>
        )}
      </div>

      {showReview && showForm && (
        <div className="flex flex-col gap-2 mt-2">
          <textarea
            placeholder="Write your review (optional)..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
            className="input-base text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className="btn-primary text-xs py-2"
            >
              {isSubmitting ? 'Saving...' : 'Save Review'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary text-xs py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
