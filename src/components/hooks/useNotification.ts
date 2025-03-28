import { useState } from 'react';

type NotificationType = {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description: string;
  autoClose?: boolean | number; 
};

export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const addNotification = (notification: Omit<NotificationType, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
    
    if (notification.autoClose !== false) {
      const duration = typeof notification.autoClose === 'number' 
        ? notification.autoClose 
        : 5000;
        
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { notifications, addNotification, removeNotification };
};