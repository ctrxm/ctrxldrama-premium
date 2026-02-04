"use client";

import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SubscribeButtonProps {
  drama_id: string;
  platform: string;
  drama_title: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export function SubscribeButton({
  drama_id,
  platform,
  drama_title,
  variant = 'icon',
  className,
}: SubscribeButtonProps) {
  const { user } = useAuth();
  const { isSubscribed, subscribe, unsubscribe } = useNotifications();

  const subscribed = isSubscribed(drama_id, platform);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }

    if (subscribed) {
      unsubscribe(
        { drama_id, platform },
        {
          onSuccess: () => toast.success('Notifikasi dimatikan'),
          onError: () => toast.error('Gagal mematikan notifikasi'),
        }
      );
    } else {
      subscribe(
        { drama_id, platform, drama_title },
        {
          onSuccess: () => toast.success('Akan diberitahu episode baru'),
          onError: () => toast.error('Gagal mengaktifkan notifikasi'),
        }
      );
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors',
          className
        )}
        title={subscribed ? 'Matikan notifikasi' : 'Nyalakan notifikasi'}
      >
        {subscribed ? (
          <BellOff className="w-5 h-5 text-yellow-400" />
        ) : (
          <Bell className="w-5 h-5 text-white" />
        )}
      </button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant={subscribed ? 'default' : 'outline'}
      className={className}
    >
      {subscribed ? (
        <>
          <BellOff className="w-4 h-4 mr-2" />
          Matikan Notifikasi
        </>
      ) : (
        <>
          <Bell className="w-4 h-4 mr-2" />
          Notifikasi Episode Baru
        </>
      )}
    </Button>
  );
}
