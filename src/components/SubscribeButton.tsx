"use client";

import { Bell, BellOff } from 'lucide-react';
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
      toast.error('Please sign in first');
      return;
    }

    if (subscribed) {
      unsubscribe(
        { drama_id, platform },
        {
          onSuccess: () => toast.success('Notifications disabled'),
          onError: () => toast.error('Failed to disable notifications'),
        }
      );
    } else {
      subscribe(
        { drama_id, platform, drama_title },
        {
          onSuccess: () => toast.success('You will be notified of new episodes'),
          onError: () => toast.error('Failed to enable notifications'),
        }
      );
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'btn-icon bg-black/50',
          className
        )}
        title={subscribed ? 'Disable notifications' : 'Enable notifications'}
      >
        {subscribed ? (
          <BellOff className="w-4 h-4 text-primary" />
        ) : (
          <Bell className="w-4 h-4 text-white" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        subscribed ? 'btn-primary' : 'btn-secondary',
        'gap-2',
        className
      )}
    >
      {subscribed ? (
        <>
          <BellOff className="w-4 h-4" />
          Disable Notifications
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          Notify New Episodes
        </>
      )}
    </button>
  );
}
