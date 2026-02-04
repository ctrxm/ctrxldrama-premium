"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Comment } from '@/types/features';

export function useComments(drama_id?: string, platform?: string, episode_id?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['comments', drama_id, platform, episode_id],
    queryFn: async () => {
      if (!drama_id || !platform) return [];
      let query = supabase
        .from('comments')
        .select('*')
        .eq('drama_id', drama_id)
        .eq('platform', platform)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (episode_id) {
        query = query.eq('episode_id', episode_id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const comments = data as Comment[];
      
      if (comments.length > 0) {
        const { data: replies } = await supabase
          .from('comments')
          .select('*')
          .eq('drama_id', drama_id)
          .eq('platform', platform)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });

        const repliesMap = new Map<string, Comment[]>();
        (replies as Comment[] || []).forEach((reply) => {
          if (reply.parent_id) {
            const existing = repliesMap.get(reply.parent_id) || [];
            existing.push(reply);
            repliesMap.set(reply.parent_id, existing);
          }
        });

        comments.forEach((comment) => {
          comment.replies = repliesMap.get(comment.id) || [];
        });
      }

      return comments;
    },
    enabled: !!drama_id && !!platform,
  });

  const addComment = useMutation({
    mutationFn: async (params: { content: string; parent_id?: string }) => {
      if (!user || !drama_id || !platform) throw new Error('Missing required data');
      const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        drama_id,
        platform,
        episode_id,
        content: params.content,
        parent_id: params.parent_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', drama_id, platform, episode_id] });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (comment_id: string) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment_id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', drama_id, platform, episode_id] });
    },
  });

  const likeComment = useMutation({
    mutationFn: async (comment_id: string) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase.from('comment_likes').insert({
        user_id: user.id,
        comment_id,
      });
      if (error && error.code !== '23505') throw error;
      await supabase.rpc('increment_comment_likes', { comment_id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', drama_id, platform, episode_id] });
    },
  });

  const unlikeComment = useMutation({
    mutationFn: async (comment_id: string) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('comment_id', comment_id);
      if (error) throw error;
      await supabase.rpc('decrement_comment_likes', { comment_id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', drama_id, platform, episode_id] });
    },
  });

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    addComment: addComment.mutate,
    deleteComment: deleteComment.mutate,
    likeComment: likeComment.mutate,
    unlikeComment: unlikeComment.mutate,
    isSubmitting: addComment.isPending,
  };
}
