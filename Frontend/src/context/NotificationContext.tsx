import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Notification, NotificationType } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] };

interface NotificationContextType extends NotificationState {
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  showSuccessNotification: (message: string) => void;
  showErrorNotification: (message: string) => void;
  showInfoNotification: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload ? { ...notification, isRead: true } : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, isRead: true })),
        unreadCount: 0,
      };
    case 'REMOVE_NOTIFICATION':
      const notificationToRemove = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
        unreadCount: notificationToRemove && !notificationToRemove.isRead 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount,
      };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.isRead).length,
      };
    default:
      return state;
  }
};

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): void => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const markAsRead = (id: string): void => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  const markAllAsRead = (): void => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const removeNotification = (id: string): void => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const showSuccessNotification = (message: string): void => {
    addNotification({
      userId: 'current-user', // This should be from auth context
      title: 'Başarılı',
      message,
      type: NotificationType.LISTING_APPROVED,
      isRead: false,
    });
  };

  const showErrorNotification = (message: string): void => {
    addNotification({
      userId: 'current-user',
      title: 'Hata',
      message,
      type: NotificationType.LISTING_REJECTED,
      isRead: false,
    });
  };

  const showInfoNotification = (message: string): void => {
    addNotification({
      userId: 'current-user',
      title: 'Bilgi',
      message,
      type: NotificationType.NEW_MESSAGE,
      isRead: false,
    });
  };

  const value: NotificationContextType = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    showSuccessNotification,
    showErrorNotification,
    showInfoNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
