"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, Bookmark, Trash2, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface BookmarkItem {
  id: string;
  drama_title: string;
  drama_image: string | null;
  drama_source: string;
  drama_id: string;
  created_at: string;
}

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchBookmarks();
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const clearAllBookmarks = async () => {
    if (!confirm('Hapus semua bookmark?')) return;
    
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;
      fetchBookmarks();
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 px-4 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">My Bookmarks</h1>
            </div>
            <p className="text-muted-foreground">
              {bookmarks.length} drama{bookmarks.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          {bookmarks.length > 0 && (
            <button
              onClick={clearAllBookmarks}
              className="px-4 py-2 text-sm rounded-lg border border-destructive/20 hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden md:inline">Clear All</span>
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="card-corporate p-12 text-center">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
            <p className="text-muted-foreground mb-6">
              Start adding dramas to your bookmarks to watch them later
            </p>
            <Link
              href="/browse"
              className="btn-corporate inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Browse Dramas
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {bookmarks.map((item) => (
              <div key={item.id} className="group relative">
                <Link href={`/drama/${item.drama_source}/${item.drama_id}`}>
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-accent mb-3">
                    {item.drama_image ? (
                      <Image
                        src={item.drama_image}
                        alt={item.drama_title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                      {item.drama_title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteBookmark(item.id)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors flex-shrink-0"
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
