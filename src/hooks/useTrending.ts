"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DramaStats, FilterOptions } from '@/types/features';

export function useTrending(options?: FilterOptions) {
  return useQuery({
    queryKey: ['trending', options],
    queryFn: async () => {
      let query = supabase
        .from('drama_stats')
        .select('*')
        .gt('view_count', 0);

      if (options?.genre) {
        query = query.ilike('drama_genre', `%${options.genre}%`);
      }

      if (options?.minRating) {
        query = query.gte('avg_rating', options.minRating);
      }

      switch (options?.sortBy) {
        case 'rating':
          query = query.order('avg_rating', { ascending: false });
          break;
        case 'views':
          query = query.order('view_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('updated_at', { ascending: false });
          break;
        case 'popular':
        default:
          query = query
            .order('favorite_count', { ascending: false })
            .order('view_count', { ascending: false });
          break;
      }

      query = query.limit(20);

      const { data, error } = await query;
      if (error) throw error;
      return data as DramaStats[];
    },
  });
}

export function useRecommendations(userId?: string) {
  return useQuery({
    queryKey: ['recommendations', userId],
    queryFn: async () => {
      if (!userId) {
        const { data, error } = await supabase
          .from('drama_stats')
          .select('*')
          .order('avg_rating', { ascending: false })
          .limit(10);
        if (error) throw error;
        return data as DramaStats[];
      }

      const { data: history } = await supabase
        .from('watch_history')
        .select('drama_genre')
        .eq('user_id', userId)
        .not('drama_genre', 'is', null)
        .limit(10);

      const genres = [...new Set((history || []).map((h) => h.drama_genre).filter(Boolean))];

      if (genres.length === 0) {
        const { data, error } = await supabase
          .from('drama_stats')
          .select('*')
          .order('avg_rating', { ascending: false })
          .limit(10);
        if (error) throw error;
        return data as DramaStats[];
      }

      const genreFilter = genres.map((g) => `drama_genre.ilike.%${g}%`).join(',');
      const { data, error } = await supabase
        .from('drama_stats')
        .select('*')
        .or(genreFilter)
        .order('avg_rating', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as DramaStats[];
    },
    enabled: true,
  });
}
