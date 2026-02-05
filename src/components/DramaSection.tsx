"use client";

import { UnifiedMediaCard } from "./UnifiedMediaCard";
import { UnifiedMediaCardSkeleton } from "./UnifiedMediaCardSkeleton";
import { UnifiedErrorDisplay } from "./UnifiedErrorDisplay";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
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
      <section className="fade-in">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
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
        <div className="section-header">
          <div className="h-5 w-28 skeleton-base rounded-lg" />
        </div>
        <div className="grid-cards">
          {Array.from({ length: 12 }).map((_, i) => (
            <UnifiedMediaCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!dramas || dramas.length === 0) {
    return null;
  }

  return (
    <section className="fade-in">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {dramas.length > 12 && (
          <Link href="/browse" className="section-link flex items-center gap-1">
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="grid-cards">
        {dramas.slice(0, 12).map((drama, index) => {
          const isPopular = drama.corner?.name?.toLowerCase().includes("populer");
          const badgeColor = isPopular ? "#E52E2E" : (drama.corner?.color || "#e5a00d");

          return (
            <UnifiedMediaCard 
              key={drama.bookId || `drama-${index}`}
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
          );
        })}
      </div>
    </section>
  );
}
