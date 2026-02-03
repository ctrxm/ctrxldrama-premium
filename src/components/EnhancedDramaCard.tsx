"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Star, Bookmark, Share2, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EnhancedDramaCardProps {
  drama: any;
  platform?: string;
  showAnimation?: boolean;
}

export function EnhancedDramaCard({ drama, platform = 'dramabox', showAnimation = true }: EnhancedDramaCardProps) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const dramaId = drama.bookId || drama.book_id || drama.short_play_id;
  const dramaTitle = drama.bookName || drama.name || drama.book_name || drama.title;
  const dramaCover = drama.cover || drama.cover_url || drama.thumb_url;
  const dramaRating = drama.rating || drama.score;
  const dramaIntro = drama.introduction;

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to bookmark');
      return;
    }

    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('drama_id', dramaId);
        setIsBookmarked(false);
        toast.success('Removed from bookmarks');
      } else {
        await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            drama_id: dramaId,
            drama_title: dramaTitle,
            drama_cover: dramaCover,
            platform: platform,
          });
        setIsBookmarked(true);
        toast.success('Added to bookmarks', {
          icon: '🔖',
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/detail/${platform}/${dramaId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: dramaTitle,
          text: dramaIntro || `Check out ${dramaTitle}`,
          url: url,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!', {
        icon: '🔗',
      });
    }
  };

  return (
    <Link
      href={`/detail/${platform}/${dramaId}`}
      className={`group relative block ${showAnimation ? 'animate-in fade-in slide-in-from-bottom-4 duration-500' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 mb-3 shadow-md group-hover:shadow-xl transition-all duration-300">
        <Image
          src={dramaCover}
          alt={dramaTitle}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
        />

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Action Buttons */}
        <div className={`absolute top-2 right-2 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full backdrop-blur-md transition-all hover:scale-110 ${
              isBookmarked
                ? 'bg-primary text-primary-foreground'
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
            aria-label="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all hover:scale-110"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Play Button */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}>
          <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110">
            <Play className="w-8 h-8 text-primary-foreground fill-current ml-1" />
          </div>
        </div>

        {/* Bottom Info Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 space-y-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {dramaRating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-white">{dramaRating}</span>
            </div>
          )}
          {drama.episodeCount && (
            <div className="text-xs text-white/80">
              {drama.episodeCount} Episodes
            </div>
          )}
        </div>

        {/* VIP Badge */}
        {drama.isVip && (
          <div className="absolute top-2 left-2">
            <div className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] font-bold rounded shadow-lg">
              ⭐ VIP
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">
        {dramaTitle}
      </h3>

      {/* Tags */}
      {drama.tagNames && drama.tagNames.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {drama.tagNames.slice(0, 2).map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-secondary text-[10px] font-medium rounded hover:bg-secondary/80 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Hover Glow Effect */}
      <div className={`absolute -inset-1 bg-primary/20 rounded-lg blur-xl transition-opacity duration-300 -z-10 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />
    </Link>
  );
}
