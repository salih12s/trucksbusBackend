import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Message } from '../services/messageService';

interface UseWebSocketOptions {
  onNewMessage?: (message: Message) => void;
  onMessageRead?: (data: { messageId: string }) => void;
  onTypingStart?: (data: { userId: string; userName: string }) => void;
  onTypingStop?: (data: { userId: string }) => void;
  onUserStatusUpdate?: (data: { userId: string; status: 'online' | 'offline' | 'away' | 'busy' }) => void;
  onError?: (error: { message: string }) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Use refs to store callbacks to avoid useEffect dependency issues
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://trucksbusbackend-production-0e23.up.railway.app';
    
    const socketInstance = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Connection events
    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    // Message events
    socketInstance.on('new_message', (message: Message) => {
      console.log('New message received:', message);
      callbacksRef.current.onNewMessage?.(message);
    });

    socketInstance.on('message_read', (data: { messageId: string }) => {
      console.log('Message read:', data);
      callbacksRef.current.onMessageRead?.(data);
    });

    // Typing events
    socketInstance.on('user_typing', (data: { userId: string; userName: string }) => {
      console.log('User typing:', data);
      callbacksRef.current.onTypingStart?.(data);
    });

    socketInstance.on('user_stop_typing', (data: { userId: string }) => {
      console.log('User stop typing:', data);
      callbacksRef.current.onTypingStop?.(data);
    });

    // Status events
    socketInstance.on('user_status_update', (data: { userId: string; status: 'online' | 'offline' | 'away' | 'busy' }) => {
      console.log('User status update:', data);
      callbacksRef.current.onUserStatusUpdate?.(data);
    });

    // Error events
    socketInstance.on('error', (error: { message: string }) => {
      console.error('WebSocket error:', error);
      callbacksRef.current.onError?.(error);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      callbacksRef.current.onError?.({ message: 'Connection failed' });
    });

    return () => {
      console.log('Cleaning up WebSocket connection');
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]); // Only depend on user, not the callbacks

  const joinConversation = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_conversation', conversationId);
      setCurrentConversation(conversationId);
      console.log('Joined conversation:', conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave_conversation', conversationId);
      if (currentConversation === conversationId) {
        setCurrentConversation(null);
      }
      console.log('Left conversation:', conversationId);
    }
  };

  const sendMessage = (conversationId: string, content: string) => {
    console.log('🚀 sendMessage called:', { conversationId, content });
    console.log('🔗 Socket state:', { 
      hasSocket: !!socketRef.current, 
      isConnected, 
      socketConnected: socketRef.current?.connected,
      user: user?.id 
    });
    
    if (socketRef.current && isConnected) {
      console.log('📤 Sending WebSocket message:', { conversationId, content, connected: socketRef.current.connected });
      socketRef.current.emit('send_message', {
        conversationId,
        content
      });
      console.log('✅ Message sent via WebSocket');
    } else {
      console.error('❌ Cannot send message - WebSocket not connected:', { 
        hasSocket: !!socketRef.current, 
        isConnected,
        socketConnected: socketRef.current?.connected
      });
    }
  };

  const markMessageRead = (messageId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark_message_read', messageId);
      console.log('Marked message as read:', messageId);
    }
  };

  const startTyping = (conversationId: string) => {
    if (socketRef.current && isConnected && currentConversation === conversationId) {
      socketRef.current.emit('typing_start', conversationId);
    }
  };

  const stopTyping = (conversationId: string) => {
    if (socketRef.current && isConnected && currentConversation === conversationId) {
      socketRef.current.emit('typing_stop', conversationId);
    }
  };

  const updateStatus = (status: 'online' | 'away' | 'busy') => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('update_status', status);
    }
  };

  const viewListing = (listingId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('listing_viewed', listingId);
    }
  };

  return {
    socket,
    isConnected,
    currentConversation,
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessageRead,
    startTyping,
    stopTyping,
    updateStatus,
    viewListing
  };
};
