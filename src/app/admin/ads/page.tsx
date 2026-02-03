"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, Edit, Eye, EyeOff } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  position: 'banner' | 'sidebar' | 'popup';
  is_active: boolean;
  created_at: string;
}

export default function AdsManagement() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 'banner' as 'banner' | 'sidebar' | 'popup',
    is_active: true,
  });

  useEffect(() => {
    // Only redirect if auth is fully loaded and user is confirmed not admin
    if (!authLoading) {
      if (!user) {
        // No user logged in, redirect to home
        router.push('/');
      } else if (!isAdmin) {
        // User logged in but not admin, redirect to home
        router.push('/');
      }
    }
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchAds();
    }
  }, [isAdmin]);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAd) {
        const { error } = await supabase
          .from('ads')
          .update(formData)
          .eq('id', editingAd.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ads')
          .insert([formData]);

        if (error) throw error;
      }

      setShowForm(false);
      setEditingAd(null);
      setFormData({
        title: '',
        image_url: '',
        link_url: '',
        position: 'banner',
        is_active: true,
      });
      fetchAds();
    } catch (error) {
      console.error('Error saving ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
    }
  };

  const toggleActive = async (ad: Ad) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ is_active: !ad.is_active })
        .eq('id', ad.id);

      if (error) throw error;
      fetchAds();
    } catch (error) {
      console.error('Error toggling ad:', error);
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image_url: ad.image_url,
      link_url: ad.link_url,
      position: ad.position,
      is_active: ad.is_active,
    });
    setShowForm(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ads Management</h1>
            <p className="text-muted-foreground">Create and manage advertisements</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingAd(null);
              setFormData({
                title: '',
                image_url: '',
                link_url: '',
                position: 'banner',
                is_active: true,
              });
            }}
            className="btn-corporate flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Ad
          </button>
        </div>

        {/* Ad Form */}
        {showForm && (
          <div className="card-corporate p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">
              {editingAd ? 'Edit Ad' : 'Create New Ad'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="search-input"
                  placeholder="Ad title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                  className="search-input"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Link URL</label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  required
                  className="search-input"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Position</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                  className="search-input"
                >
                  <option value="banner">Banner</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="popup">Popup</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Active
                </label>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-corporate">
                  {editingAd ? 'Update Ad' : 'Create Ad'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAd(null);
                  }}
                  className="px-6 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ads List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="card-corporate p-6">
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h3 className="font-bold mb-2">{ad.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Position: {ad.position}
              </p>
              <div className="flex items-center gap-2 mb-4">
                {ad.is_active ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                    Active
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-500">
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(ad)}
                  className="flex-1 px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors flex items-center justify-center gap-2"
                >
                  {ad.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(ad)}
                  className="flex-1 px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="flex-1 px-3 py-2 rounded-lg border border-destructive/20 hover:bg-destructive/10 text-destructive transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {ads.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No ads created yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
