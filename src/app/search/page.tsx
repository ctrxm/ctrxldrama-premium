"use client";

import { useState } from 'react';
import { Search as SearchIcon, Loader2, Play } from 'lucide-react';
import { useSearchDramas } from '@/hooks/useDramas';
import { usePlatform } from '@/hooks/usePlatform';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import Image from 'next/image';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { platformInfo } = usePlatform();
  
  const { data: results, isLoading } = useSearchDramas(debouncedQuery.trim());

  return (
    <div className="min-h-screen pt-20 md:pt-24 px-4 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Search Dramas</h1>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${platformInfo.name}...`}
              className="search-input pl-12 text-lg"
              autoFocus
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Searching in: <span className="text-primary font-medium">{platformInfo.name}</span>
          </p>
        </div>

        {/* Search Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : searchQuery.trim() === '' ? (
          <div className="text-center py-20">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Start typing to search for dramas</p>
          </div>
        ) : results && results.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((drama: any) => (
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
          </>
        ) : (
          <div className="text-center py-20">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
