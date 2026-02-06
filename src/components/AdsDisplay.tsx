"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X } from 'lucide-react';
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

  // Google AdSense-style container wrapper
  const AdContainer = ({ children, showBadge = true }: { children: React.ReactNode; showBadge?: boolean }) => (
    <div className="relative">
      {showBadge && (
        <div className="absolute -top-4 right-0 z-10">
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-normal text-gray-500 dark:text-gray-400">
            <svg className="w-2.5 h-2.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.75 11.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zM8 10a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v4.5A.75.75 0 0 1 8 10z"/>
            </svg>
            <span>Ad</span>
          </div>
        </div>
      )}
      <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-sm overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );

  // Popup Ad
  if (position === 'popup' && showPopup && !popupDismissed) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="relative max-w-2xl w-full">
          <button
            onClick={handleClosePopup}
            className="absolute -top-10 right-0 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-lg"
            aria-label="Close ad"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <AdContainer showBadge={false}>
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-1.5">
                <svg className="w-3 h-3 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.75 11.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zM8 10a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v4.5A.75.75 0 0 1 8 10z"/>
                </svg>
                <span className="text-[10px] text-gray-600 dark:text-gray-400 font-normal">Advertisement</span>
              </div>
            </div>

            <Link href={currentAd.link_url} target="_blank" rel="noopener noreferrer" className="block">
              {currentAd.ad_type === 'banner' && currentAd.image_url ? (
                <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={currentAd.image_url}
                    alt={currentAd.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="p-8 md:p-12 bg-white dark:bg-gray-900">
                  <h3 className="text-lg md:text-xl font-normal mb-2 text-gray-900 dark:text-gray-100">{currentAd.text_content}</h3>
                  {currentAd.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{currentAd.description}</p>
                  )}
                </div>
              )}
            </Link>
          </AdContainer>
        </div>
      </div>
    );
  }

  // Banner Ad
  if (position === 'banner') {
    return (
      <div className={`w-full ${className}`}>
        <AdContainer>
          <Link href={currentAd.link_url} target="_blank" rel="noopener noreferrer" className="block">
            {currentAd.ad_type === 'banner' && currentAd.image_url ? (
              <div className="relative w-full aspect-[6/1] md:aspect-[8/1] bg-gray-100 dark:bg-gray-800">
                <Image
                  src={currentAd.image_url}
                  alt={currentAd.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="p-4 md:p-6 bg-white dark:bg-gray-900">
                <h3 className="text-sm md:text-base font-normal mb-1 text-gray-900 dark:text-gray-100">{currentAd.text_content}</h3>
                {currentAd.description && (
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{currentAd.description}</p>
                )}
              </div>
            )}
          </Link>
        </AdContainer>
        {ads.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-2">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentAdIndex ? 'bg-gray-400' : 'bg-gray-300 dark:bg-gray-600'
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
      <div className={`${className}`}>
        <AdContainer>
          <Link href={currentAd.link_url} target="_blank" rel="noopener noreferrer" className="block">
            {currentAd.ad_type === 'banner' && currentAd.image_url ? (
              <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800">
                <Image
                  src={currentAd.image_url}
                  alt={currentAd.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="p-4 bg-white dark:bg-gray-900">
                <h3 className="text-sm font-normal mb-1.5 text-gray-900 dark:text-gray-100">{currentAd.text_content}</h3>
                {currentAd.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{currentAd.description}</p>
                )}
              </div>
            )}
          </Link>
        </AdContainer>
      </div>
    );
  }

  // Inline Ad
  if (position === 'inline') {
    return (
      <div className={`my-8 flex justify-center ${className}`}>
        <div className="w-full max-w-4xl">
          <AdContainer>
            <Link href={currentAd.link_url} target="_blank" rel="noopener noreferrer" className="block">
              {currentAd.ad_type === 'banner' && currentAd.image_url ? (
                <div className="relative w-full aspect-[3/1] bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={currentAd.image_url}
                    alt={currentAd.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="p-6 md:p-8 text-center bg-white dark:bg-gray-900">
                  <h3 className="text-base md:text-lg font-normal mb-2 text-gray-900 dark:text-gray-100">{currentAd.text_content}</h3>
                  {currentAd.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{currentAd.description}</p>
                  )}
                </div>
              )}
            </Link>
          </AdContainer>
        </div>
      </div>
    );
  }

  // Bottom Ad
  if (position === 'bottom') {
    return (
      <div className={`fixed bottom-16 md:bottom-0 left-0 right-0 z-40 ${className}`}>
        <div className="container-corporate py-2">
          <div className="relative">
            <button
              onClick={handleCloseBottom}
              className="absolute -top-8 right-2 z-10 p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-md"
              aria-label="Close ad"
            >
              <X className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            
            <AdContainer showBadge={false}>
              <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-1.5">
                  <svg className="w-2.5 h-2.5 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.75 11.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zM8 10a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v4.5A.75.75 0 0 1 8 10z"/>
                  </svg>
                  <span className="text-[9px] text-gray-600 dark:text-gray-400 font-normal">Ad</span>
                </div>
              </div>

              <Link href={currentAd.link_url} target="_blank" rel="noopener noreferrer" className="block">
                {currentAd.ad_type === 'banner' && currentAd.image_url ? (
                  <div className="relative w-full h-20 md:h-24 bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={currentAd.image_url}
                      alt={currentAd.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-3 md:p-4 bg-white dark:bg-gray-900">
                    <h3 className="text-sm font-normal mb-0.5 text-gray-900 dark:text-gray-100 truncate">{currentAd.text_content}</h3>
                    {currentAd.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{currentAd.description}</p>
                    )}
                  </div>
                )}
              </Link>
            </AdContainer>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
