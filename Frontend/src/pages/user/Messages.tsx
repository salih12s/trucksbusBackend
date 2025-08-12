import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Badge,
  Divider,
  Chip,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import {
  Send,
  Search,
  MoreVert,
  AttachFile,
  EmojiEmotions,
  Phone,
  VideoCall,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
  lastMessage?: Message;
  unreadCount: number;
  listing?: {
    id: string;
    title: string;
    price: number;
    image: string;
  };
}

const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = 'user1'; // Mock current user

  useEffect(() => {
    // Mock conversations
    const mockConversations: Conversation[] = [
      {
        id: '1',
        participant: {
          id: 'user2',
          name: 'Ahmet Yılmaz',
          avatar: '/api/placeholder/40/40',
          isOnline: true,
        },
        lastMessage: {
          id: 'm1',
          conversationId: '1',
          senderId: 'user2',
          content: 'Kamyon hala satılık mı?',
          createdAt: new Date(Date.now() - 10 * 60 * 1000),
          isRead: false,
        },
        unreadCount: 2,
        listing: {
          id: '1',
          title: '2018 Mercedes Actros',
          price: 850000,
          image: '/api/placeholder/60/60',
        },
      },
      {
        id: '2',
        participant: {
          id: 'user3',
          name: 'Mehmet Kaya',
          avatar: '/api/placeholder/40/40',
          isOnline: false,
        },
        lastMessage: {
          id: 'm2',
          conversationId: '2',
          senderId: 'user1',
          content: 'Teşekkürler, iyi günler.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: true,
        },
        unreadCount: 0,
        listing: {
          id: '2',
          title: '2020 Volvo FH16',
          price: 1200000,
          image: '/api/placeholder/60/60',
        },
      },
      {
        id: '3',
        participant: {
          id: 'user4',
          name: 'Fatma Demir',
          avatar: '/api/placeholder/40/40',
          isOnline: true,
        },
        lastMessage: {
          id: 'm3',
          conversationId: '3',
          senderId: 'user4',
          content: 'Fiyatta pazarlık var mı?',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          isRead: true,
        },
        unreadCount: 0,
      },
    ];
    setConversations(mockConversations);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Mock messages for selected conversation
      const mockMessages: Message[] = [
        {
          id: '1',
          conversationId: selectedConversation,
          senderId: 'user2',
          content: 'Merhaba, ilanınızı gördüm.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: true,
        },
        {
          id: '2',
          conversationId: selectedConversation,
          senderId: 'user1',
          content: 'Merhaba, hangi araç için ilgileniyorsunuz?',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
          isRead: true,
        },
        {
          id: '3',
          conversationId: selectedConversation,
          senderId: 'user2',
          content: '2018 Mercedes Actros için. Kamyon hala satılık mı?',
          createdAt: new Date(Date.now() - 10 * 60 * 1000),
          isRead: false,
        },
        {
          id: '4',
          conversationId: selectedConversation,
          senderId: 'user2',
          content: 'Fiyatta pazarlık var mı?',
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
          isRead: false,
        },
      ];
      setMessages(mockMessages);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversation,
      senderId: currentUserId,
      content: newMessage.trim(),
      createdAt: new Date(),
      isRead: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.listing?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Mesajlar
      </Typography>

      <Paper sx={{ height: '80vh', display: 'flex', mt: 3 }}>
        {/* Conversations List */}
        <Box sx={{ width: 400, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Mesajlarda ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            {filteredConversations.map((conversation) => (
              <ListItem
                key={conversation.id}
                sx={{
                  cursor: 'pointer',
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: selectedConversation === conversation.id ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <ListItemAvatar>
                  <Badge
                    variant="dot"
                    color="success"
                    invisible={!conversation.participant.isOnline}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <Avatar src={conversation.participant.avatar}>
                      {conversation.participant.name.charAt(0)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {conversation.participant.name}
                      </Typography>
                      {conversation.unreadCount > 0 && (
                        <Badge badgeContent={conversation.unreadCount} color="primary" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {conversation.lastMessage?.content}
                      </Typography>
                      {conversation.listing && (
                        <Chip
                          label={conversation.listing.title}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5, fontSize: '0.75rem' }}
                        />
                      )}
                      {conversation.lastMessage && (
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(conversation.lastMessage.createdAt, { 
                            addSuffix: true, 
                            locale: tr 
                          })}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge
                    variant="dot"
                    color="success"
                    invisible={!selectedConv.participant.isOnline}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <Avatar src={selectedConv.participant.avatar}>
                      {selectedConv.participant.name.charAt(0)}
                    </Avatar>
                  </Badge>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {selectedConv.participant.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedConv.participant.isOnline ? 'Çevrimiçi' : 'Son görülme: 1 saat önce'}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <IconButton>
                    <Phone />
                  </IconButton>
                  <IconButton>
                    <VideoCall />
                  </IconButton>
                  <IconButton>
                    <MoreVert />
                  </IconButton>
                </Box>
              </Box>

              {/* Listing Info */}
              {selectedConv.listing && (
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <img
                          src={selectedConv.listing.image}
                          alt={selectedConv.listing.title}
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {selectedConv.listing.title}
                          </Typography>
                          <Typography variant="h6" color="success.main" fontWeight="bold">
                            {selectedConv.listing.price.toLocaleString('tr-TR')} TL
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {messages.map((message) => {
                  const isOwn = message.senderId === currentUserId;
                  return (
                    <Box
                      key={message.id}
                      sx={{
                        alignSelf: isOwn ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                      }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: isOwn ? 'primary.main' : 'grey.100',
                          color: isOwn ? 'white' : 'text.primary',
                          borderRadius: 2,
                          borderTopRightRadius: isOwn ? 0.5 : 2,
                          borderTopLeftRadius: isOwn ? 2 : 0.5,
                        }}
                      >
                        <Typography variant="body1">
                          {message.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            opacity: 0.7,
                          }}
                        >
                          {formatDistanceToNow(message.createdAt, { addSuffix: true, locale: tr })}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Mesajınızı yazın..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton>
                          <AttachFile />
                        </IconButton>
                        <IconButton>
                          <EmojiEmotions />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <Send />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Bir konuşma seçin
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Messages;
