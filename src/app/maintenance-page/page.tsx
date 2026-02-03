"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function MaintenancePublicPage() {
  const [message, setMessage] = useState('Site is under maintenance. Please check back later.');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance')
        .select('message')
        .single();

      if (error) throw error;
      if (data) {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error fetching maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="card-corporate p-12">
          <div className="mb-6">
            <AlertTriangle className="w-24 h-24 text-primary mx-auto animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Under Maintenance</h1>
          <p className="text-lg text-muted-foreground mb-8">
            {message}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>We'll be back soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
