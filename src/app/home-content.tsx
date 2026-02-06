"use client";

import { useCallback, lazy, Suspense } from "react";
import { PlatformSelector } from "@/components/PlatformSelector";
import { DramaSection } from "@/components/DramaSection";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ContinueWatchingSection } from "@/components/ContinueWatchingSection";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { RecentlyAddedSection } from "@/components/RecentlyAddedSection";
import { PullToRefresh } from "@/components/PullToRefresh";

import { useForYouDramas, useLatestDramas, useTrendingDramas, useDubindoDramas } from "@/hooks/useDramas";
import { usePlatform } from "@/hooks/usePlatform";

const ReelShortSection = lazy(() => import("@/components/ReelShortSection").then(m => ({ default: m.ReelShortSection })));
const NetShortHome = lazy(() => import("@/components/NetShortHome").then(m => ({ default: m.NetShortHome })));
const MeloloHome = lazy(() => import("@/components/MeloloHome").then(m => ({ default: m.MeloloHome })));
const FlickReelsHome = lazy(() => import("@/components/FlickReelsHome").then(m => ({ default: m.FlickReelsHome })));
const FreeReelsHome = lazy(() => import("@/components/FreeReelsHome").then(m => ({ default: m.FreeReelsHome })));
const InfiniteDramaSection = lazy(() => import("@/components/InfiniteDramaSection").then(m => ({ default: m.InfiniteDramaSection })));

function PlatformSkeleton() {
  return (
    <div className="py-6 space-y-6">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] rounded-xl bg-muted/30 animate-pulse mb-2" />
            <div className="h-4 w-3/4 bg-muted/20 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeContent() {
  const { isDramaBox, isReelShort, isNetShort, isMelolo, isFlickReels, isFreeReels } = usePlatform();

  const { data: popularDramas, isLoading: loadingPopular, error: errorPopular, refetch: refetchPopular } = useForYouDramas(isDramaBox);
  const { data: latestDramas, isLoading: loadingLatest, error: errorLatest, refetch: refetchLatest } = useLatestDramas(isDramaBox);
  const { data: trendingDramas, isLoading: loadingTrending, error: errorTrending, refetch: refetchTrending } = useTrendingDramas(isDramaBox);
  const { data: dubindoDramas, isLoading: loadingDubindo, error: errorDubindo, refetch: refetchDubindo } = useDubindoDramas(isDramaBox);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchTrending(),
      refetchPopular(),
      refetchLatest(),
      refetchDubindo(),
    ]);
  }, [refetchTrending, refetchPopular, refetchLatest, refetchDubindo]);

  return (
    <main className="min-h-screen pt-16">
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="container-main">
          <PlatformSelector />
        </div>
      </div>

      {isDramaBox && (
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="container-main py-6 space-y-10">
            <HeroCarousel
              dramas={trendingDramas?.slice(0, 5) || []}
              isLoading={loadingTrending}
            />

            <ContinueWatchingSection />

            <RecentlyAddedSection limit={6} />

            <DramaSection
              title="Trending Now"
              dramas={trendingDramas}
              isLoading={loadingTrending}
              error={!!errorTrending}
              onRetry={() => refetchTrending()}
            />

            <DramaSection
              title="Popular"
              dramas={popularDramas}
              isLoading={loadingPopular}
              error={!!errorPopular}
              onRetry={() => refetchPopular()}
            />

            <DramaSection
              title="Latest"
              dramas={latestDramas}
              isLoading={loadingLatest}
              error={!!errorLatest}
              onRetry={() => refetchLatest()}
            />

            <DramaSection
              title="Dubbed"
              dramas={dubindoDramas}
              isLoading={loadingDubindo}
              error={!!errorDubindo}
              onRetry={() => refetchDubindo()}
            />

            <RecommendationsSection limit={10} />

            <Suspense fallback={<PlatformSkeleton />}>
              <InfiniteDramaSection title="Discover More" />
            </Suspense>
          </div>
        </PullToRefresh>
      )}

      {isReelShort && (
        <div className="container-main py-6 space-y-10">
          <Suspense fallback={<PlatformSkeleton />}>
            <ReelShortSection />
          </Suspense>
        </div>
      )}

      {isNetShort && (
        <div className="container-main py-6 space-y-10">
          <Suspense fallback={<PlatformSkeleton />}>
            <NetShortHome />
          </Suspense>
        </div>
      )}

      {isMelolo && (
        <div className="container-main py-6 space-y-10">
          <Suspense fallback={<PlatformSkeleton />}>
            <MeloloHome />
          </Suspense>
        </div>
      )}

      {isFlickReels && (
        <div className="container-main py-6 space-y-10">
          <Suspense fallback={<PlatformSkeleton />}>
            <FlickReelsHome />
          </Suspense>
        </div>
      )}

      {isFreeReels && (
        <div className="container-main py-6 space-y-10">
          <Suspense fallback={<PlatformSkeleton />}>
            <FreeReelsHome />
          </Suspense>
        </div>
      )}
    </main>
  );
}
