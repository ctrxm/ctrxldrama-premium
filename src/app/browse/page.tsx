"use client";

import { useState } from 'react';
import { Film, TrendingUp, Clock, Star, Loader2, Play } from 'lucide-react';
import { useDramaBoxForYou, useDramaBoxLatest, useDramaBoxTrending } from '@/hooks/useDramas';
import Link from 'next/link';
import Image from 'next/image';

export default function BrowsePage() {
  const [activeTab, setActiveTab] = useState<'foryou' | 'trending' | 'latest'>('foryou');
  
  const { data: forYouData, isLoading: forYouLoading } = useDramaBoxForYou();
  const { data: trendingData, isLoading: trendingLoading } = useDramaBoxTrending();
  const { data: latestData, isLoading: latestLoading } = useDramaBoxLatest();

  const isLoading = activeTab === 'foryou' ? forYouLoading : activeTab === 'trending' ? trendingLoading : latestLoading;
  const dramas = activeTab === 'foryou' ? forYouData : activeTab === 'trending' ? trendingData : latestData;

  const tabs = [
    { id: 'foryou', label: 'For You', icon: Star },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'latest', label: 'Latest', icon: Clock },
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24 px-4 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Film className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Browse Dramas</h1>
          </div>
          <p className="text-muted-foreground">
            Discover amazing short dramas from around the world
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card hover:bg-accent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : dramas && dramas.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {dramas.map((drama: any) => (
              <Link
                key={drama.id}
                href={`/drama/dramabox/${drama.id}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-accent mb-3">
                  {drama.cover_url ? (
                    <Image
                      src={drama.cover_url}
                      alt={drama.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {drama.score && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-white font-medium">{drama.score}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                  {drama.title}
                </h3>
                {drama.episode_count && (
                  <p className="text-xs text-muted-foreground">
                    {drama.episode_count} episodes
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Film className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No dramas available</p>
          </div>
        )}
      </div>
    </div>
  );
}
