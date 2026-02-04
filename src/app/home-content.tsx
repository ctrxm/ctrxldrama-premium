"use client";

import { PlatformSelector } from "@/components/PlatformSelector";
import { DramaSection } from "@/components/DramaSection";
import { ReelShortSection } from "@/components/ReelShortSection";
import { NetShortHome } from "@/components/NetShortHome";
import { MeloloHome } from "@/components/MeloloHome";
import { FlickReelsHome } from "@/components/FlickReelsHome";
import { FreeReelsHome } from "@/components/FreeReelsHome";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ContinueWatching } from "@/components/ContinueWatching";
import { InfiniteDramaSection } from "@/components/InfiniteDramaSection";
import { ContinueWatchingSection } from "@/components/ContinueWatchingSection";
import { RecommendationsSection } from "@/components/RecommendationsSection";

import { useForYouDramas, useLatestDramas, useTrendingDramas, useDubindoDramas } from "@/hooks/useDramas";
import { usePlatform } from "@/hooks/usePlatform";

export default function HomeContent() {
  const { isDramaBox, isReelShort, isNetShort, isMelolo, isFlickReels, isFreeReels } = usePlatform();

  const { data: popularDramas, isLoading: loadingPopular, error: errorPopular, refetch: refetchPopular } = useForYouDramas();
  const { data: latestDramas, isLoading: loadingLatest, error: errorLatest, refetch: refetchLatest } = useLatestDramas();
  const { data: trendingDramas, isLoading: loadingTrending, error: errorTrending, refetch: refetchTrending } = useTrendingDramas();
  const { data: dubindoDramas, isLoading: loadingDubindo, error: errorDubindo, refetch: refetchDubindo } = useDubindoDramas();

  return (
    <main className="min-h-screen pt-14">
      <div className="sticky top-14 z-40 bg-background">
        <div className="container-main">
          <PlatformSelector />
        </div>
      </div>

      {isDramaBox && (
        <div className="container-main py-6 space-y-8">
          <HeroCarousel
            dramas={trendingDramas?.slice(0, 5) || []}
            isLoading={loadingTrending}
          />

          <ContinueWatchingSection />

          <ContinueWatching />

          <DramaSection
            title="Trending"
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

          <InfiniteDramaSection title="More Dramas" />
        </div>
      )}

      {isReelShort && (
        <div className="container-main py-6 space-y-8">
          <ReelShortSection />
        </div>
      )}

      {isNetShort && (
        <div className="container-main py-6 space-y-8">
          <NetShortHome />
        </div>
      )}

      {isMelolo && (
        <div className="container-main py-6 space-y-8">
          <MeloloHome />
        </div>
      )}

      {isFlickReels && (
        <div className="container-main py-6 space-y-8">
          <FlickReelsHome />
        </div>
      )}

      {isFreeReels && (
        <div className="container-main py-6 space-y-8">
          <FreeReelsHome />
        </div>
      )}
    </main>
  );
}
