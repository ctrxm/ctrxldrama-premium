"use client";

import { Share2, Facebook, Twitter, Link2, MessageCircle, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${title}${description ? ` - ${description}` : ''}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Gagal membagikan');
        }
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link disalin ke clipboard');
    } catch {
      toast.error('Gagal menyalin link');
    }
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      '_blank'
    );
  };

  const shareToTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  };

  const triggerButton = variant === 'icon' ? (
    <button
      className={cn(
        'p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors',
        className
      )}
    >
      <Share2 className="w-5 h-5 text-white" />
    </button>
  ) : (
    <Button variant="outline" className={className}>
      <Share2 className="w-4 h-4 mr-2" />
      Bagikan
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="w-4 h-4 mr-2" />
          Salin Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToWhatsApp}>
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTelegram}>
          <MessageCircle className="w-4 h-4 mr-2" />
          Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook}>
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter}>
          <Twitter className="w-4 h-4 mr-2" />
          Twitter / X
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
