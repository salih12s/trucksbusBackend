import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Message } from '../services/messageService';
import { messageService } from '../services/messageService';

// ---- ROUTE HELPERS (HashRouter/BrowseRouter fark etmez, route'u sağlam tespit eder)
const getRoutePath = () => {
  const { pathname, hash } = window.location;
  const h = hash?.startsWith('#') ? hash.slice(1) : hash; // '#/x' -> '/x'
  const full = (h || pathname) ?? '/';
  return full.split('?')[0]; // query'siz yol
};

const isMessagesRoute = () => {
  const p = getRoutePath();
  return p.startsWith('/real-time-messages') || p.startsWith('/messages');
};

// 🔧 Normalize message schema - fixes body/content mismatch
const normalizeMessage = (raw: any): Message => ({
  id: raw.id,
  conversation_id: raw.conversation_id ?? raw.conversationId,
  sender_id: raw.sender_id ?? raw.senderId,
  // body/content farkını kapatıyoruz
  content: raw.content ?? raw.body ?? '',
  is_read: Boolean(raw.is_read ?? raw.isRead ?? false),
  is_edited: Boolean(raw.is_edited ?? raw.isEdited ?? false),
  created_at: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  updated_at: raw.updated_at ?? raw.updatedAt ?? raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  users: raw.users ?? raw.user ?? {
    id: raw.user_id ?? raw.userId ?? '',
    first_name: raw.first_name ?? raw.firstName ?? '',
    last_name: raw.last_name ?? raw.lastName ?? '',
    username: raw.username ?? undefined,
  },
});

// Notification interface
interface NotificationEvent {
  id: string;
  type: 'message' | 'general';
  title: string;
  content: string;
  senderId?: string;
  senderName?: string;
  listingId?: string;
  conversationId?: string;
  createdAt: Date;
  isRead: boolean;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  notifications: NotificationEvent[];
  // Message events
  onNewMessage: (callback: (message: Message) => void) => void;
  offNewMessage: (callback: (message: Message) => void) => void;
  // Typing events
  onTyping: (callback: (data: { userId: string; userName: string }) => void) => void;
  offTyping: (callback: (data: { userId: string; userName: string }) => void) => void;
  // Send events
  sendMessage: (conversationId: string, content: string, ack?: (msg: Message) => void) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  // Notification methods
  markAsRead: (notificationId?: string) => void;
  markMessageNotificationsAsRead: () => void; // 👈 YENİ
  markConversationAsRead: (conversationId: string) => Promise<void>; // 👈 NEW
  // Active conversation tracking
  setActiveConversationId: (id: string | null) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Notification states
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  // 🔧 Use useRef instead of useState to prevent stale closure
  const messageCallbacksRef = React.useRef(new Set<(message: Message) => void>());
  const typingCallbacksRef = React.useRef(new Set<(data: { userId: string; userName: string }) => void>());

  // ✨ De-dupe için seen message IDs
  const seenMessageIdsRef = React.useRef<Set<string>>(new Set());

  // 🔧 Active conversation tracking
  const activeConversationIdRef = React.useRef<string | null>(null);

  // 🔧 Room katılım takibi
  const joinedRoomsRef = React.useRef<Set<string>>(new Set());

  // 🔧 handleIncoming ref için
  const handleIncomingRef = React.useRef<((message: Message) => void) | null>(null);
  const setActiveConversationId = React.useCallback((id: string | null) => {
    activeConversationIdRef.current = id;
  }, []);

  // 🔧 Smart notification guard - aktif konuşma bilgisini ref'ten al
  const isViewingActiveConv = (convId?: string) => {
    if (!convId) return false;
    const onMessagesRoute =
      window.location.pathname === '/messages' ||
      window.location.pathname === '/real-time-messages';
    return (
      document.visibilityState === 'visible' &&
      onMessagesRoute &&
      activeConversationIdRef.current === convId
    );
  };

  // Tüm konuşmalara join olmak için yardımcı fonksiyon
  const joinAllConversations = async (sock: Socket, uid?: string) => {
    try {
      // kullanıcı yoksa boşuna çağırma
      if (!uid) return;
      const res = await messageService.getConversations();
      const ids = res?.conversations?.map(c => c.id) ?? [];
      ids.forEach(id => {
        // 🔧 Backend'e uyumlu event ismi: conversation:join
        sock.emit('conversation:join', { conversation_id: id });
      });
      console.log('🧩 Joined conversations for notifications:', ids.length, ids);
      
      // Force refresh conversation list için event listener ekle
      sock.on('conversation:upsert', async () => {
        console.log('🔄 conversation:upsert received, refreshing...');
        try {
          const newRes = await messageService.getConversations();
          const newIds = newRes?.conversations?.map(c => c.id) ?? [];
          newIds.forEach(id => {
            if (!joinedRoomsRef.current.has(id)) {
              sock.emit('conversation:join', { conversation_id: id });
              joinedRoomsRef.current.add(id);
            }
          });
        } catch (e) {
          console.warn('conversation:upsert refresh failed', e);
        }
      });
    } catch (e) {
      console.warn('joinAllConversations failed', e);
    }
  };

