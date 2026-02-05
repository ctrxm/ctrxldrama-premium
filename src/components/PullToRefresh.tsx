"use client";

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const threshold = 80;

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY === 0);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAtTop && window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [isAtTop]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing || !isAtTop) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0 && window.scrollY === 0) {
      e.preventDefault();
      const distance = Math.min(diff * 0.4, threshold * 1.5);
      setPullDistance(distance);
    }
  }, [isPulling, isRefreshing, isAtTop]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }
      setIsRefreshing(false);
    }
    
    setIsPulling(false);
    setPullDistance(0);
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-center transition-all duration-200 pointer-events-none"
        style={{ 
          top: pullDistance > 0 ? `${80 + pullDistance}px` : '40px',
          opacity: progress,
          transform: `translateX(-50%) scale(${0.8 + progress * 0.2})`
        }}
      >
        <div className={`w-12 h-12 rounded-full bg-violet-500/20 backdrop-blur-md border border-violet-500/30 flex items-center justify-center shadow-lg ${isRefreshing ? 'animate-spin' : ''}`}>
          {isRefreshing ? (
            <RefreshCw className="w-5 h-5 text-violet-400" />
          ) : (
            <div 
              className="relative w-7 h-7"
              style={{ transform: `rotate(${progress * 360}deg)` }}
            >
              <Image
                src="/logo.png"
                alt="Pull to refresh"
                fill
                className="object-contain"
                sizes="28px"
              />
            </div>
          )}
        </div>
      </div>

      <div 
        style={{ 
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {children}
      </div>

      {isRefreshing && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-violet-500/90 backdrop-blur-sm text-white text-sm font-medium flex items-center gap-2 shadow-lg">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Refreshing...
        </div>
      )}
    </div>
  );
}
