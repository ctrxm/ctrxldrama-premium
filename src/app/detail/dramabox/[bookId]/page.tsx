"use client";

import { UnifiedErrorDisplay } from "@/components/UnifiedErrorDisplay";
import { useDramaDetail } from "@/hooks/useDramaDetail";
import { Play, Calendar, ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import type { DramaDetailDirect, DramaDetailResponseLegacy } from "@/types/drama";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { SubscribeButton } from "@/components/SubscribeButton";
import { RatingStars } from "@/components/RatingStars";
import { CommentsSection } from "@/components/CommentsSection";
import { ReviewsList } from "@/components/ReviewsList";
import { useState } from "react";

function isDirectFormat(data: unknown): data is DramaDetailDirect {
  return data !== null && typeof data === 'object' && 'bookId' in data && 'coverWap' in data;
}

function isLegacyFormat(data: unknown): data is DramaDetailResponseLegacy {
  return data !== null && typeof data === 'object' && 'data' in data && (data as DramaDetailResponseLegacy).data?.book !== undefined;
}

export default function DramaBoxDetailPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId;
  const router = useRouter();
  const { data, isLoading, error } = useDramaDetail(bookId || "");
  const [activeTab, setActiveTab] = useState<'reviews' | 'comments'>('reviews');

  if (isLoading) {
    return <DetailSkeleton />;
  }

  let book: {
    bookId: string;
    bookName: string;
    cover: string;
    chapterCount: number;
    introduction: string;
    tags?: string[];
    shelfTime?: string;
  } | null = null;

  if (isDirectFormat(data)) {
    book = {
      bookId: data.bookId,
      bookName: data.bookName,
      cover: data.coverWap,
      chapterCount: data.chapterCount,
      introduction: data.introduction,
      tags: data.tags || data.tagV3s?.map(t => t.tagName),
      shelfTime: data.shelfTime,
    };
  } else if (isLegacyFormat(data)) {
    book = {
      bookId: data.data.book.bookId,
      bookName: data.data.book.bookName,
      cover: data.data.book.cover,
      chapterCount: data.data.book.chapterCount,
      introduction: data.data.book.introduction,
      tags: data.data.book.tags,
      shelfTime: data.data.book.shelfTime,
    };
  }

  if (error || !book) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <UnifiedErrorDisplay 
          title="Not Found"
          message="Unable to load drama details."
          onRetry={() => router.push('/')}
          retryLabel="Back to Home"
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-14 pb-20">
      <div className="border-b border-border">
        <div className="container-main py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      </div>

      <div className="container-main py-6">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
          <div className="relative">
            <div className="sticky top-20">
              <div className="relative border border-border overflow-hidden">
                <img
                  src={book.cover}
                  alt={book.bookName}
                  className="w-full aspect-poster object-cover"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <FavoriteButton
                    drama_id={book.bookId}
                    platform="dramabox"
                    drama_title={book.bookName}
                    drama_cover={book.cover}
                    drama_genre={book.tags?.[0]}
                  />
                  <ShareButton title={book.bookName} description={book.introduction?.slice(0, 100)} />
                  <SubscribeButton
                    drama_id={book.bookId}
                    platform="dramabox"
                    drama_title={book.bookName}
                  />
                </div>
              </div>

              <Link
                href={`/watch/dramabox/${book.bookId}`}
                className="btn-primary w-full mt-4 gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Watch Now
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
                {book.bookName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" />
                  <span>{book.chapterCount} Episodes</span>
                </div>
                {book.shelfTime && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{book.shelfTime?.split(" ")[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {book.tags && book.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {book.tags.map((tag) => (
                  <span key={tag} className="badge-count">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div>
              <h3 className="text-label mb-2">Synopsis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {book.introduction}
              </p>
            </div>

            <div className="divider" />

            <div>
              <h3 className="text-label mb-3">Rate This Drama</h3>
              <RatingStars drama_id={book.bookId} platform="dramabox" showReview size="lg" />
            </div>

            <div className="divider" />

            <div>
              <div className="flex items-center gap-4 border-b border-border mb-4">
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 text-sm font-medium uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === 'reviews' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`py-2 text-sm font-medium uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === 'comments' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Comments
                </button>
              </div>

              {activeTab === 'reviews' && (
                <ReviewsList drama_id={book.bookId} platform="dramabox" />
              )}
              {activeTab === 'comments' && (
                <CommentsSection drama_id={book.bookId} platform="dramabox" />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen pt-20">
      <div className="container-main py-6">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
          <div>
            <div className="aspect-poster skeleton-base" />
            <div className="h-12 skeleton-base mt-4" />
          </div>
          <div className="space-y-4">
            <div className="h-8 skeleton-base w-3/4" />
            <div className="h-5 skeleton-base w-1/2" />
            <div className="flex gap-2">
              <div className="h-6 w-16 skeleton-base" />
              <div className="h-6 w-16 skeleton-base" />
              <div className="h-6 w-16 skeleton-base" />
            </div>
            <div className="h-32 skeleton-base" />
          </div>
        </div>
      </div>
    </main>
  );
}