  // 🔧 Tek seferlik join
  const ensureJoined = React.useCallback((conversationId: string) => {
    if (!socket || !isConnected) return;
    if (joinedRoomsRef.current.has(conversationId)) return;
    // 🔧 Backend'e uyumlu event ismi: conversation:join
    socket.emit('conversation:join', { conversation_id: conversationId });
    joinedRoomsRef.current.add(conversationId);
    console.log('🚪 joined room (once):', conversationId);
  }, [socket, isConnected]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        console.log('🔌 Disconnecting WebSocket - user not authenticated');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // 🔧 Standardized environment variable usage
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005/api';
    const serverUrl = new URL(API_BASE_URL).origin;
    
    console.log('🔌 Initializing WebSocket connection to:', serverUrl);
    
    const socketInstance = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      // 🔧 Reconnection ve backoff ayarları
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
    });

    // Connection events
    socketInstance.on('connect', async () => {
      console.log('🟢 WebSocket connected');
      setIsConnected(true);
      joinedRoomsRef.current.clear();                 // 🔧 önemli

      // Join user-specific room
      if (user?.id) {
        socketInstance.emit('user:join', { user_id: user.id });
        
        // Join admin room if user is admin
        if (user.role === 'ADMIN') {
          socketInstance.emit('join', { room: 'role:admin' });
        }
      }

      // 🎯 Load real unread count from backend
      try {
        const unreadResponse = await messageService.getUnreadCount();
        if (unreadResponse?.success && unreadResponse?.data?.count !== undefined) {
          setUnreadCount(unreadResponse.data.count);
          console.log('🔢 Initial unread count loaded:', unreadResponse.data.count);
        }
      } catch (error) {
        console.warn('Failed to load initial unread count:', error);
      }

      // 🎯 kritik: tüm konuşma odalarına katıl ki new_message düşsün
      await joinAllConversations(socketInstance, user?.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔴 WebSocket disconnected');
      setIsConnected(false);
    });

    // ---- Tek ortak handler
    const handleIncoming = (message: Message) => {
      // de-dupe
      if (message?.id) {
        if (seenMessageIdsRef.current.has(message.id)) {
          return;
        }
        if (seenMessageIdsRef.current.size > 1000) {
          seenMessageIdsRef.current.clear();
        }
        seenMessageIdsRef.current.add(message.id);
      }

      // mesaj ekranına dağıt
      messageCallbacksRef.current.forEach(cb => cb(message));

      // kendi mesajınsa bildirim çıkarma
      if (!user || message.sender_id === user.id) return;

      // şu anda bu konuşma ekranda mı?
      const viewingThisConv =
        document.visibilityState === 'visible' &&
        (getRoutePath().startsWith('/real-time-messages') || getRoutePath().startsWith('/messages')) &&
        activeConversationIdRef.current === message.conversation_id;

      // 🎯 Çan badge (unreadCount): ekranda değilse artır
      if (!viewingThisConv) {
        setUnreadCount(prev => prev + 1);
      }

      // Bildirim listesine ekle
      const notification: NotificationEvent = {
        id: `msg-${message.id}-${Date.now()}`,
        type: 'message',
        title: 'Yeni Mesaj',
        content: `${message.users?.first_name ?? ''} ${message.users?.last_name ?? ''}: ${message.content}`,
        senderId: message.sender_id,
        senderName: `${message.users?.first_name ?? ''} ${message.users?.last_name ?? ''}`.trim(),
        conversationId: message.conversation_id,
        createdAt: new Date(message.created_at),
        isRead: viewingThisConv,
      };
      setNotifications(prev => [notification, ...prev]);
    };

    // 🔧 handleIncoming'i ref'e at
    handleIncomingRef.current = handleIncoming;

    // ---- socket event'lerinde SADECE bu handler'ı çağır:
    socketInstance.on('new_message', (raw: any) => {
      const message = normalizeMessage(raw);
      console.log('📨 new_message:', message);
      handleIncoming(message);
    });

    // message:new alias (backend compatibility)
    socketInstance.on('message:new', (raw: any) => {
      const message = normalizeMessage(raw.message || raw);
      console.log('📨 message:new (alias):', message);
      handleIncoming(message);
    });

    // Typing events - dual support
    socketInstance.on('user_typing', (data: any) => {
      console.log('⌨️ user_typing:', data);
      typingCallbacksRef.current.forEach(callback => callback(data));
    });

    socketInstance.on('typing:start', (data: any) => {
      console.log('⌨️ typing:start (alias):', data);
      typingCallbacksRef.current.forEach(callback => callback(data));
    });

    socketInstance.on('user_stop_typing', (data: { userId: string }) => {
      console.log('⌨️ Global WebSocket: User stopped typing:', data);
    });

    // ---- notify handler (sadeleştirildi)
    const handleNotify = (raw: any) => {
      console.log('🔔 handleNotify received:', raw);
      const payload = raw?.message ?? raw;

      try {
        const m = normalizeMessage(payload);
        handleIncoming(m); // artış ve liste ekleme burada
      } catch (error) {
        console.log('🔔 normalizeMessage failed, creating generic notification:', error);
        const convId = payload?.conversation_id ?? payload?.conversationId;

        setNotifications(prev => [
          {
            id: `nf-${Date.now()}`,
            type: 'message',
            title: 'Yeni Mesaj',
            content: payload?.preview ?? payload?.content ?? 'Yeni bir mesajınız var',
            conversationId: convId,
            createdAt: new Date(),
            isRead: false
          },
          ...prev
        ]);

        // normalize edilemeyen edge-case'te, mesaj sayfasında değilsek bir kez artır
        const onMsgRoute = getRoutePath().startsWith('/real-time-messages') || getRoutePath().startsWith('/messages');
        if (!onMsgRoute) setUnreadCount(prev => prev + 1);
      }
    };

    // ---- olası bildirim event adları (hepsini aynı handle'a bağla)
    socketInstance.on('notify:message', handleNotify);
    socketInstance.on('message:notify', handleNotify);
    socketInstance.on('user:new_message', handleNotify);
    socketInstance.on('user:notification', handleNotify);
    socketInstance.on('notification', handleNotify);

    // Report notification events
    socketInstance.on('admin:report:new', (data: any) => {
      console.log('📋 New report notification:', data);
      if (user?.role === 'ADMIN') {
        setNotifications(prev => [
          {
            id: `report-${data.reportId}`,
            type: 'general',
            title: 'Yeni Şikayet',
            content: `"${data.listingTitle}" ilanı için yeni şikayet alındı`,
            createdAt: new Date(),
            isRead: false
          },
          ...prev
        ]);
        setUnreadCount(prev => prev + 1);
      }
    });

    socketInstance.on('admin:report:resolved', (data: any) => {
      console.log('📋 Report resolved notification:', data);
      if (user?.role === 'ADMIN') {
        setNotifications(prev => [
          {
            id: `report-resolved-${data.reportId}`,
            type: 'general',
            title: 'Şikayet Çözüldü',
            content: `"${data.listingTitle}" için şikayet ${data.status === 'ACCEPTED' ? 'kabul edildi' : 'reddedildi'}`,
            createdAt: new Date(),
            isRead: false
          },
          ...prev
        ]);
        setUnreadCount(prev => prev + 1);
      }
    });

    socketInstance.on('unreadCountUpdate', (data: any) => {
      console.log('🔢 Unread count update:', data);
      setUnreadCount(data.total_unread || 0);
    });

    // ---- badge:update event'i için özel handler
    socketInstance.on('badge:update', (data: any) => {
      console.log('🔔 badge:update received:', data);
      
      // Mesaj sayfasında DEĞİLKEN badge güncelle
      const onMsgRoute = getRoutePath().startsWith('/real-time-messages') || getRoutePath().startsWith('/messages');
      
      if (!onMsgRoute && data?.total_unread !== undefined) {
        setUnreadCount(data.total_unread);
        console.log('🔔 Badge updated to:', data.total_unread);
      } else if (onMsgRoute) {
        console.log('🔔 Badge update ignored - on messages page');
      }
    });

    // ---- conversation:upsert event'i - gizli konuşma geri geldiğinde
    socketInstance.on('conversation:upsert', (payload: any) => {
      console.log('🔄 conversation:upsert received:', payload);
      
      // Eğer mesaj sayfasındaysak ve conversations state'i varsa güncelle
      // Bu event'i MessageService veya RealTimeMessagesPage dinleyebilir
      // Şimdilik sadece log atalım - frontend'de ayrıca implement edilecek
    });

    // ---- debug: hangi eventler geliyor görmek için
    socketInstance.onAny((event, ...args) => {
      console.log('[socket-event]', event, args?.[0]);
    });

    // ---- polling fallback
    let poll: any = null;
    poll = setInterval(async () => {
      // Mesaj sayfasındayken polling yapmaya gerek yok
      if (isMessagesRoute()) return;
      if (!isAuthenticated || !user) return;

      try {
        const res = await messageService.getConversations();
        if (res?.success) {
          const total = res.conversations.reduce((t, c) => t + (c.unreadCount || 0), 0);
          setUnreadCount(total);
        }
      } catch (e) {
        console.warn('unread polling failed', e);
      }
    }, 15000);

    setSocket(socketInstance);

    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      socketInstance.disconnect();
      if (poll) clearInterval(poll);
    };
  }, [isAuthenticated, user]);

  // Event subscription methods
  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    messageCallbacksRef.current.add(callback);
  }, []);

  const offNewMessage = useCallback((callback: (message: Message) => void) => {
    messageCallbacksRef.current.delete(callback);
  }, []);

  const onTyping = useCallback((callback: (data: { userId: string; userName: string }) => void) => {
    typingCallbacksRef.current.add(callback);
  }, []);

  const offTyping = useCallback((callback: (data: { userId: string; userName: string }) => void) => {
    typingCallbacksRef.current.delete(callback);
  }, []);

  // Send methods - dual emit for compatibility
  const sendMessage = useCallback((conversationId: string, content: string, ack?: (msg: Message) => void) => {
    if (!socket || !isConnected) return;

    ensureJoined(conversationId); // emin ol

    // 🔧 Backend'e uyumlu event ismi: message:send
    socket.emit('message:send', { conversation_id: conversationId, body: content }, (raw: any) => {
      // sunucudan dönen onay (ack) - updated format
      try {
        if (raw?.ok && raw?.message) {
          // Backend şimdi full message object döndürüyor
          const m = normalizeMessage(raw.message);
          ack?.(m);
        } else if (raw?.ok && raw?.id) {
          // Legacy format fallback
          const m = normalizeMessage({ 
            id: raw.id, 
            conversation_id: conversationId, 
            content,
            sender_id: user?.id,
            created_at: new Date().toISOString()
          });
          ack?.(m);
        } else {
          console.warn('sendMessage ACK failed:', raw);
        }
      } catch (e) {
        console.warn('ack parse failed:', e, raw);
      }
    });
  }, [socket, isConnected, ensureJoined]);

  const joinConversation = useCallback((conversationId: string) => {
    ensureJoined(conversationId);
  }, [ensureJoined]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      // 🔧 Backend'e uyumlu event ismi: conversation:leave
      socket.emit('conversation:leave', { conversation_id: conversationId });
      joinedRoomsRef.current.delete(conversationId);
      console.log('🚪 left room:', conversationId);
    }
  }, [socket, isConnected]);

  const startTyping = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      // 🔧 Tutarlı payload formatı
      const payload = { conversation_id: conversationId };
      socket.emit('typing_start', payload);
    }
  }, [socket, isConnected]);

  const stopTyping = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      // 🔧 Tutarlı payload formatı  
      const payload = { conversation_id: conversationId };
      socket.emit('typing_stop', payload);
    }
  }, [socket, isConnected]);

  // Mark notifications as read
  const markAsRead = useCallback((notificationId?: string) => {
    if (notificationId) {
      // Mark specific notification as read
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } else {
      // Mark all notifications as read
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
    
    // Update unread count
    setUnreadCount(prev => {
      if (notificationId) {
        return Math.max(0, prev - 1);
      } else {
        return 0;
      }
    });
  }, []);

  // Mark only message notifications as read - for messages page
  const markMessageNotificationsAsRead = React.useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => n.type === 'message' ? { ...n, isRead: true } : n);
      // unreadCount state'in de tutarlı kalması için:
      const nextUnread = next.filter(n => !n.isRead).length;
      setUnreadCount(nextUnread);
      return next;
    });
  }, []);

  // 🔧 Mark conversation as read on backend and update badge
  const markConversationAsRead = React.useCallback(async (conversationId: string) => {
    try {
      await messageService.markAllMessagesRead(conversationId);
      
      // Update local notifications
      setNotifications(prev => 
        prev.map(n => 
          n.type === 'message' && n.conversationId === conversationId 
            ? { ...n, isRead: true } 
            : n
        )
      );
      
      // Reload unread count from backend
      const unreadResponse = await messageService.getUnreadCount();
      if (unreadResponse?.success && unreadResponse?.data?.count !== undefined) {
        setUnreadCount(unreadResponse.data.count);
      }
    } catch (error) {
      console.warn('Failed to mark conversation as read:', error);
    }
  }, []);

  // 🔧 Memoize context value to prevent unnecessary re-renders
  const contextValue: WebSocketContextType = React.useMemo(() => ({
    socket,
    isConnected,
    unreadCount,
    notifications,
    markAsRead,
    markMessageNotificationsAsRead, // 👈 YENİ
    markConversationAsRead, // 👈 NEW
    onNewMessage,
    offNewMessage,
    onTyping,
    offTyping,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    setActiveConversationId
  }), [socket, isConnected, unreadCount, notifications, markAsRead, markMessageNotificationsAsRead, markConversationAsRead, onNewMessage, offNewMessage, onTyping, offTyping, sendMessage, joinConversation, leaveConversation, startTyping, stopTyping, setActiveConversationId]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
