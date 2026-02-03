"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroSkeleton } from './SkeletonLoader';

interface HeroCarouselProps {
  dramas: any[];
  isLoading?: boolean;
}

export function HeroCarousel({ dramas, isLoading }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || dramas.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dramas.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, dramas.length]);

  if (isLoading) {
    return <HeroSkeleton />;
  }

  if (!dramas || dramas.length === 0) {
    return null;
  }

  const currentDrama = dramas[currentIndex];

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + dramas.length) % dramas.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % dramas.length);
  };

  return (
    <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden group">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <Image
          src={currentDrama.cover || currentDrama.cover_url || currentDrama.thumb_url}
          alt={currentDrama.bookName || currentDrama.name || currentDrama.book_name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
        <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-bold rounded-full backdrop-blur-sm">
              ⭐ FEATURED
            </span>
            {currentDrama.rating && (
              <div className="flex items-center gap-1 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-white">{currentDrama.rating}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg line-clamp-2">
            {currentDrama.bookName || currentDrama.name || currentDrama.book_name}
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-200 line-clamp-2 md:line-clamp-3 drop-shadow-md">
            {currentDrama.introduction || 'No description available'}
          </p>

          {/* Tags */}
          {currentDrama.tagNames && (
            <div className="flex flex-wrap gap-2">
              {currentDrama.tagNames.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/detail/${currentDrama.platform || 'dramabox'}/${currentDrama.bookId || currentDrama.book_id || currentDrama.short_play_id}`}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
            >
              <Play className="w-5 h-5 fill-current" />
              Watch Now
            </Link>
            <button className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-semibold transition-all hover:scale-105">
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {dramas.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentIndex(index);
            }}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'w-1.5 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
