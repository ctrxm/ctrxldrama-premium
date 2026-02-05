"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Trash2, LogIn } from 'lucide-react';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

function MessageBubble({ 
  message, 
  isOwn, 
  onDelete 
}: { 
  message: ChatMessage; 
  isOwn: boolean;
  onDelete?: () => void;
}) {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] sm:max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs font-medium text-violet-400">
            {message.user_name || message.user_email.split('@')[0]}
          </span>
          <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          {isOwn && onDelete && (
            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isOwn
              ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-tr-md'
              : 'bg-card border border-white/5 text-foreground rounded-tl-md'
          }`}
        >
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.message}</p>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const { messages, loading, sending, error, sendMessage, deleteMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-8 flex flex-col">
      <div className="container-main flex-1 flex flex-col max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Community Chat</h1>
              <p className="text-sm text-muted-foreground">
                {messages.length} messages
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-background/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-[300px] max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No messages yet</h3>
                <p className="text-sm text-muted-foreground">Be the first to start a conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={user?.id === msg.user_id}
                    onDelete={user?.id === msg.user_id ? () => deleteMessage(msg.id) : undefined}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="border-t border-white/5 p-4 bg-card/50">
            {user ? (
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  maxLength={500}
                  className="flex-1 bg-background/80 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-2">
                <p className="text-sm text-muted-foreground">Sign in to join the conversation</p>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
