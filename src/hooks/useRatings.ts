"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Rating } from '@/types/features';

export function useRatings(drama_id?: string, platform?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const ratingsQuery = useQuery({
    queryKey: ['ratings', drama_id, platform],
    queryFn: async () => {
      if (!drama_id || !platform) return [];
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('drama_id', drama_id)
        .eq('platform', platform)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Rating[];
    },
    enabled: !!drama_id && !!platform,
  });

  const userRatingQuery = useQuery({
    queryKey: ['user_rating', user?.id, drama_id, platform],
    queryFn: async () => {
      if (!user || !drama_id || !platform) return null;
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', user.id)
        .eq('drama_id', drama_id)
        .eq('platform', platform)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as Rating | null;
    },
    enabled: !!user && !!drama_id && !!platform,
  });

  const submitRating = useMutation({
    mutationFn: async (params: { rating: number; review?: string }) => {
      if (!user || !drama_id || !platform) throw new Error('Missing required data');
      const { error } = await supabase.from('ratings').upsert(
        {
          user_id: user.id,
          drama_id,
          platform,
          rating: params.rating,
          review: params.review,
        },
        { onConflict: 'user_id,drama_id,platform' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings', drama_id, platform] });
      queryClient.invalidateQueries({ queryKey: ['user_rating', user?.id, drama_id, platform] });
      queryClient.invalidateQueries({ queryKey: ['drama_stats'] });
    },
  });

  const deleteRating = useMutation({
    mutationFn: async () => {
      if (!user || !drama_id || !platform) throw new Error('Missing required data');
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('user_id', user.id)
        .eq('drama_id', drama_id)
        .eq('platform', platform);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings', drama_id, platform] });
      queryClient.invalidateQueries({ queryKey: ['user_rating', user?.id, drama_id, platform] });
      queryClient.invalidateQueries({ queryKey: ['drama_stats'] });
    },
  });

  const averageRating = ratingsQuery.data?.length
    ? ratingsQuery.data.reduce((sum, r) => sum + r.rating, 0) / ratingsQuery.data.length
    : 0;

  return {
    ratings: ratingsQuery.data ?? [],
    userRating: userRatingQuery.data,
    averageRating,
    totalRatings: ratingsQuery.data?.length ?? 0,
    isLoading: ratingsQuery.isLoading,
    submitRating: submitRating.mutate,
    deleteRating: deleteRating.mutate,
    isSubmitting: submitRating.isPending,
  };
}
