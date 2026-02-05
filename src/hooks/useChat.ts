"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  message: string;
  created_at: string;
}

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (fetchError) {
        if (fetchError.code === 'PGRST205') {
          setError('Chat feature is being set up. Please check back soon!');
          setMessages([]);
        } else {
          throw fetchError;
        }
      } else {
        setMessages(data || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('chat_messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return false;
    
    if (!user) {
      setError('You must be signed in to send messages');
      return false;
    }

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      setError('Session expired. Please sign in again.');
      return false;
    }

    setSending(true);
    try {
      const userName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0] || 
                       'Anonymous';

      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: session.session.user.id,
          user_email: session.session.user.email || '',
          user_name: userName,
          message: messageText.trim(),
        });

      if (insertError) {
        if (insertError.code === 'PGRST204' || insertError.message?.includes('permission denied')) {
          setError('You do not have permission to send messages');
        } else if (insertError.code === 'PGRST205') {
          setError('Chat feature is not available yet');
        } else {
          throw insertError;
        }
        return false;
      }
      setError(null);
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return false;
    } finally {
      setSending(false);
    }
  }, [user]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return false;

    try {
      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      console.error('Error deleting message:', err);
      return false;
    }
  }, [user]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    deleteMessage,
    refetch: fetchMessages,
  };
}
