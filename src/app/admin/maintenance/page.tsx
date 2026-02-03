"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertTriangle } from 'lucide-react';

interface Maintenance {
  id: string;
  is_active: boolean;
  message: string;
}

export default function MaintenancePage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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
      fetchMaintenance();
    }
  }, [isAdmin]);

  const fetchMaintenance = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance')
        .select('*')
        .single();

      if (error) throw error;
      setMaintenance(data);
      setMessage(data.message);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenance = async () => {
    if (!maintenance) return;

    try {
      const { error } = await supabase
        .from('maintenance')
        .update({ is_active: !maintenance.is_active })
        .eq('id', maintenance.id);

      if (error) throw error;
      fetchMaintenance();
    } catch (error) {
      console.error('Error toggling maintenance:', error);
    }
  };

  const updateMessage = async () => {
    if (!maintenance) return;

    try {
      const { error } = await supabase
        .from('maintenance')
        .update({ message })
        .eq('id', maintenance.id);

      if (error) throw error;
      alert('Message updated successfully');
    } catch (error) {
      console.error('Error updating message:', error);
    }
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Maintenance Mode</h1>
          <p className="text-muted-foreground">Control site maintenance status</p>
        </div>

        <div className="card-corporate p-8">
          {/* Status Toggle */}
          <div className="mb-8">
            <div className="flex items-center justify-between p-6 rounded-lg border border-border">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${maintenance?.is_active ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                  <AlertTriangle className={`w-6 h-6 ${maintenance?.is_active ? 'text-red-500' : 'text-green-500'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {maintenance?.is_active ? 'Maintenance Active' : 'Site Online'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {maintenance?.is_active 
                      ? 'Users will see the maintenance page' 
                      : 'Site is accessible to all users'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleMaintenance}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  maintenance?.is_active
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {maintenance?.is_active ? 'Disable Maintenance' : 'Enable Maintenance'}
              </button>
            </div>
          </div>

          {/* Message Editor */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Maintenance Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="search-input resize-none"
              placeholder="Enter maintenance message..."
            />
            <button
              onClick={updateMessage}
              className="btn-corporate mt-4"
            >
              Update Message
            </button>
          </div>

          {/* Preview */}
          <div className="mt-8">
            <h3 className="font-bold mb-4">Preview</h3>
            <div className="p-8 rounded-lg border-2 border-dashed border-border bg-accent/50">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Under Maintenance</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
