import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ApiNotification } from '../../components/common/ApiNotification';
import type { NotificationType } from '../../components/common/ApiNotification';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (message: string, type: NotificationType = 'success', duration?: number) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      setNotifications((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Render notifications - stack them vertically */}
      {notifications.length > 0 && (
        <div className="fixed top-0 right-0 z-[10000] pointer-events-none">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              className="pointer-events-auto"
              style={{ 
                position: 'absolute',
                top: `${20 + index * 90}px`,
                right: '20px',
              }}
            >
              <ApiNotification
                message={notification.message}
                type={notification.type}
                duration={notification.duration}
                onClose={() => removeNotification(notification.id)}
              />
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

