"use client";

import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-icon relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border z-50">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <span className="text-label">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="loading-spinner w-6 h-6" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="w-6 h-6 mb-2 opacity-50" />
                  <span className="text-xs">No notifications</span>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-3 hover:bg-muted/50 transition-colors cursor-pointer',
                        !notification.is_read && 'bg-primary/5 border-l-2 border-l-primary'
                      )}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <p className="text-sm font-medium text-foreground">{notification.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
