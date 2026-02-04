"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification, Subscription } from '@/types/features';

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const subscriptionsQuery = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Subscription[];
    },
    enabled: !!user,
  });

  const markAsRead = useMutation({
    mutationFn: async (notification_id: string) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification_id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const subscribe = useMutation({
    mutationFn: async (params: { drama_id: string; platform: string; drama_title: string }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        ...params,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.id] });
    },
  });

  const unsubscribe = useMutation({
    mutationFn: async (params: { drama_id: string; platform: string }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('drama_id', params.drama_id)
        .eq('platform', params.platform);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', user?.id] });
    },
  });

  const isSubscribed = (drama_id: string, platform: string) => {
    return subscriptionsQuery.data?.some(
      (s) => s.drama_id === drama_id && s.platform === platform
    ) ?? false;
  };

  const unreadCount = notificationsQuery.data?.filter((n) => !n.is_read).length ?? 0;

  return {
    notifications: notificationsQuery.data ?? [],
    subscriptions: subscriptionsQuery.data ?? [],
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    subscribe: subscribe.mutate,
    unsubscribe: unsubscribe.mutate,
    isSubscribed,
  };
}
