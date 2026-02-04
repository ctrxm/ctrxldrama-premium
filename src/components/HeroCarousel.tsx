"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselProps {
  dramas: any[];
  isLoading?: boolean;
}

export function HeroCarousel({ dramas, isLoading }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const validDramas = dramas.filter(drama => {
    const cover = drama.cover || drama.cover_url || drama.thumb_url;
    return cover && cover.startsWith('http');
  });

  useEffect(() => {
    if (!isAutoPlaying || validDramas.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validDramas.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, validDramas.length]);

  if (isLoading) {
    return (
      <div className="aspect-[21/9] skeleton-base" />
    );
  }

  if (!validDramas || validDramas.length === 0) {
    return null;
  }

  const currentDrama = validDramas[currentIndex % validDramas.length];

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + validDramas.length) % validDramas.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % validDramas.length);
  };

  return (
    <div className="relative w-full aspect-[21/9] overflow-hidden group border border-border">
      <div className="absolute inset-0">
        <Image
          src={currentDrama.cover || currentDrama.cover_url || currentDrama.thumb_url}
          alt={currentDrama.bookName || currentDrama.name || currentDrama.book_name}
          fill
          className="object-cover"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative h-full flex flex-col justify-end p-6 md:p-10">
        <div className="max-w-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="badge-live">Featured</span>
            <span className="badge-count">{currentIndex + 1} / {validDramas.length}</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-display font-bold text-white line-clamp-2">
            {currentDrama.bookName || currentDrama.name || currentDrama.book_name}
          </h1>

          <p className="text-sm text-white/70 line-clamp-2 max-w-lg">
            {currentDrama.introduction || 'No description available'}
          </p>

          <div className="flex gap-2 pt-2">
            <Link
              href={`/detail/${currentDrama.platform || 'dramabox'}/${currentDrama.bookId || currentDrama.book_id || currentDrama.short_play_id}`}
              className="btn-primary"
            >
              <Play className="w-4 h-4 fill-current" />
              Watch Now
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 btn-icon opacity-0 group-hover:opacity-100 transition-opacity bg-black/50"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 btn-icon opacity-0 group-hover:opacity-100 transition-opacity bg-black/50"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
        {validDramas.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentIndex(index);
            }}
            className={`h-0.5 transition-all ${
              index === currentIndex
                ? 'w-6 bg-primary'
                : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
