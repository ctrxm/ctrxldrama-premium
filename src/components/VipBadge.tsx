"use client";

import { Crown } from 'lucide-react';
import { useVipStatus } from '@/hooks/useVipStatus';
import Link from 'next/link';

interface VipBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showUpgrade?: boolean;
  className?: string;
}

export function VipBadge({ size = 'sm', showUpgrade = false, className = '' }: VipBadgeProps) {
  const { isVip, loading } = useVipStatus();

  if (loading) return null;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    md: 'text-xs px-2 py-1 gap-1',
    lg: 'text-sm px-3 py-1.5 gap-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  if (isVip) {
    return (
      <span className={`inline-flex items-center ${sizeClasses[size]} rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold ${className}`}>
        <Crown className={iconSizes[size]} />
        VIP
      </span>
    );
  }

  if (showUpgrade) {
    return (
      <Link
        href="/vip"
        className={`inline-flex items-center ${sizeClasses[size]} rounded-full bg-white/5 hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-500 text-muted-foreground hover:text-white font-medium transition-all ${className}`}
      >
        <Crown className={iconSizes[size]} />
        Upgrade VIP
      </Link>
    );
  }

  return null;
}

export function VipIndicator({ isVip }: { isVip?: boolean }) {
  if (!isVip) return null;
  
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold">
      <Crown className="w-2.5 h-2.5" />
      VIP
    </span>
  );
}
