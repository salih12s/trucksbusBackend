import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocketContext } from '../context/WebSocketContext';
import { messageService, type Message } from '../services/messageService';

export const useMessageNotifications = () => {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const { onNewMessage, offNewMessage } = useWebSocketContext();
  const location = useLocation();

  // Load initial unread count
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!isAuthenticated || !user) {
        setUnreadMessageCount(0);
        return;
      }

      try {
        const response = await messageService.getConversations();
        if (response.success) {
          const totalUnread = response.conversations.reduce(
            (total, conv) => total + (conv.unreadCount || 0), 
            0
          );
          setUnreadMessageCount(totalUnread);
        }
      } catch (error) {
        console.error('Failed to load unread message count:', error);
      }
    };

    loadUnreadCount();
  }, [isAuthenticated, user]);

  // Manually increment unread count (called from socket events)
  const incrementUnreadCount = () => {
    setUnreadMessageCount(prev => prev + 1);
  };

  // Manually decrement unread count
  const decrementUnreadCount = (amount = 1) => {
    setUnreadMessageCount(prev => Math.max(0, prev - amount));
  };

  // Reset unread count
  const resetUnreadCount = () => {
    setUnreadMessageCount(0);
  };

  // Route değişince: mesaj sayfasına girildiyse sıfırla
  useEffect(() => {
    const onMessagesPage =
      location.pathname === '/real-time-messages' ||
      location.pathname === '/messages';
    if (onMessagesPage) {
      resetUnreadCount(); // 👈 header'daki MessageIcon badge 0 olur
    }
  }, [location.pathname]);

  // WebSocket'ten canlı artırım
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handler = (msg: Message) => {
      const notMine = msg.sender_id !== user.id;
      const onMessagesPage =
        window.location.pathname === '/real-time-messages' ||
        window.location.pathname === '/messages';
      if (notMine && !onMessagesPage) {
        setUnreadMessageCount(prev => prev + 1); // 👈 canlı artış
      }
    };

    onNewMessage(handler);
    return () => offNewMessage(handler);
  }, [isAuthenticated, user?.id, onNewMessage, offNewMessage]);

  return {
    unreadMessageCount,
    incrementUnreadCount,
    decrementUnreadCount,
    resetUnreadCount
  };
};
