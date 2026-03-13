import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../state/notification.thunks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { LoadingGate } from '@/components/common/LoadingGate';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { NotificationType } from '../types/notification.types';

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, isLoading, error, unreadCount } = useAppSelector((state) => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 50 }));
  }, [dispatch]);

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
      case NotificationType.CHAT_MESSAGE: return 'solar:chat-round-line-bold';
      case NotificationType.BOOKING_CONFIRMED: return 'solar:calendar-check-bold';
      case NotificationType.BOOKING_CANCELLED: return 'solar:calendar-minimalistic-bold';
      case NotificationType.BOOKING_COMPLETED: return 'solar:check-circle-bold';
      default: return 'solar:bell-bold';
    }
  };

  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.BOOKING_CONFIRMED: return 'text-green-500 bg-green-50';
      case NotificationType.BOOKING_CANCELLED: return 'text-red-500 bg-red-50';
      case NotificationType.BOOKING_COMPLETED: return 'text-blue-500 bg-blue-50';
      default: return 'text-primary bg-primary/10';
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your latest activities</p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={() => dispatch(markAllNotificationsAsRead())}
            className="hidden sm:flex items-center gap-2"
          >
            <Icon icon="solar:check-read-linear" className="size-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <LoadingGate
        loading={isLoading}
        error={error}
        data={notifications}
        emptyMessage="No notifications yet."
        emptyIcon="solar:bell-off-bold-duotone"
      >
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md border-border/60",
                !notification.isRead ? "bg-primary/5 border-primary/20" : "bg-card"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-2.5 rounded-full shrink-0",
                  getIconColor(notification.type)
                )}>
                  <Icon icon={getIcon(notification.type)} className="size-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={cn(
                      "font-semibold text-base",
                      !notification.isRead ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {notification.message}
                  </p>
                  {!notification.isRead && (
                    <Badge variant="default" className="mt-2 h-5 text-[10px] uppercase tracking-wider">
                      New
                    </Badge>
                  )}
                </div>
                <div className="shrink-0 flex items-center h-full pt-1">
                    <Icon icon="solar:alt-arrow-right-linear" className="size-5 text-muted-foreground/30" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </LoadingGate>

      {unreadCount > 0 && (
          <div className="mt-6 sm:hidden">
              <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => dispatch(markAllNotificationsAsRead())}
              >
                  Mark all as read
              </Button>
          </div>
      )}
    </div>
  );
}
