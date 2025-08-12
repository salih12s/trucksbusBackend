import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (data: any) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const { user, token } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      // Listen for new messages
      socket.on('newMessage', (data) => {
        addNotification({
          userId: user.id,
          title: 'Yeni Mesaj',
          message: `${data.senderName}: ${data.content}`,
          type: 'NEW_MESSAGE' as any,
          isRead: false,
          data: data,
        });
      });

      // Listen for listing status updates
      socket.on('listingStatusUpdate', (data) => {
        const title = data.status === 'APPROVED' ? 'İlan Onaylandı' : 'İlan Reddedildi';
        const message = `"${data.listingTitle}" ilanınız ${data.status === 'APPROVED' ? 'onaylandı' : 'reddedildi'}.`;
        
        addNotification({
          userId: user.id,
          title,
          message,
          type: data.status === 'APPROVED' ? 'LISTING_APPROVED' : 'LISTING_REJECTED' as any,
          isRead: false,
          data: data,
        });
      });

      // Listen for new listing interests
      socket.on('listingInterest', (data) => {
        addNotification({
          userId: user.id,
          title: 'İlan İlgisi',
          message: `${data.userNam} ilanınızla ilgileniyor.`,
          type: 'LISTING_INTEREST' as any,
          isRead: false,
          data: data,
        });
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      };
    }
  }, [user, token, addNotification]);

  const sendMessage = (data: any): void => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('sendMessage', data);
    }
  };

  const joinRoom = (roomId: string): void => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('joinRoom', roomId);
    }
  };

  const leaveRoom = (roomId: string): void => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leaveRoom', roomId);
    }
  };

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    joinRoom,
    leaveRoom,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
