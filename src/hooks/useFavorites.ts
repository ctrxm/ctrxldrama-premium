"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Favorite } from '@/types/features';

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Favorite[];
    },
    enabled: !!user,
  });

  const addFavorite = useMutation({
    mutationFn: async (params: {
      drama_id: string;
      platform: string;
      drama_title: string;
      drama_cover?: string;
      drama_genre?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        ...params,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (params: { drama_id: string; platform: string }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('drama_id', params.drama_id)
        .eq('platform', params.platform);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const isFavorite = (drama_id: string, platform: string) => {
    return favoritesQuery.data?.some(
      (f) => f.drama_id === drama_id && f.platform === platform
    ) ?? false;
  };

  const toggleFavorite = async (params: {
    drama_id: string;
    platform: string;
    drama_title: string;
    drama_cover?: string;
    drama_genre?: string;
  }) => {
    if (isFavorite(params.drama_id, params.platform)) {
      await removeFavorite.mutateAsync({ drama_id: params.drama_id, platform: params.platform });
    } else {
      await addFavorite.mutateAsync(params);
    }
  };

  return {
    favorites: favoritesQuery.data ?? [],
    isLoading: favoritesQuery.isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
    isToggling: addFavorite.isPending || removeFavorite.isPending,
  };
}
