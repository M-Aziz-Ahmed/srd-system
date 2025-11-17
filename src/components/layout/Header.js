'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useSession, signOut } from 'next-auth/react';
import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/use-toast';
import { initializePusher, bindPusherEvents } from '@/lib/pusher';
import { useState, useEffect } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session?.user) {
      const fetchNotifications = async () => {
        try {
          const res = await fetch('/api/notifications');
          const data = await res.json();
          console.log('Fetched notifications:', data);
          if (data.success) {
            setNotifications(data.data);
            setUnreadCount(data.data.length);
          }
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      };

      fetchNotifications();

      initializePusher();
      
      const cleanup = bindPusherEvents({
        'srd:new': (data) => {
          console.log('Pusher event received: srd:new', data);
          const newNotification = {
            id: data._id, // Use the _id from the database
            type: 'new',
            message: `New SRD created: ${data.refNo}`,
            timestamp: new Date(data.timestamp) // Use the timestamp from the database
          };
          setNotifications(prev => {
            console.log('Updating notifications state:', [newNotification, ...prev]);
            return [newNotification, ...prev];
          });
          setUnreadCount(prev => {
            console.log('Updating unreadCount state:', prev + 1);
            return prev + 1;
          });
          
          toast({
            title: 'New SRD Created',
            description: `SRD ${data.refNo} has been created`,
          });
        },
        'srd:update': (data) => {
          const newNotification = {
            id: data._id, // Use the _id from the database
            type: 'update',
            message: `SRD ${data.id} updated`,
            timestamp: new Date(data.timestamp)
          };
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: 'SRD Updated',
            description: `SRD ${data.id} has been updated`,
          });
        },
        'srd:flag': (data) => {
          const newNotification = {
            id: data._id, // Use the _id from the database
            type: 'flag',
            message: `SRD ${data.id} flagged by ${data.department}`,
            timestamp: new Date(data.timestamp)
          };
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: 'SRD Flagged',
            description: `SRD ${data.id} flagged: ${data.comment?.text}`,
            variant: 'destructive'
          });
        }
      });
      
      return () => {
        cleanup();
      };
    }
  }, [session, toast]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const markNotificationsAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">SRD Tracking System</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    You have {unreadCount} unread messages.
                  </p>
                </div>
                <div className="grid gap-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.message}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={markNotificationsAsRead} disabled={unreadCount === 0}>
                  Mark all as read
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              {/* <p className="text-xs text-gray-500">{session?.user?.role?.toUpperCase()}</p> */}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}