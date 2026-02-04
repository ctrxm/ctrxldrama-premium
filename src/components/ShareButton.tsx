"use client";

import { useState } from 'react';
import { Share2, Copy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  url?: string;
  description?: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export function ShareButton({
  title,
  url,
  description,
  variant = 'icon',
  className,
}: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${title}${description ? ` - ${description}` : ''}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied');
      setShowMenu(false);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const shareToWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      '_blank'
    );
    setShowMenu(false);
  };

  const shareToTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
    setShowMenu(false);
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          variant === 'icon' ? 'btn-icon bg-black/50' : 'btn-secondary gap-2',
          className
        )}
      >
        <Share2 className="w-4 h-4" />
        {variant === 'button' && 'Share'}
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 bg-card border border-border z-50 min-w-[160px]">
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
            <button
              onClick={shareToWhatsApp}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              WhatsApp
            </button>
            <button
              onClick={shareToTelegram}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              Telegram
            </button>
            <button
              onClick={shareToTwitter}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
            >
              Twitter / X
            </button>
          </div>
        </>
      )}
    </div>
  );
}
