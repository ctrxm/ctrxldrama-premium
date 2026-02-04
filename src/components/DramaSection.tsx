"use client";

import { UnifiedMediaCard } from "./UnifiedMediaCard";
import { UnifiedMediaCardSkeleton } from "./UnifiedMediaCardSkeleton";
import { UnifiedErrorDisplay } from "./UnifiedErrorDisplay";
import type { Drama } from "@/types/drama";

interface DramaSectionProps {
  title: string;
  dramas?: Drama[];
  isLoading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export function DramaSection({ title, dramas, isLoading, error, onRetry }: DramaSectionProps) {
  if (error) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="section-title">{title}</h2>
          <div className="flex-1 divider" />
        </div>
        <UnifiedErrorDisplay 
          title={`Failed to load ${title}`}
          message="Unable to fetch drama data."
          onRetry={onRetry}
        />
      </section>
    );
  }

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-3 w-24 skeleton-base" />
          <div className="flex-1 divider" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-px bg-border">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="bg-background p-2">
              <UnifiedMediaCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="section-title">{title}</h2>
        <div className="flex-1 divider" />
        {dramas && dramas.length > 16 && (
          <span className="text-label">{dramas.length} titles</span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-px bg-border">
        {dramas?.slice(0, 14).map((drama, index) => {
          const isPopular = drama.corner?.name?.toLowerCase().includes("populer");
          const badgeColor = isPopular ? "#E52E2E" : (drama.corner?.color || "#e5a00d");

          return (
            <div key={drama.bookId || `drama-${index}`} className="bg-background p-2">
              <UnifiedMediaCard 
                index={index}
                title={drama.bookName}
                cover={drama.coverWap || drama.cover || ""}
                link={`/detail/dramabox/${drama.bookId}`}
                episodes={drama.chapterCount}
                topLeftBadge={drama.corner ? {
                  text: drama.corner.name,
                  color: badgeColor
                } : null}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
