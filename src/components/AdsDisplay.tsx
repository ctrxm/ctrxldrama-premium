"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
}

interface AdsDisplayProps {
  position: 'banner' | 'sidebar' | 'popup' | 'inline' | 'bottom';
  className?: string;
}

export function AdsDisplay({ position, className = '' }: AdsDisplayProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
    
    // Realtime subscription for ads updates
    const channel = supabase
      .channel('ads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ads' },
        () => {
          fetchAds();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [position]);

  useEffect(() => {
    // Auto-rotate ads every 10 seconds
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [ads.length]);

  useEffect(() => {
    // Show popup ad after 3 seconds
    if (position === 'popup' && ads.length > 0 && !showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [position, ads.length, showPopup]);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  // Popup Ad
  if (position === 'popup' && showPopup) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className={`relative max-w-2xl w-full bg-card rounded-xl shadow-2xl overflow-hidden ${className}`}>
          <button
            onClick={() => setShowPopup(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            aria-label="Close ad"
          >
            <X className="w-5 h-5" />
          </button>
          
          <Link href={currentAd.link_url} target="_blank" rel="noopener noreferrer">
            {currentAd.ad_type === 'banner' && currentAd.image_url ? (
              <div className="relative w-full aspect-video">
                <Image
                  src={currentAd.image_url}
                  alt={currentAd.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="p-8 md:p-12">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{currentAd.text_content}</h3>
                {currentAd.description && (
                  <p className="text-muted-foreground mb-6">{currentAd.description}</p>
                )}
                <div className="flex items-center gap-2 text-primary">
                  <span className="font-medium">Learn More</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            )}
          </Link>
        </div>
      </div>
    );
  }

  // Banner Ad
  if (position === 'banner') {
    return (
      <div className={`w-full overflow-hidden rounded-lg ${className}`}>
        <Link href={currentAd.link_url} target="_blank" rel="noopener noreferrer" className="block group">
          {currentAd.ad_type === 'banner' && currentAd.image_url ? (
            <div className="relative w-full aspect-[6/1] md:aspect-[8/1]">
              <Image
                src={currentAd.image_url}
                alt={currentAd.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          ) : (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 md:p-8 border border-border hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold mb-2">{currentAd.text_content}</h3>
                  {currentAd.description && (
                    <p className="text-sm text-muted-foreground">{currentAd.description}</p>
                  )}
                </div>
                <ExternalLink className="w-5 h-5 text-primary flex-shrink-0" />
              </div>
            </div>
          )}
        </Link>
        {ads.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentAdIndex ? 'bg-primary' : 'bg-border'
                }`}
                aria-label={`Show ad ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Sidebar Ad
  if (position === 'sidebar') {
    return (
      <div className={`overflow-hidden rounded-lg ${className}`}>
        <Link href={currentAd.link_url} target="_blank" rel="noopener noreferrer" className="block group">
          {currentAd.ad_type === 'banner' && currentAd.image_url ? (
            <div className="relative w-full aspect-square">
              <Image
                src={currentAd.image_url}
                alt={currentAd.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          ) : (
            <div className="bg-card border border-border hover:border-primary/50 transition-colors p-6">
              <h3 className="font-bold mb-2">{currentAd.text_content}</h3>
              {currentAd.description && (
                <p className="text-sm text-muted-foreground mb-4">{currentAd.description}</p>
              )}
              <div className="flex items-center gap-2 text-primary text-sm">
                <span>Learn More</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          )}
        </Link>
      </div>
    );
  }

  // Inline Ad
  if (position === 'inline') {
    return (
      <div className={`my-8 overflow-hidden rounded-lg ${className}`}>
        <Link href={currentAd.link_url} target="_blank" rel="noopener noreferrer" className="block group">
          {currentAd.ad_type === 'banner' && currentAd.image_url ? (
            <div className="relative w-full aspect-[3/1]">
              <Image
                src={currentAd.image_url}
                alt={currentAd.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          ) : (
            <div className="bg-accent border border-border hover:border-primary/50 transition-colors p-6 text-center">
              <h3 className="text-lg font-bold mb-2">{currentAd.text_content}</h3>
              {currentAd.description && (
                <p className="text-sm text-muted-foreground mb-4">{currentAd.description}</p>
              )}
              <div className="inline-flex items-center gap-2 text-primary">
                <span className="font-medium">Learn More</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          )}
        </Link>
      </div>
    );
  }

  // Bottom Ad
  if (position === 'bottom') {
    return (
      <div className={`fixed bottom-16 md:bottom-0 left-0 right-0 z-40 ${className}`}>
        <div className="container-corporate py-3">
          <div className="relative bg-card border border-border rounded-lg overflow-hidden shadow-lg">
            <button
              onClick={() => setAds([])}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Close ad"
            >
              <X className="w-4 h-4" />
            </button>
            
            <Link href={currentAd.link_url} target="_blank" rel="noopener noreferrer" className="block group">
              {currentAd.ad_type === 'banner' && currentAd.image_url ? (
                <div className="relative w-full h-20 md:h-24">
                  <Image
                    src={currentAd.image_url}
                    alt={currentAd.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm md:text-base truncate">{currentAd.text_content}</h3>
                    {currentAd.description && (
                      <p className="text-xs text-muted-foreground truncate">{currentAd.description}</p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
