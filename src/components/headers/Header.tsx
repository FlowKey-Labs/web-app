import { useState } from 'react';
import { Menu, Indicator, ScrollArea, Button, Tabs } from '@mantine/core';
import { useGetUserProfile, useGetBookingNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../hooks/reactQuery';
import { NotificationBingIcon, MessageNotificationIcon } from '../../assets/icons';
import SearchBar from '../common/SearchBar';

interface HeaderProps {
  showSearch?: boolean;
}

// API Notification interface (matches actual API response)
interface ApiNotification {
  id: number;
  type: string; // API uses 'type' not 'notification_type'
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  booking_request?: {
    booking_reference: string;
    client_name: string;
    session_title: string;
  };
  time_since: string;
}

// Notification categorization for tabs
const NOTIFICATION_CATEGORIES = {
  'booking_request': 'requests',
  'booking_approved': 'approved',
  'booking_rejected': 'approved', // Group with approved for admin actions
  'booking_cancelled': 'cancelled',
  'booking_rescheduled': 'cancelled', // Group with cancelled for changes
  'booking_expired': 'others',
  'payment_received': 'others',
  'system': 'others',
  'default': 'others'
};

// Tab configuration
const NOTIFICATION_TABS = [
  {
    key: 'requests',
    label: 'Requests',
    color: '#1D9B5E',
    description: 'New booking requests requiring action'
  },
  {
    key: 'approved',
    label: 'Actions',
    color: '#228be6', 
    description: 'Approved and rejected bookings'
  },
  {
    key: 'cancelled',
    label: 'Changes',
    color: '#fd7e14',
    description: 'Cancelled and rescheduled bookings'
  },
  {
    key: 'others',
    label: 'System',
    color: '#868e96',
    description: 'System notifications and others'
  }
];

const Header = ({ showSearch = true }: HeaderProps) => {
  const { data: userProfile } = useGetUserProfile();
  const { data: notificationData } = useGetBookingNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('requests');
  
  // Handle the API response structure - it returns an object with results array
  const notifications: ApiNotification[] = notificationData?.results || [];
  const unreadCount = notificationData?.unread_count || notifications.filter((n: ApiNotification) => !n.is_read).length;
  
  // Categorize notifications by tab
  const categorizedNotifications = notifications.reduce((acc: Record<string, ApiNotification[]>, notification: ApiNotification) => {
    const category = NOTIFICATION_CATEGORIES[notification.type as keyof typeof NOTIFICATION_CATEGORIES] || 'others';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(notification);
    return acc;
  }, {});

  // Sort notifications within each category by date (newest first)
  Object.keys(categorizedNotifications).forEach(category => {
    categorizedNotifications[category].sort((a: ApiNotification, b: ApiNotification) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });

  // Get unread count per tab
  const getTabUnreadCount = (tabKey: string) => {
    const tabNotifications = categorizedNotifications[tabKey] || [];
    return tabNotifications.filter((n: ApiNotification) => !n.is_read).length;
  };

  // Filter tabs based on content
  const visibleTabs = NOTIFICATION_TABS.filter(tab => {
    // Always show requests, approved, and cancelled tabs
    if (['requests', 'approved', 'cancelled'].includes(tab.key)) {
      return true;
    }
    // Only show others/system tab if there are notifications
    if (tab.key === 'others') {
      return categorizedNotifications[tab.key]?.length > 0;
    }
    return true;
  });
  
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'booking_request': 'New Booking Request',
      'booking_approved': 'Booking Approved',
      'booking_rejected': 'Booking Rejected',
      'booking_cancelled': 'Booking Cancelled',
      'booking_rescheduled': 'Booking Rescheduled',
      'booking_expired': 'Booking Expired',
      'payment_received': 'Payment Received',
      'system': 'System Notification',
      'default': 'Notification'
    };
    return typeMap[type] || typeMap.default;
  };

  return (
    <div className='h-[70px] sm:h-[80px] flex items-center justify-between px-4 sm:px-6 lg:px-11'>
      {showSearch && (
        <div className="flex-1 max-w-md lg:max-w-lg xl:max-w-xl">
          <SearchBar />
        </div>
      )}

      <div className='flex items-center justify-end gap-3 sm:gap-6 lg:gap-12 ml-auto'>
        {/* Notifications Dropdown */}
        <Menu
          shadow="md"
          width={600}
          position="bottom-end"
          opened={notificationDropdownOpen}
          onChange={setNotificationDropdownOpen}
        >
          <Menu.Target>
            <div className="cursor-pointer">
              <Indicator 
                color="#1D9B5E" 
                size={16} 
                disabled={unreadCount === 0}
                label={unreadCount > 9 ? '9+' : unreadCount}
                inline
              >
                <NotificationBingIcon 
                  className="w-6 h-6 hover:opacity-75 transition-opacity"
                  stroke={unreadCount > 0 ? '#1D9B5E' : '#6D7172'}
                />
              </Indicator>
            </div>
          </Menu.Target>

          <Menu.Dropdown className="p-0">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600 mt-1">Stay updated with your bookings and activities</p>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="light"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  loading={markAllAsRead.isPending}
                  className="text-secondary hover:bg-secondary/10 px-4 py-2"
                >
                  Mark all read
                </Button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageNotificationIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">No notifications yet</h4>
                <p className="text-sm">You'll see booking updates and system messages here</p>
              </div>
            ) : (
              <Tabs value={activeTab} onChange={setActiveTab} orientation="horizontal">
                <Tabs.List className="border-b border-gray-200 px-6 bg-gray-50/50">
                  {visibleTabs.map((tab) => {
                    const tabCount = getTabUnreadCount(tab.key);
                    return (
                      <Tabs.Tab
                        key={tab.key}
                        value={tab.key}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium"
                        style={{ 
                          color: activeTab === tab.key ? tab.color : '#6D7172',
                          borderBottomColor: activeTab === tab.key ? tab.color : 'transparent',
                          borderBottomWidth: '2px'
                        }}
                      >
                        <span className="font-semibold">{tab.label}</span>
                        {tabCount > 0 && (
                          <span 
                            className="text-xs text-white rounded-full mx-2 px-2 py-1 min-w-[20px] text-center font-bold"
                            style={{ backgroundColor: tab.color }}
                          >
                            {tabCount > 9 ? '9+' : tabCount}
                          </span>
                        )}
                      </Tabs.Tab>
                    );
                  })}
                </Tabs.List>

                <ScrollArea h={400}>
                  {visibleTabs.map((tab) => (
                    <Tabs.Panel key={tab.key} value={tab.key} className="p-0">
                      {categorizedNotifications[tab.key]?.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
                            <span className="text-2xl opacity-50">📋</span>
                          </div>
                          <p className="text-sm font-medium text-gray-600">No {tab.label.toLowerCase()} yet</p>
                          <p className="text-xs text-gray-500 mt-1">{tab.description}</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {categorizedNotifications[tab.key]?.map((notification: ApiNotification) => (
                            <div
                              key={notification.id}
                              className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                                !notification.is_read ? 'bg-secondary/5 border-l-4 border-l-secondary' : ''
                              }`}
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0 pr-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                      {getNotificationTypeDisplay(notification.type)}
                                    </span>
                                    {!notification.is_read && (
                                      <div className="w-3 h-3 rounded-full bg-secondary flex-shrink-0" />
                                    )}
                                  </div>
                                  
                                  <h4 className={`text-base font-semibold mb-2 ${
                                    !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500 font-medium">
                                      {formatTimeAgo(notification.created_at)}
                                    </p>
                                    {notification.booking_request && (
                                      <span className="text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full font-semibold">
                                        #{notification.booking_request.booking_reference}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Tabs.Panel>
                  ))}
                </ScrollArea>
              </Tabs>
            )}
          </Menu.Dropdown>
        </Menu>

        {/* User Profile */}
        <span className='text-primary cursor-pointer text-sm sm:text-base font-medium truncate max-w-[120px] sm:max-w-none hover:text-secondary transition-colors duration-200'>
          <span className="hidden sm:inline">{userProfile?.first_name} {userProfile?.last_name}</span>
          <span className="sm:hidden">{userProfile?.first_name || 'User'}</span>
        </span>
      </div>
    </div>
  );
};

export default Header;
