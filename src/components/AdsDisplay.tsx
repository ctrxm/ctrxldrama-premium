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
  const [popupDismissed, setPopupDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
    
    // Check if popup was dismissed in this session
    if (position === 'popup') {
      const dismissed = sessionStorage.getItem('popup-ad-dismissed');
      if (dismissed === 'true') {
        setPopupDismissed(true);
      }
    }
    
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
    // Show popup ad after 3 seconds (only if not dismissed)
    if (position === 'popup' && ads.length > 0 && !showPopup && !popupDismissed) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [position, ads.length, showPopup, popupDismissed]);

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

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupDismissed(true);
    sessionStorage.setItem('popup-ad-dismissed', 'true');
  };

  const handleCloseBottom = () => {
    setAds([]);
    sessionStorage.setItem(`bottom-ad-dismissed-${currentAd?.id}`, 'true');
  };

  if (loading || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  // Check if bottom ad was dismissed
  if (position === 'bottom') {
    const dismissed = sessionStorage.getItem(`bottom-ad-dismissed-${currentAd?.id}`);
    if (dismissed === 'true') {
      return null;
    }
  }

  // AdSense-style "Ad" badge component
  const AdBadge = () => (
    <div className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border rounded">
      Ad
    </div>
  );

  // Popup Ad
  if (position === 'popup' && showPopup && !popupDismissed) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className={`relative max-w-2xl w-full bg-background rounded-lg shadow-2xl overflow-hidden border border-border ${className}`}>
          <button
            onClick={handleClosePopup}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-md bg-background/80 hover:bg-accent border border-border transition-colors"
            aria-label="Close ad"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="p-3 border-b border-border flex items-center justify-between">
            <AdBadge />
            <span className="text-xs text-muted-foreground">Advertisement</span>
          </div>

          <Link href={currentAd.link_url} target="_blank" rel="noopener noreferrer" className="block group">
            {currentAd.ad_type === 'banner' && currentAd.image_url ? (
              <div className="relative w-full aspect-video bg-accent">
                <Image
                  src={currentAd.image_url}
                  alt={currentAd.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="p-8 md:p-12 hover:bg-accent/50 transition-colors">
                <h3 className="text-xl md:text-2xl font-semibold mb-3 text-foreground">{currentAd.text_content}</h3>
                {currentAd.description && (
                  <p className="text-muted-foreground mb-4 leading-relaxed">{currentAd.description}</p>
                )}
                <div className="inline-flex items-center gap-2 text-primary text-sm font-medium">
                  <span>Learn More</span>
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
      <div className={`w-full overflow-hidden ${className}`}>
        <div className="mb-2">
          <AdBadge />
        </div>
        <Link 
          href={currentAd.link_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block group border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors bg-background"
        >
          {currentAd.ad_type === 'banner' && currentAd.image_url ? (
            <div className="relative w-full aspect-[6/1] md:aspect-[8/1] bg-accent">
              <Image
                src={currentAd.image_url}
                alt={currentAd.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="p-6 md:p-8 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold mb-1.5 text-foreground">{currentAd.text_content}</h3>
                  {currentAd.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{currentAd.description}</p>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
              </div>
            </div>
          )}
        </Link>
        {ads.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
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
      <div className={`overflow-hidden ${className}`}>
        <div className="mb-2">
          <AdBadge />
        </div>
        <Link 
          href={currentAd.link_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block group border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors bg-background"
        >
          {currentAd.ad_type === 'banner' && currentAd.image_url ? (
            <div className="relative w-full aspect-square bg-accent">
              <Image
                src={currentAd.image_url}
                alt={currentAd.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="p-6 hover:bg-accent/50 transition-colors">
              <h3 className="font-semibold mb-2 text-foreground">{currentAd.text_content}</h3>
              {currentAd.description && (
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{currentAd.description}</p>
              )}
              <div className="inline-flex items-center gap-2 text-primary text-sm">
                <span>Learn More</span>
                <ExternalLink className="w-3.5 h-3.5" />
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
      <div className={`my-8 ${className}`}>
        <div className="mb-2 text-center">
          <AdBadge />
        </div>
        <Link 
          href={currentAd.link_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block group border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors bg-background"
        >
          {currentAd.ad_type === 'banner' && currentAd.image_url ? (
            <div className="relative w-full aspect-[3/1] bg-accent">
              <Image
                src={currentAd.image_url}
                alt={currentAd.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="p-8 text-center hover:bg-accent/50 transition-colors">
              <h3 className="text-lg font-semibold mb-2 text-foreground">{currentAd.text_content}</h3>
              {currentAd.description && (
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-2xl mx-auto">{currentAd.description}</p>
              )}
              <div className="inline-flex items-center gap-2 text-primary font-medium">
                <span>Learn More</span>
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
        <div className="container-corporate py-2">
          <div className="relative bg-background border border-border rounded-lg overflow-hidden shadow-lg">
            <div className="absolute top-2 left-2 z-10">
              <AdBadge />
            </div>
            <button
              onClick={handleCloseBottom}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-background/80 hover:bg-accent border border-border transition-colors"
              aria-label="Close ad"
            >
              <X className="w-4 h-4" />
            </button>
            
            <Link 
              href={currentAd.link_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block group pt-8"
            >
              {currentAd.ad_type === 'banner' && currentAd.image_url ? (
                <div className="relative w-full h-20 md:h-24 bg-accent">
                  <Image
                    src={currentAd.image_url}
                    alt={currentAd.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="p-4 flex items-center justify-between gap-4 hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm md:text-base truncate text-foreground">{currentAd.text_content}</h3>
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
