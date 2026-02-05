"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, ChevronLeft, ChevronRight, Info } from 'lucide-react';

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
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, validDramas.length]);

  if (isLoading) {
    return (
      <div className="aspect-[21/9] sm:aspect-[2.5/1] skeleton-base rounded-2xl" />
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
    <div className="relative w-full aspect-[21/9] sm:aspect-[2.5/1] overflow-hidden rounded-2xl group">
      <div className="absolute inset-0">
        <Image
          src={currentDrama.cover || currentDrama.cover_url || currentDrama.thumb_url}
          alt={currentDrama.bookName || currentDrama.name || currentDrama.book_name}
          fill
          className="object-cover transition-transform duration-700"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      <div className="relative h-full flex flex-col justify-end p-5 sm:p-8 md:p-10">
        <div className="max-w-xl space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <span className="badge-live">Featured</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white line-clamp-2 leading-tight">
            {currentDrama.bookName || currentDrama.name || currentDrama.book_name}
          </h1>

          <p className="text-sm text-white/70 line-clamp-2 max-w-lg hidden sm:block">
            {currentDrama.introduction || 'Tonton drama menarik ini sekarang!'}
          </p>

          <div className="flex gap-3 pt-1">
            <Link
              href={`/detail/${currentDrama.platform || 'dramabox'}/${currentDrama.bookId || currentDrama.book_id || currentDrama.short_play_id}`}
              className="btn-primary gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch</span>
            </Link>
            <Link
              href={`/detail/${currentDrama.platform || 'dramabox'}/${currentDrama.bookId || currentDrama.book_id || currentDrama.short_play_id}`}
              className="btn-secondary gap-2"
            >
              <Info className="w-4 h-4" />
              <span>Detail</span>
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {validDramas.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentIndex(index);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-gradient-to-r from-violet-500 to-purple-500'
                : 'w-1.5 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
