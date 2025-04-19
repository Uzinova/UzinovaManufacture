import React, { createContext, useContext, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { v4 as uuidv4 } from 'uuid';
import { Toast, ToastType } from '../components/ToastNotification';

interface Notification {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (type: ToastType, message: string, duration?: number) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: ToastType, message: string, duration?: number) => {
    const id = uuidv4();
    setNotifications(prev => [...prev, { id, type, message, duration }]);
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const renderToasts = () => {
    return createPortal(
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
        {notifications.map(notification => (
          <Toast
            key={notification.id}
            id={notification.id}
            type={notification.type}
            message={notification.message}
            duration={notification.duration}
            onClose={hideNotification}
          />
        ))}
      </div>,
      document.body
    );
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {renderToasts()}
    </NotificationContext.Provider>
  );
};
