"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { WatchHistory } from '@/types/features';

export function useWatchHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['watch_history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as WatchHistory[];
    },
    enabled: !!user,
  });

  const updateHistory = useMutation({
    mutationFn: async (params: {
      drama_id: string;
      platform: string;
      drama_title: string;
      drama_cover?: string;
      episode_id?: string;
      episode_number?: number;
      watch_position?: number;
      duration?: number;
    }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase.from('watch_history').upsert(
        {
          user_id: user.id,
          drama_id: params.drama_id,
          platform: params.platform,
          drama_title: params.drama_title,
          drama_cover: params.drama_cover,
          episode_id: params.episode_id,
          episode_number: params.episode_number ?? 1,
          watch_position: params.watch_position ?? 0,
          duration: params.duration ?? 0,
          last_watched_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,drama_id,platform,episode_id',
        }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch_history', user?.id] });
    },
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch_history', user?.id] });
    },
  });

  const removeFromHistory = useMutation({
    mutationFn: async (params: { drama_id: string; platform: string }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', user.id)
        .eq('drama_id', params.drama_id)
        .eq('platform', params.platform);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch_history', user?.id] });
    },
  });

  const getResumePosition = (drama_id: string, platform: string, episode_id?: string) => {
    const entry = historyQuery.data?.find(
      (h) =>
        h.drama_id === drama_id &&
        h.platform === platform &&
        (episode_id ? h.episode_id === episode_id : true)
    );
    return entry ? { position: entry.watch_position, episode: entry.episode_number } : null;
  };

  const getRecentlyWatched = (limit = 10) => {
    const uniqueDramas = new Map<string, WatchHistory>();
    historyQuery.data?.forEach((h) => {
      const key = `${h.drama_id}-${h.platform}`;
      if (!uniqueDramas.has(key) || new Date(h.last_watched_at) > new Date(uniqueDramas.get(key)!.last_watched_at)) {
        uniqueDramas.set(key, h);
      }
    });
    return Array.from(uniqueDramas.values()).slice(0, limit);
  };

  return {
    history: historyQuery.data ?? [],
    isLoading: historyQuery.isLoading,
    updateHistory: updateHistory.mutate,
    clearHistory: clearHistory.mutate,
    removeFromHistory: removeFromHistory.mutate,
    getResumePosition,
    getRecentlyWatched,
  };
}
