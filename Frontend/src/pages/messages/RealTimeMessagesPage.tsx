import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  Badge,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Container,
  CssBaseline,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';

import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { messageService, type Conversation, type Message } from '../../services/messageService';
import { api } from '../../services/api';

/** Minimal, tek aksan renkli tema */
const theme = createTheme({
  palette: {
    primary: { main: '#19313B', contrastText: '#FFFFFF' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
    divider: 'rgba(0,0,0,0.08)',
    text: {
      primary: '#171A1C',
      secondary: 'rgba(23,26,28,0.65)',
    },
    success: { main: '#2BB673' },
    error: { main: '#E53935' },
    warning: { main: '#F3A11B' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    h6: { fontWeight: 600, letterSpacing: 0.2 },
    subtitle2: { fontWeight: 600 },
    body2: { lineHeight: 1.45 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiListItem: {
      styleOverrides: {
        root: {
          transition: 'background-color .15s ease',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.03)' },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
            '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.16)' },
            '&.Mui-focused fieldset': { borderColor: '#19313B' },
          },
        },
      },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: 10 } } },
  },
});

const RealTimeMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  const {
    isConnected,
    socket,
    sendMessage: sendWebSocketMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    onNewMessage,
    offNewMessage,
    onTyping,
    offTyping,
    setActiveConversationId,
    markMessageNotificationsAsRead,
    markConversationAsRead,
  } = useWebSocketContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMessagesLength = useRef(0);

  // Auto-scroll helper
  const shouldAutoScroll = () => {
    const el = listRef.current;
    if (!el) return true;
    const distance = el.scrollHeight - el.clientHeight - el.scrollTop;
    return distance < 80; // 80px'den azsa "alta yakın" say
  };

  // URL parameters
  const listingParam = searchParams.get('listing');
  const conversationParam = searchParams.get('conversation');

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const response = await messageService.getConversations();
      if (response.success && response.conversations) {
        // 🔧 Debug: conversation data'sını log'la
        console.log('🔍 Loaded conversations:', response.conversations);
        response.conversations.forEach(conv => {
          console.log('🔍 Conversation:', conv.id, 'otherParticipant:', conv.otherParticipant);
        });
        
        // 🔧 Artık gizli/görünür filtresi yok, backend'den gelenleri direkt göster
        setConversations(response.conversations);
        
        // 🚪 Tüm konuşmalara join ol
        response.conversations.forEach(c => joinConversation(c.id));
        
        return response.conversations;
      } else {
        setConversations([]);
        return [];
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Konuşmalar yüklenemedi');
      setConversations([]);
      return [];
    }
  }, [joinConversation]); // 🔧 showHiddenConversations dependency kaldırıldı

  // Konuşmalar yüklendiğinde sağlayıcı üstünden katıl (tek, doğru event seti)
  useEffect(() => {
    if (!isConnected) return;
    conversations.filter(c => c?.id).forEach(c => joinConversation(c.id));
  }, [conversations, isConnected, joinConversation]);

  // WebSocket event handlers
  const handleNewMessage = useCallback(
    (message: Message) => {
      window.dispatchEvent(new CustomEvent('newMessage', { detail: message }));

      // 🔧 Artık gizli konuşma kontrolü yok, direkt mesajı işle

      if (activeConversation && String(message.conversation_id) === String(activeConversation.id)) {
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(message.id))) return prev;
          const i = prev.findIndex(
            (m) =>
              String(m.id).startsWith('temp-') &&
              m.sender_id === message.sender_id &&
              ((m as any).content ?? (m as any).body ?? '') ===
                (message.content ?? (message as any).body ?? '')
          );
          if (i !== -1) {
            const cp = [...prev];
            cp[i] = message;
            return cp;
          }
          return [...prev, message];
        });
      }

      setConversations((prevConversations) => {
        const updated = prevConversations.map((conv) => {
          if (String(conv.id) !== String(message.conversation_id)) return conv;
          const isOwn = message.sender_id === user?.id;
          const isActive = String(activeConversation?.id) === String(conv.id);
          return {
            ...conv,
            lastMessage: {
              content: message.content ?? (message as any).body ?? '',
              created_at: message.created_at,
              sender_id: message.sender_id,
              sender_name: message.users
                ? `${message.users.first_name} ${message.users.last_name}`.trim()
                : 'Unknown',
            },
            last_message_at: message.created_at,
            unreadCount: isOwn ? conv.unreadCount : isActive ? conv.unreadCount : conv.unreadCount + 1,
          };
        });
        return updated.sort(
          (a, b) =>
            new Date(b.last_message_at || b.created_at).getTime() -
            new Date(a.last_message_at || a.created_at).getTime()
        );
      });
    },
    [activeConversation, user?.id, loadConversations]
  );

  const handleTypingStart = useCallback(
    (data: any) => {
      const incomingId = data?.userId ?? data?.user_id ?? data?.user?.id;
      const convId = data?.conversation_id ?? data?.conversationId;
      if (!incomingId || incomingId === user?.id) return;
      if (!activeConversation || (convId && convId !== activeConversation.id)) return;

      setTypingUsers((prev) => Array.from(new Set([...prev, incomingId])));
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((id) => id !== incomingId));
      }, 1500);
    },
    [user?.id, activeConversation?.id]
  );

  // WebSocket event listeners setup
  useEffect(() => {
    if (!isConnected) return;
    onNewMessage(handleNewMessage);
    onTyping(handleTypingStart);
    
    // 🔄 conversation:upsert event listener - yeni conversation'lar için
    if (socket) {
      const handleConversationUpsert = () => {
        console.log('🔄 conversation:upsert received - refreshing conversations');
        loadConversations();
      };
      
      socket.on('conversation:upsert', handleConversationUpsert);
      
      // Cleanup
      return () => {
        offNewMessage(handleNewMessage);
        offTyping(handleTypingStart);
        socket.off('conversation:upsert', handleConversationUpsert);
      };
    }
    
    return () => {
      offNewMessage(handleNewMessage);
      offTyping(handleTypingStart);
    };
  }, [isConnected, socket, onNewMessage, offNewMessage, onTyping, offTyping, handleNewMessage, handleTypingStart, loadConversations]);

  // sayfaya girince çan badge'i sıfırla
  useEffect(() => {
    markMessageNotificationsAsRead();
  }, [markMessageNotificationsAsRead]);

  // Oda yönetimi
  useEffect(() => {
    if (!activeConversation || !isConnected) return;
    joinConversation(activeConversation.id);
    return () => {
      stopTyping(activeConversation.id);
      leaveConversation(activeConversation.id);
    };
  }, [activeConversation?.id, isConnected, joinConversation, leaveConversation, stopTyping]);

  useEffect(() => {
    if (activeConversation) markMessageNotificationsAsRead();
  }, [activeConversation?.id, markMessageNotificationsAsRead]);

  // conversation:upsert event dinleme - gizli konuşma geri geldiğinde
  useEffect(() => {
    if (!socket) return;

    const handleConversationUpsert = async (payload: any) => {
      console.log('🔄 Conversation upsert received:', payload);
      
      try {
        // Konuşma listesini yeniden yükle
        await loadConversations();
        
        // Eğer bu konuşma yeni eklendiyse ve şu anda aktif konuşma yoksa, seç
        if (!activeConversation && payload.id) {
          const updatedConversations = await messageService.getConversations();
          if (updatedConversations.success) {
            const newConv = updatedConversations.conversations?.find((c: Conversation) => c.id === payload.id);
            if (newConv) {
              setActiveConversation(newConv);
              joinConversation(newConv.id);
            }
          }
        }
      } catch (error) {
        console.error('Error handling conversation upsert:', error);
      }
    };

    socket.on('conversation:upsert', handleConversationUpsert);
    
    return () => {
      socket.off('conversation:upsert', handleConversationUpsert);
    };
  }, [socket, activeConversation, loadConversations, joinConversation]);

  useEffect(() => {
    setTypingUsers([]);
  }, [activeConversation?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    const grew = messages.length > prevMessagesLength.current;
    if (grew && shouldAutoScroll()) {
      const t = setTimeout(scrollToBottom, 60);
      prevMessagesLength.current = messages.length;
      return () => clearTimeout(t);
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  // Görünürlükle okundu işareti
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeConversation) {
        messageService.markAllMessagesRead(activeConversation.id);
        setConversations((prev) =>
        prev.map((c) => (c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c))
        );
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [activeConversation?.id]);

  // Mesajları yükle
  const loadMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const response = await messageService.getMessages(conversationId);
      if (response.success && response.messages) {
        const { messages } = response;
        setMessages(
          [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        );
        await messageService.markAllMessagesRead(conversationId);
        setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      showErrorNotification('Mesajlar yüklenemedi');
    } finally {
      setMessagesLoading(false);
    }
  };

  // İlandan konuşma oluştur
  const createConversationFromListing = async (listingId: string) => {
    try {
      const listingResponse = await api.get(`/listings/${listingId}`);
      if (listingResponse.data && listingResponse.data.id) {
        const listing = listingResponse.data;
        if (listing.user_id === user?.id) {
          showErrorNotification('Kendi ilanınıza mesaj gönderemezsiniz');
          return;
        }
        const response = await messageService.createConversationFromListing(listingId);
        if (response.success) {
          const convId = response.conversation.id;
          let fullConv = response.conversation as Conversation;
          try {
            const { conversation } = await messageService.getConversation(convId);
            fullConv = conversation;
          } catch {}
          setConversations((prev) => [fullConv, ...prev]);
          setActiveConversation(fullConv);
          setSearchParams({ conversation: convId });
          joinConversation(convId);
          await loadMessages(convId);
          showSuccessNotification('Konuşma başlatıldı');
        }
      } else {
        showErrorNotification('İlan bulunamadı');
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        showErrorNotification(error.response.data.error);
      } else {
        showErrorNotification('Konuşma başlatılamadı');
      }
    }
  };

  // Mesaj gönder
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || sendingMessage) return;

    const messageContent = newMessage.trim();
    const tempMessageId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempMessageId,
      content: messageContent,
      sender_id: user?.id || '',
      conversation_id: activeConversation.id,
      is_read: false,
      is_edited: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      users: {
        id: user?.id || '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        username: user?.username || undefined,
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');

    setConversations((prev) => {
      const now = new Date().toISOString();
      const updated = prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              lastMessage: {
                content: messageContent,
                created_at: now,
                sender_id: user?.id || '',
                sender_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
              },
              last_message_at: now,
            }
          : c
      );
      return updated.sort(
        (a, b) =>
          new Date(b.last_message_at || b.created_at).getTime() -
          new Date(a.last_message_at || a.created_at).getTime()
      );
    });

    setSendingMessage(true);
    try {
      if (isConnected) {
        sendWebSocketMessage(activeConversation.id, messageContent, (serverMsg) => {
          // ack geldi -> optimistic'i gerçek ile değiştir
          setMessages(prev => prev.map(m => m.id === tempMessageId ? serverMsg : m));
        });
      } else {
        // HTTP fallback
        const response = await messageService.sendMessage({
          conversationId: activeConversation.id,
          content: messageContent,
        });
        if (response.success) {
          setMessages((prev) => prev.map((msg) => (msg?.id === tempMessageId ? response.message : msg)));
        } else {
          setMessages((prev) => prev.filter((msg) => msg?.id !== tempMessageId));
          showErrorNotification('Mesaj gönderilemedi');
        }
      }
      stopTyping(activeConversation.id);
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
      showErrorNotification('Mesaj gönderilemedi');
    } finally {
      setSendingMessage(false);
    }
  };

  // Typing
  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (activeConversation && isConnected) {
      if (!isTyping) {
        setIsTyping(true);
        startTyping(activeConversation.id);
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        stopTyping(activeConversation.id);
      }, 1000);
    }
  };

  // Konuşma seç
  const selectConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    setSearchParams({ conversation: conversation.id });
    await loadMessages(conversation.id);
  };

  // Initialize
  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    const initialize = async () => {
      setLoading(true);
      try {
        const convs = await loadConversations();
        if (listingParam && !conversationParam) {
          try {
            await createConversationFromListing(listingParam);
          } catch {}
        } else if (conversationParam) {
          const conv = convs.find((c) => c.id === conversationParam);
          if (conv) await selectConversation(conv);
        }
      } catch {
        setError('Sayfa yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [user, navigate, listingParam, conversationParam, loadConversations]);

  // Typing timeout cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, []);

  // Smart notification için aktif konuşma
  useEffect(() => {
    setActiveConversationId(activeConversation?.id ?? null);
    
    // Mark conversation as read when it becomes active
    if (activeConversation?.id) {
      markConversationAsRead(activeConversation.id);
    }
    
    return () => setActiveConversationId(null);
  }, [activeConversation?.id, setActiveConversationId, markConversationAsRead]);

  // Filtre
  const filteredConversations = useMemo(() => {
    const q = (searchTerm || '').toLowerCase().trim();
    return (conversations || []).filter((conv) => {
      const fields = [conv?.otherParticipant?.first_name, conv?.otherParticipant?.last_name, conv?.listing?.title].map(
        (v) => (v || '').toLowerCase()
      );
      return fields.some((v) => v.includes(q));
    });
  }, [conversations, searchTerm]);

  if (!user) return null;

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" action={<Button onClick={() => window.location.reload()}>Yeniden Yükle</Button>}>
            {error}
          </Alert>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: { xs: 1, md: 2 }, px: { xs: 1, md: 2 } }}>
        <Paper
          elevation={0}
          sx={{
            height: 'calc(100vh - 108px)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 0, md: 2 },
            bgcolor: 'transparent',
          }}
        >
          {/* LEFT: Conversations */}
          <Paper
            elevation={0}
            sx={{
              display: { xs: activeConversation ? 'none' : 'flex', md: 'flex' },
              flexDirection: 'column',
              width: { xs: '100%', md: '320px' },
              minWidth: { md: '320px' },
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                position: 'sticky',
                top: 0,
                zIndex: 1,
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
                Mesajlar
              </Typography>
              <TextField
                size="small"
                placeholder="Konuşmalarda ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              {!isConnected && (
                <Chip
                  label="Çevrimdışı"
                  color="warning"
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1, borderColor: 'rgba(0,0,0,0.12)', color: 'text.secondary' }}
                />
              )}
            </Box>

            {/* List */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                px: 1,
                py: 1,
                '&::-webkit-scrollbar': { width: 8 },
                '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.15)', borderRadius: 8 },
              }}
            >
              {filteredConversations.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">Henüz mesaj bulunmuyor</Typography>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {filteredConversations.map((conversation) => {
                    const selected = activeConversation?.id === conversation.id;
                    return (
                      <ListItem
                        key={conversation.id}
                        onClick={() => selectConversation(conversation)}
                        sx={{
                          mb: 0.75,
                          border: '1px solid',
                          borderColor: selected ? alpha('#19313B', 0.25) : 'divider',
                          bgcolor: selected ? alpha('#19313B', 0.06) : 'transparent',
                          cursor: 'pointer',
                          borderRadius: 1.5,
                          px: 1.25,
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            badgeContent={conversation.unreadCount ?? 0}
                            color="error"
                            invisible={(conversation.unreadCount ?? 0) === 0}
                          >
                            <Avatar sx={{ bgcolor: '#19313B', color: '#fff' }}>
                              {conversation.otherParticipant?.first_name?.charAt(0) ?? '?'}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" noWrap>
                                {`${conversation.otherParticipant?.first_name ?? 'Bilinmeyen'} ${
                                  conversation.otherParticipant?.last_name ?? ''
                                }`.trim()}
                              </Typography>
                              {conversation.listing && (
                                <Chip
                                  label={conversation.listing.title}
                                  size="small"
                                  variant="outlined"
                                  sx={{ maxWidth: 160, fontSize: '0.7rem', height: 20, borderColor: 'divider' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {conversation.lastMessage?.content ||
                                (conversation.lastMessage as any)?.body ||
                                'Henüz mesaj yok'}
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          </Paper>

          {/* RIGHT: Chat */}
          <Paper
            elevation={0}
            sx={{
              display: { xs: activeConversation ? 'flex' : 'none', md: 'flex' },
              flexDirection: 'column',
              flex: 1,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <Box
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                    {/* Back button for mobile */}
                    <IconButton
                      onClick={() => setActiveConversation(null)}
                      sx={{
                        display: { xs: 'flex', md: 'none' },
                        p: 0.5,
                        mr: 0.5,
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                    
                    <Avatar 
                      sx={{ 
                        bgcolor: '#19313B', 
                        color: '#fff',
                        width: { xs: 36, md: 40 },
                        height: { xs: 36, md: 40 },
                      }}
                    >
                      {activeConversation.otherParticipant?.first_name?.charAt(0) ?? '?'}
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: { xs: '1rem', md: '1.25rem' },
                          fontWeight: 600,
                        }}
                      >
                        {`${activeConversation.otherParticipant?.first_name ?? 'Bilinmeyen'} ${
                          activeConversation.otherParticipant?.last_name ?? ''
                        }`.trim()}
                      </Typography>
                      {activeConversation.listing && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={`İlan: ${activeConversation.listing.title}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem', borderColor: 'divider' }}
                          />
                          {activeConversation.listing.price && (
                            <Chip
                              label={`${activeConversation.listing.price.toLocaleString('tr-TR')} TL`}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box>
                    {activeConversation.listing && (
                      <IconButton
                        onClick={() => navigate(`/listings/${activeConversation.listing?.id}`)}
                        title="İlanı görüntüle"
                        sx={{ color: 'text.secondary' }}
                      >
                        <InfoIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                {/* Messages */}
                <Box
                  ref={listRef}
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    px: { xs: 1, md: 2 },
                    py: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    '&::-webkit-scrollbar': { width: 8 },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.15)', borderRadius: 8 },
                  }}
                >
                  {messagesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flex: 1,
                        textAlign: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                          Henüz mesaj yok
                        </Typography>
                        <Typography>İlk mesajı gönderin!</Typography>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      {messages
                        .filter((message) => message && message.id && message.sender_id)
                        .map((message, index) => {
                          const isOwnMessage = message?.sender_id === user?.id;
                          const text = (message as any).content ?? (message as any).body ?? '';
                          return (
                            <Box
                              key={message?.id || `temp-${index}`}
                              sx={{
                                display: 'flex',
                                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                              }}
                            >
                              <Box
                                component={Paper}
                                elevation={0}
                                sx={{
                                  p: 1.1,
                                  maxWidth: '70%',
                                  color: isOwnMessage ? '#FFFFFF' : 'text.primary',
                                  bgcolor: isOwnMessage ? '#19313B' : '#F2F4F7',
                                  border: '1px solid',
                                  borderColor: isOwnMessage ? alpha('#19313B', 0.6) : 'rgba(0,0,0,0.06)',
                                  borderRadius: isOwnMessage ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                }}
                              >
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {text}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ display: 'block', mt: 0.5, opacity: 0.65, textAlign: 'right' }}
                                >
                                  {message?.created_at
                                    ? new Date(message.created_at).toLocaleTimeString('tr-TR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : ''}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      {typingUsers.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1,
                              bgcolor: '#F2F4F7',
                              border: '1px solid',
                              borderColor: 'rgba(0,0,0,0.06)',
                              borderRadius: '16px 16px 16px 4px',
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Yazıyor...
                            </Typography>
                          </Paper>
                        </Box>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </Box>

                {/* Message Input */}
                <Box
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    position: 'sticky',
                    bottom: 0,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, alignItems: 'flex-end' }}>
                    <TextField
                      fullWidth
                      placeholder="Mesajınızı yazın..."
                      value={newMessage}
                      onChange={handleTypingChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      multiline
                      maxRows={4}
                      disabled={sendingMessage}
                      size={window.innerWidth < 768 ? 'small' : 'medium'}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          pr: { xs: 0.5, md: 1 },
                          fontSize: { xs: '0.875rem', md: '1rem' },
                        },
                      }}
                    />
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      sx={{
                        bgcolor: '#19313B',
                        color: '#FFFFFF',
                        '&:hover': { bgcolor: '#14262E' },
                        width: { xs: 40, md: 46 },
                        height: { xs: 40, md: 46 },
                        flexShrink: 0,
                      }}
                    >
                      {sendingMessage ? (
                        <CircularProgress size={window.innerWidth < 768 ? 16 : 20} />
                      ) : (
                        <SendIcon sx={{ fontSize: { xs: 18, md: 24 } }} />
                      )}
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Bir konuşma seçin
                  </Typography>
                  <Typography>Mesajlaşmaya başlamak için sol taraftan uşma seçin</Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default RealTimeMessagesPage;
