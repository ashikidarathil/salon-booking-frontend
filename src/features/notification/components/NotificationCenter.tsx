import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Icon } from '@iconify/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../state/notification.thunks';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NotificationType } from '../types/notification.types';

export const NotificationCenter: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading } = useAppSelector((state) => state.notification);
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');

  useEffect(() => {
    dispatch(fetchNotifications({ 
      isRead: activeTab === 'unread' ? false : true, 
      limit: 20 
    }));
  }, [dispatch, activeTab]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification.id));
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.CHAT_MESSAGE:
        return 'solar:chat-round-line-bold';
      case NotificationType.BOOKING_CONFIRMED:
        return 'solar:calendar-check-bold';
      case NotificationType.BOOKING_CANCELLED:
        return 'solar:calendar-minimalistic-bold';
      case NotificationType.BOOKING_COMPLETED:
        return 'solar:check-circle-bold';
      default:
        return 'solar:bell-bold';
    }
  };

  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.BOOKING_CONFIRMED:
        return 'text-green-500';
      case NotificationType.BOOKING_CANCELLED:
        return 'text-red-500';
      case NotificationType.BOOKING_COMPLETED:
        return 'text-blue-500';
      default:
        return 'text-primary';
    }
  };

  const renderNotificationList = () => {
    if (isLoading && notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-40 space-y-2">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      );
    }

    // Local filtering ensures that when a notification is marked read, it leaves the unread tab immediately
    const filteredNotifications = notifications.filter((n) => 
      activeTab === 'unread' ? !n.isRead : n.isRead
    );

    if (filteredNotifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground p-4 text-center">
          <Icon icon="solar:bell-off-bold-duotone" className="size-12 mb-2 opacity-20" />
          <p className="text-sm">No {activeTab} notifications</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {filteredNotifications.map((notification) => (
          <button
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={cn(
              'flex items-start gap-3 p-4 text-left transition-colors hover:bg-accent/50 border-b border-border/40 last:border-0',
              !notification.isRead && 'bg-primary/5'
            )}
          >
            <div className={cn(
              'mt-1 flex-shrink-0 size-8 rounded-full flex items-center justify-center bg-background border border-border/50',
              getIconColor(notification.type)
            )}>
              <Icon icon={getIcon(notification.type)} className="size-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className={cn(
                  'text-sm font-semibold leading-none',
                  !notification.isRead ? 'text-foreground' : 'text-muted-foreground font-medium'
                )}>
                  {notification.title}
                </p>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {new Date(notification.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {notification.message}
              </p>
              {!notification.isRead && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="size-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-medium text-primary uppercase tracking-wider">New</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
        >
          <Icon icon="solar:bell-bing-bold-duotone" className="size-6" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold border-2 border-background"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 sm:w-96" align="end">
        <div className="p-4 pb-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg">Notifications</h4>
            {activeTab === 'unread' && unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(markAllNotificationsAsRead())}
                className="text-xs h-8 text-primary hover:text-primary/80"
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          <Tabs 
            defaultValue="unread" 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unread" className="text-xs">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="read" className="text-xs">
                Read
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[400px] mt-4 -mx-4 border-t">
              <TabsContent value="unread" className="m-0 focus-visible:ring-0">
                {renderNotificationList()}
              </TabsContent>
              <TabsContent value="read" className="m-0 focus-visible:ring-0">
                {renderNotificationList()}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
        
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full text-xs h-9 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/notifications')}
          >
            See all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
