import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Message } from '../services/messageService';
import { messageService } from '../services/messageService';
import { normalizeMessage } from '../utils/normalizers';

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
  const setActiveConversationId = React.useCallback((id: string | null) => {
    activeConversationIdRef.current = id;
  }, []);

  // helper - Odaya tüm varyantlarla katıl
  const joinAllRoomVariants = (sock: Socket, id: string) => {
    // ID odası
    sock.emit('conversation:join', { conversation_id: id }, (ack: any) => {
      console.log('[JOIN ACK] conversation:join', id, ack);
    });
    sock.emit('join_conversation', id, (ack: any) => {
      console.log('[JOIN ACK] join_conversation', id, ack);
    });              // legacy
    // "conversation:ID" isimli oda
    sock.emit('join', { room: `conversation:${id}` });
  };

  // Tüm konuşmalara join olmak için yardımcı fonksiyon
  const joinAllConversations = async (sock: Socket, uid?: string) => {
    try {
      // kullanıcı yoksa boşuna çağırma
      if (!uid) return;
      const res = await messageService.getConversations();
      const ids = res?.conversations?.map(c => c.id) ?? [];
      ids.forEach(id => {
        joinAllRoomVariants(sock, id);
        joinedRoomsRef.current.add(id); // ✅ Set'e ekle
      });
      console.log('🧩 Joined conversations for notifications:', ids.length, ids);
    } catch (e) {
      console.warn('joinAllConversations failed', e);
    }
  };

  // 🔧 Tek seferlik join - çift emit
  const ensureJoined = React.useCallback((conversationId: string) => {
    if (!socket || !isConnected) return;
    if (joinedRoomsRef.current.has(conversationId)) return;

    joinAllRoomVariants(socket, conversationId);
    joinedRoomsRef.current.add(conversationId);
    if (import.meta.env.DEV) console.log('🚪 joined room (once):', conversationId);
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

    // 🔧 Standardized environment variable usage (Railway production)
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';
    const serverUrl = new URL(API_BASE_URL).origin;
    
    if (import.meta.env.DEV) console.log('🔌 Initializing WebSocket connection to:', serverUrl);
    
    const socketInstance = io(serverUrl, {
      auth: { token },
      // Railway specific config - try without explicit path
      // path: '/socket.io/', // ✅ Explicit path
      transports: ['polling', 'websocket'], // ✅ Polling first, then WebSocket
      // 🔧 Reconnection ve backoff ayarları
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000, // ✅ 20 saniye timeout
      forceNew: true,
      upgrade: true, // ✅ Allow transport upgrading
    });

    // Connection events
    socketInstance.on('connect', async () => {
      console.log('🟢 WebSocket connected successfully!');
      console.log('🔍 Socket ID:', socketInstance.id);
      console.log('🔍 Socket connected:', socketInstance.connected);
      console.log('🔍 Socket transport:', socketInstance.io.engine?.transport?.name);
      if (import.meta.env.DEV) console.log('🟢 WebSocket connected');
      setIsConnected(true);
      joinedRoomsRef.current.clear();                 // 🔧 önemli

      // Join user-specific room
      if (user?.id) {
        console.log('🏠 Emitting user:join for user:', user.id);
        socketInstance.emit('user:join', { user_id: user.id });
        socketInstance.emit('join', { room: `user:${user.id}` }); // extra
        
        // Join admin room if user is admin
        if (user.role === 'ADMIN') {
          console.log('👑 Emitting admin room join');
          socketInstance.emit('join', { room: 'role:admin' });
        }
      }

      // 🎯 Load real unread count from backend
      try {
        const unreadResponse = await messageService.getUnreadCount();
        if (unreadResponse?.success && unreadResponse?.data?.count !== undefined) {
          setUnreadCount(unreadResponse.data.count);
          if (import.meta.env.DEV) console.log('🔢 Initial unread count loaded:', unreadResponse.data.count);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.warn('Failed to load initial unread count:', error);
      }

      // 🎯 kritik: tüm konuşma odalarına katıl ki new_message düşsün
      await joinAllConversations(socketInstance, user?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔴 WebSocket disconnected:', reason);
      if (import.meta.env.DEV) console.log('🔴 WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
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
      const senderName = `${message.users?.first_name ?? ''} ${message.users?.last_name ?? ''}`.trim() || 'Bilinmeyen';
      
      const notification: NotificationEvent = {
        id: `msg-${message.id}-${Date.now()}`,
        type: 'message',
        title: 'Yeni Mesaj',
        content: `${senderName}: ${message.content}`,
        senderId: message.sender_id,
        senderName,
        conversationId: message.conversation_id,
        createdAt: new Date(message.created_at),
        isRead: viewingThisConv,
      };
      setNotifications(prev => [notification, ...prev]);
    };

    // ---- socket event'lerinde SADECE bu handler'ı çağır:
    // Comprehensive message event handling - catch ALL possible variants
    const INCOMING_EVENTS = [
      'new_message',
      'message:new',
      'message',                 // <-- ekledik
      'conversation:message',    // <-- ekledik
      'notify:message',
      'message:notify',
      'user:new_message',
      'user:notification',
      'notification',
    ];

    INCOMING_EVENTS.forEach((ev) => {
      socketInstance.on(ev, (raw: any) => {
        const payload = raw?.message ?? raw;
        try {
          const m = normalizeMessage(payload);
          if (import.meta.env.DEV) console.log(`📨 ${ev}:`, m);
          handleIncoming(m);
        } catch (e) {
          console.log('[ws] payload message değil:', ev, raw);
        }
      });
    });

    // Geçici debug: prod'da da açık kalsın, sorunu görün
    socketInstance.onAny((event, payload) => {
      console.log('[ws->client]', event, payload);
    });

    // Handle forbidden join attempts
    socketInstance.on('error:forbidden', (data: any) => {
      console.warn('🚫 Forbidden join attempt:', data);
    });

    // Typing events - dual support
    socketInstance.on('user_typing', (data: any) => {
      if (import.meta.env.DEV) console.log('⌨️ user_typing:', data);
      typingCallbacksRef.current.forEach(callback => callback(data));
    });

    socketInstance.on('typing:start', (data: any) => {
      if (import.meta.env.DEV) console.log('⌨️ typing:start (alias):', data);
      typingCallbacksRef.current.forEach(callback => callback(data));
    });

    socketInstance.on('user_stop_typing', (data: { userId: string }) => {
      if (import.meta.env.DEV) console.log('⌨️ Global WebSocket: User stopped typing:', data);
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
      if (import.meta.env.DEV) console.log('📋 New report notification:', data);
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
      if (import.meta.env.DEV) console.log('📋 Report resolved notification:', data);
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
      if (import.meta.env.DEV) console.log('🔢 Unread count update:', data);
      setUnreadCount(data.total_unread || 0);
    });

    // ---- badge:update event'i için özel handler
    socketInstance.on('badge:update', (data: any) => {
      if (import.meta.env.DEV) console.log('🔔 badge:update received:', data);
      
      // Mesaj sayfasında DEĞİLKEN badge güncelle
      const onMsgRoute = getRoutePath().startsWith('/real-time-messages') || getRoutePath().startsWith('/messages');
      
      if (!onMsgRoute && data?.total_unread !== undefined) {
        setUnreadCount(data.total_unread);
        if (import.meta.env.DEV) console.log('🔔 Badge updated to:', data.total_unread);
      } else if (onMsgRoute && import.meta.env.DEV) {
        console.log('🔔 Badge update ignored - on messages page');
      }
    });

    // ---- conversation:upsert event'i - gizli konuşma geri geldiğinde
    socketInstance.on('conversation:upsert', (payload: any) => {
      if (import.meta.env.DEV) console.log('🔄 conversation:upsert received:', payload);
      
      // Eğer mesaj sayfasındaysak ve conversations state'i varsa güncelle
      // Bu event'i MessageService veya RealTimeMessagesPage dinleyebilir
      // Şimdilik sadece log atalım - frontend'de ayrıca implement edilecek
    });

    // ---- debug: hangi eventler geliyor görmek için (sadece development)
    if (import.meta.env.DEV) {
      socketInstance.onAny((event, ...args) => {
        console.log('[socket-event]', event, args?.[0]);
      });
    }

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
        if (import.meta.env.DEV) console.warn('unread polling failed', e);
      }
    }, 15000);

    setSocket(socketInstance);

    return () => {
      if (import.meta.env.DEV) console.log('🔌 Cleaning up WebSocket connection');
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

  // Send methods - çift emit + HTTP fallback
  const sendMessage = useCallback((conversationId: string, content: string, ack?: (msg: Message) => void) => {
    if (!socket || !isConnected) return;

    ensureJoined(conversationId);

    let settled = false;
    const done = (m?: any) => { 
      settled = true; 
      if (m) ack?.(normalizeMessage(m)); 
    };

    // 1) Ack gelmezse HTTP fallback
    const t = setTimeout(async () => {
      if (settled) return;
      console.warn('[HTTP FALLBACK] /conversations/:id/messages - WS ack timeout');
      try {
        const res = await messageService.sendMessage({ conversationId, content });
        if (res?.success && res?.message) done(res.message);
      } catch {}
    }, 4000); // ✅ 1500 → 4000ms timeout increase

    // 2) Yeni isim
    socket.emit('message:send', { conversation_id: conversationId, body: content }, (raw: any) => {
      console.log('[WS ACK] message:send ->', raw);
      clearTimeout(t);
      if (settled) return; // ✅ Çift callback koruması
      if (raw?.ok && raw?.message) return done(raw.message);
      if (raw?.ok && raw?.id) return done({ id: raw.id, conversation_id: conversationId, body: content });
    });

    // 3) Legacy isim
    socket.emit('send_message', { conversationId, content }, (raw: any) => {
      console.log('[WS ACK] send_message ->', raw);
      clearTimeout(t);
      if (settled) return;
      if (raw?.message) return done(raw.message);
      if (raw?.id) return done({ id: raw.id, conversationId, content });
    });
  }, [socket, isConnected, ensureJoined]);

  const joinConversation = useCallback((conversationId: string) => {
    ensureJoined(conversationId);
  }, [ensureJoined]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('conversation:leave', { conversation_id: conversationId });
      socket.emit('leave_conversation', conversationId); // legacy
      joinedRoomsRef.current.delete(conversationId);
      if (import.meta.env.DEV) console.log('🚪 left room:', conversationId);
    }
  }, [socket, isConnected]);

  const startTyping = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      const payload = { conversation_id: conversationId };
      socket.emit('typing_start', payload);
      socket.emit('typing:start', payload); // legacy
    }
  }, [socket, isConnected]);

  const stopTyping = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      const payload = { conversation_id: conversationId };
      socket.emit('typing_stop', payload);
      socket.emit('typing:stop', payload); // legacy
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
      if (import.meta.env.DEV) console.warn('Failed to mark conversation as read:', error);
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
