"use client";

import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLatestDramas } from '@/hooks/useDramas';
import { UnifiedMediaCard } from './UnifiedMediaCard';
import { UnifiedMediaCardSkeleton } from './UnifiedMediaCardSkeleton';

interface RecentlyAddedSectionProps {
  limit?: number;
}

export function RecentlyAddedSection({ limit = 8 }: RecentlyAddedSectionProps) {
  const { data: latestDramas, isLoading } = useLatestDramas();

  const dramas = latestDramas?.slice(0, limit) || [];

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Recently Added</h2>
        </div>
        <Link href="/browse" className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
          View All
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: limit }).map((_, i) => (
            <UnifiedMediaCardSkeleton key={i} />
          ))}
        </div>
      ) : dramas.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {dramas.map((drama) => (
            <UnifiedMediaCard
              key={drama.bookId}
              title={drama.bookName}
              cover={drama.coverWap || drama.cover || ''}
              link={`/detail/dramabox/${drama.bookId}`}
              episodes={drama.chapterCount}
              topLeftBadge={{ text: 'NEW', color: '#10b981' }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
