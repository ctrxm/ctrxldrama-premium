"use client";

import { useState } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FilterOptions } from '@/types/features';

interface FilterSectionProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  genres?: string[];
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'popular', label: 'Terpopuler' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'rating', label: 'Rating Tertinggi' },
  { value: 'views', label: 'Paling Banyak Ditonton' },
] as const;

const RATING_OPTIONS = [
  { value: 4, label: '4+ Bintang' },
  { value: 3, label: '3+ Bintang' },
  { value: 2, label: '2+ Bintang' },
] as const;

const DEFAULT_GENRES = [
  'Romance',
  'Drama',
  'Action',
  'Comedy',
  'Thriller',
  'Fantasy',
  'Horror',
  'Family',
  'Mystery',
];

export function FilterSection({
  filters,
  onFiltersChange,
  genres = DEFAULT_GENRES,
  className,
}: FilterSectionProps) {
  const activeFiltersCount = [
    filters.genre,
    filters.sortBy && filters.sortBy !== 'popular',
    filters.minRating,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({});
  };

  const updateFilter = (key: keyof FilterOptions, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="w-4 h-4" />
            Filter
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Genre</DropdownMenuLabel>
          {genres.map((genre) => (
            <DropdownMenuItem
              key={genre}
              onClick={() => updateFilter('genre', filters.genre === genre ? undefined : genre)}
              className={cn(filters.genre === genre && 'bg-primary/10')}
            >
              {genre}
              {filters.genre === genre && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Minimum Rating</DropdownMenuLabel>
          {RATING_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() =>
                updateFilter('minRating', filters.minRating === option.value ? undefined : option.value)
              }
              className={cn(filters.minRating === option.value && 'bg-primary/10')}
            >
              {option.label}
              {filters.minRating === option.value && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            Urutkan: {SORT_OPTIONS.find((o) => o.value === (filters.sortBy || 'popular'))?.label}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => updateFilter('sortBy', option.value)}
              className={cn((filters.sortBy || 'popular') === option.value && 'bg-primary/10')}
            >
              {option.label}
              {(filters.sortBy || 'popular') === option.value && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {filters.genre && (
        <Badge variant="secondary" className="gap-1">
          {filters.genre}
          <button onClick={() => updateFilter('genre', undefined)}>
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}

      {filters.minRating && (
        <Badge variant="secondary" className="gap-1">
          {filters.minRating}+ Bintang
          <button onClick={() => updateFilter('minRating', undefined)}>
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}

      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
          Hapus Filter
        </Button>
      )}
    </div>
  );
}
