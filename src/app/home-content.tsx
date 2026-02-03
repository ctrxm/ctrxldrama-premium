"use client";

import { PlatformSelector } from "@/components/PlatformSelector";
import { DramaSection } from "@/components/DramaSection";
import { AdsDisplay } from "@/components/AdsDisplay";
import { ReelShortSection } from "@/components/ReelShortSection";
import { NetShortHome } from "@/components/NetShortHome";
import { MeloloHome } from "@/components/MeloloHome";
import { FlickReelsHome } from "@/components/FlickReelsHome";
import { FreeReelsHome } from "@/components/FreeReelsHome";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ContinueWatching } from "@/components/ContinueWatching";

import { ScrollReveal } from "@/components/ScrollReveal";
import { BackToTop } from "@/components/BackToTop";

import { useForYouDramas, useLatestDramas, useTrendingDramas, useDubindoDramas } from "@/hooks/useDramas";
import { usePlatform } from "@/hooks/usePlatform";

export default function HomeContent() {
  const { isDramaBox, isReelShort, isNetShort, isMelolo, isFlickReels, isFreeReels } = usePlatform();

  // Fetch data for all DramaBox sections
  const { data: popularDramas, isLoading: loadingPopular, error: errorPopular, refetch: refetchPopular } = useForYouDramas();
  const { data: latestDramas, isLoading: loadingLatest, error: errorLatest, refetch: refetchLatest } = useLatestDramas();
  const { data: trendingDramas, isLoading: loadingTrending, error: errorTrending, refetch: refetchTrending } = useTrendingDramas();
  const { data: dubindoDramas, isLoading: loadingDubindo, error: errorDubindo, refetch: refetchDubindo } = useDubindoDramas();

  return (
    <main className="min-h-screen pt-16">
      {/* Platform Selector */}
      <div className="glass-strong sticky top-16 z-40">
        <div className="container mx-auto">
          <PlatformSelector />
        </div>
      </div>

      {/* DramaBox Content - Multiple Sections */}
      {isDramaBox && (
        <div className="container mx-auto px-4 py-6 space-y-12">
          {/* Hero Carousel */}
          <ScrollReveal>
            <HeroCarousel
              dramas={trendingDramas?.slice(0, 5) || []}
              isLoading={loadingTrending}
            />
          </ScrollReveal>

          {/* Banner Ad */}
          <AdsDisplay position="banner" />

          {/* Continue Watching */}
          <ScrollReveal delay={100}>
            <ContinueWatching />
          </ScrollReveal>

          {/* Trending Section */}
          <ScrollReveal delay={200}>
            <DramaSection
              title="🔥 Trending Now"
              dramas={trendingDramas}
              isLoading={loadingTrending}
              error={!!errorTrending}
              onRetry={() => refetchTrending()}
            />
          </ScrollReveal>

          {/* Popular Section */}
          <ScrollReveal delay={300}>
            <DramaSection
              title="Populer"
              dramas={popularDramas}
              isLoading={loadingPopular}
              error={!!errorPopular}
              onRetry={() => refetchPopular()}
            />
          </ScrollReveal>

          {/* Inline Ad */}
          <AdsDisplay position="inline" />

          {/* Latest Section */}
          <ScrollReveal delay={100}>
            <DramaSection
              title="Terbaru"
              dramas={latestDramas}
              isLoading={loadingLatest}
              error={!!errorLatest}
              onRetry={() => refetchLatest()}
            />
          </ScrollReveal>

          {/* Dubindo Section */}
          <ScrollReveal delay={200}>
            <DramaSection
              title="Dubindo"
              dramas={dubindoDramas}
              isLoading={loadingDubindo}
              error={!!errorDubindo}
              onRetry={() => refetchDubindo()}
            />
          </ScrollReveal>
        </div>
      )}

      {/* ReelShort Content - Multiple Sections */}
      {isReelShort && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          <AdsDisplay position="banner" />
          <ScrollReveal>
            <ReelShortSection />
          </ScrollReveal>
        </div>
      )}

      {/* NetShort Content */}
      {isNetShort && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          <AdsDisplay position="banner" />
          <ScrollReveal>
            <NetShortHome />
          </ScrollReveal>
        </div>
      )}

      {/* Melolo Content */}
      {isMelolo && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          <AdsDisplay position="banner" />
          <ScrollReveal>
            <MeloloHome />
          </ScrollReveal>
        </div>
      )}

      {/* FlickReels Content */}
      {isFlickReels && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          <AdsDisplay position="banner" />
          <ScrollReveal>
            <FlickReelsHome />
          </ScrollReveal>
        </div>
      )}

      {/* FreeReels Content */}
      {isFreeReels && (
        <div className="container mx-auto px-4 py-6 space-y-8">
          <AdsDisplay position="banner" />
          <ScrollReveal>
            <FreeReelsHome />
          </ScrollReveal>
        </div>
      )}

      {/* Floating Action Buttons */}
      <BackToTop />
    </main>
  );
}
