"use client";

import { useState } from 'react';
import { MessageCircle, ThumbsUp, Trash2, Reply, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Comment } from '@/types/features';

interface CommentsSectionProps {
  drama_id: string;
  platform: string;
  episode_id?: string;
  className?: string;
}

function CommentItem({
  comment,
  onReply,
  onDelete,
  onLike,
  currentUserId,
}: {
  comment: Comment;
  onReply: (parentId: string) => void;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  currentUserId?: string;
}) {
  const isOwner = currentUserId === comment.user_id;

  return (
    <div className="flex gap-3">
      <Avatar className="w-8 h-8">
        <AvatarFallback className="text-xs">
          {comment.user_email?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">
            {comment.user_email?.split('@')[0] || 'Pengguna'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: id })}
          </span>
        </div>
        <p className="text-sm text-foreground mb-2">{comment.content}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onLike(comment.id)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ThumbsUp className={cn('w-3.5 h-3.5', comment.is_liked && 'fill-primary text-primary')} />
            <span>{comment.likes_count}</span>
          </button>
          <button
            onClick={() => onReply(comment.id)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Balas</span>
          </button>
          {isOwner && (
            <button
              onClick={() => onDelete(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 pl-4 border-l-2 border-muted space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onDelete={onDelete}
                onLike={onLike}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentsSection({
  drama_id,
  platform,
  episode_id,
  className,
}: CommentsSectionProps) {
  const { user } = useAuth();
  const { comments, isLoading, addComment, deleteComment, likeComment, isSubmitting } = useComments(
    drama_id,
    platform,
    episode_id
  );
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Komentar tidak boleh kosong');
      return;
    }
    addComment(
      { content: newComment, parent_id: replyTo || undefined },
      {
        onSuccess: () => {
          setNewComment('');
          setReplyTo(null);
          toast.success('Komentar berhasil ditambahkan');
        },
        onError: () => toast.error('Gagal menambahkan komentar'),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus komentar ini?')) {
      deleteComment(id, {
        onSuccess: () => toast.success('Komentar dihapus'),
        onError: () => toast.error('Gagal menghapus komentar'),
      });
    }
  };

  const handleLike = (id: string) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }
    likeComment(id);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        <h3 className="font-semibold">Komentar ({comments.length})</h3>
      </div>

      <div className="flex flex-col gap-2">
        {replyTo && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Membalas komentar</span>
            <button
              onClick={() => setReplyTo(null)}
              className="text-primary hover:underline"
            >
              Batal
            </button>
          </div>
        )}
        <Textarea
          placeholder={user ? 'Tulis komentar...' : 'Login untuk berkomentar'}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!user}
          rows={2}
        />
        <Button
          onClick={handleSubmit}
          disabled={!user || isSubmitting || !newComment.trim()}
          className="self-end"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Kirim
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Belum ada komentar. Jadilah yang pertama!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={setReplyTo}
              onDelete={handleDelete}
              onLike={handleLike}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
