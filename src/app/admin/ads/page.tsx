"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, Edit, Eye, EyeOff, Image as ImageIcon, Type } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  image_url: string | null;
  link_url: string;
  position: 'banner' | 'sidebar' | 'popup' | 'inline' | 'bottom';
  ad_type: 'banner' | 'text';
  text_content: string | null;
  description: string | null;
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
    position: 'banner' as 'banner' | 'sidebar' | 'popup' | 'inline' | 'bottom',
    ad_type: 'banner' as 'banner' | 'text',
    text_content: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/');
      } else if (!isAdmin) {
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
      const adData = {
        ...formData,
        image_url: formData.ad_type === 'banner' ? formData.image_url : null,
        text_content: formData.ad_type === 'text' ? formData.text_content : null,
        description: formData.ad_type === 'text' ? formData.description : null,
      };

      if (editingAd) {
        const { error } = await supabase
          .from('ads')
          .update(adData)
          .eq('id', editingAd.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ads')
          .insert([adData]);

        if (error) throw error;
      }

      setShowForm(false);
      setEditingAd(null);
      resetForm();
      fetchAds();
    } catch (error) {
      console.error('Error saving ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      position: 'banner',
      ad_type: 'banner',
      text_content: '',
      description: '',
      is_active: true,
    });
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
      image_url: ad.image_url || '',
      link_url: ad.link_url,
      position: ad.position,
      ad_type: ad.ad_type || 'banner',
      text_content: ad.text_content || '',
      description: ad.description || '',
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
    <div className="min-h-screen pt-20 md:pt-24 px-3 md:px-4 pb-6 md:pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Ads Management</h1>
            <p className="text-sm md:text-base text-muted-foreground">Create and manage advertisements</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingAd(null);
              resetForm();
            }}
            className="btn-corporate flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Create Ad
          </button>
        </div>

        {/* Ad Form */}
        {showForm && (
          <div className="card-corporate p-4 md:p-6 mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">
              {editingAd ? 'Edit Ad' : 'Create New Ad'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Ad Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Ad Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, ad_type: 'banner' })}
                    className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                      formData.ad_type === 'banner'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <ImageIcon className="w-6 h-6" />
                    <span className="font-medium">Banner</span>
                    <span className="text-xs text-muted-foreground">Image-based ad</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, ad_type: 'text' })}
                    className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                      formData.ad_type === 'text'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Type className="w-6 h-6" />
                    <span className="font-medium">Text</span>
                    <span className="text-xs text-muted-foreground">Text-based ad</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="search-input"
                  placeholder="Ad title"
                />
              </div>

              {formData.ad_type === 'banner' ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL *</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    required={formData.ad_type === 'banner'}
                    className="search-input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Text Content *</label>
                    <textarea
                      value={formData.text_content}
                      onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                      required={formData.ad_type === 'text'}
                      rows={3}
                      className="search-input resize-none"
                      placeholder="Main ad text content"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="search-input resize-none"
                      placeholder="Additional description (optional)"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Link URL *</label>
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
                  <option value="banner">Banner (Top)</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="popup">Popup</option>
                  <option value="inline">Inline (Content)</option>
                  <option value="bottom">Bottom</option>
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

              <div className="flex flex-col md:flex-row gap-3">
                <button type="submit" className="btn-corporate flex-1 md:flex-initial">
                  {editingAd ? 'Update Ad' : 'Create Ad'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAd(null);
                    resetForm();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="card-corporate p-4 md:p-6">
              {ad.ad_type === 'banner' && ad.image_url ? (
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full p-6 bg-accent rounded-lg mb-4 min-h-[160px] flex flex-col justify-center">
                  <Type className="w-8 h-8 mb-3 text-primary" />
                  <p className="font-medium mb-2">{ad.text_content}</p>
                  {ad.description && (
                    <p className="text-sm text-muted-foreground">{ad.description}</p>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  ad.ad_type === 'banner' 
                    ? 'bg-blue-500/10 text-blue-500' 
                    : 'bg-purple-500/10 text-purple-500'
                }`}>
                  {ad.ad_type === 'banner' ? 'Banner' : 'Text'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  ad.is_active 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {ad.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="font-bold mb-2">{ad.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Position: {ad.position}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(ad)}
                  className="flex-1 px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors flex items-center justify-center gap-2"
                  title={ad.is_active ? 'Deactivate' : 'Activate'}
                >
                  {ad.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(ad)}
                  className="flex-1 px-3 py-2 rounded-lg border border-border hover:bg-accent transition-colors flex items-center justify-center gap-2"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="flex-1 px-3 py-2 rounded-lg border border-destructive/20 hover:bg-destructive/10 text-destructive transition-colors flex items-center justify-center gap-2"
                  title="Delete"
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
