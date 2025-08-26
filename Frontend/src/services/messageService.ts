import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://trucksbusbackend-production-0e23.up.railway.app/api';

// 🔧 Normalize message schema - HTTP responses
const normalizeMsg = (raw: any): Message => ({
  id: raw.id,
  conversation_id: raw.conversation_id ?? raw.conversationId,
  sender_id: raw.sender_id ?? raw.senderId,
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

// 🔧 Interceptor ile güvenli token yönetimi
const api = axios.create({ 
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Legacy function - compatibility için
const createAuthAxios = () => api;

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  listing_id?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  listing?: {
    id: string;
    title: string;
    price: number;
    image?: string;
  };
  otherParticipant: {
    id: string;
    first_name: string;
    last_name: string;
    username?: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
    sender_name: string;
  };
  unreadCount: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    first_name: string;
    last_name: string;
    username?: string;
  };
}

export interface CreateConversationRequest {
  listingId: string;
  receiverId: string;
}

export interface CreateConversationResponse {
  success: boolean;
  conversation: {
    id: string;
    participant1_id: string;
    participant2_id: string;
    listing_id?: string;
    created_at: string;
    updated_at: string;
    last_message_at?: string;
  };
  message?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: Message;
}

export const messageService = {
  // Get all conversations for the current user
  async getConversations(): Promise<{ success: boolean; conversations: Conversation[] }> {
    const api = createAuthAxios();
    const response = await api.get('/conversations');
    
    // 🔧 Normalize HTTP response conversations (handle lastMessage content/body field)
    if (response.data.success && response.data.conversations) {
      response.data.conversations = response.data.conversations.map((conv: any) => ({
        ...conv,
        lastMessage: conv.lastMessage ? {
          ...conv.lastMessage,
          content: conv.lastMessage.content ?? conv.lastMessage.body ?? ''
        } : undefined
      }));
    }
    
    return response.data;
  },

  // Get a specific conversation by ID
  async getConversation(conversationId: string): Promise<{ success: boolean; conversation: Conversation }> {
    const api = createAuthAxios();
    const response = await api.get(`/conversations/${conversationId}`);
    
    // 🔧 Normalize HTTP response conversation (handle lastMessage content/body field)
    if (response.data.success && response.data.conversation && response.data.conversation.lastMessage) {
      response.data.conversation.lastMessage = {
        ...response.data.conversation.lastMessage,
        content: response.data.conversation.lastMessage.content ?? response.data.conversation.lastMessage.body ?? ''
      };
    }
    
    return response.data;
  },

  // Create a new conversation
  async createConversation(data: CreateConversationRequest): Promise<CreateConversationResponse> {
    const api = createAuthAxios();
    const response = await api.post('/conversations', data);
    return response.data;
  },

  // Create conversation from listing
  async createConversationFromListing(listingId: string): Promise<CreateConversationResponse> {
    const api = createAuthAxios();
    const response = await api.post('/conversations/from-listing', {
      listingId: listingId
    });
    return response.data;
  },

  // Send a message in a conversation
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const api = createAuthAxios();
    const response = await api.post(`/conversations/${data.conversationId}/messages`, {
      // Send both content and body for backend compatibility
      content: data.content,
      body: data.content
    });
    return response.data;
  },

  // Get messages for a conversation
  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<{
    success: boolean;
    messages: Message[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const api = createAuthAxios();
    const response = await api.get(`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
    
    // 🔧 Normalize HTTP response messages
    if (response.data.success && response.data.messages) {
      response.data.messages = response.data.messages.map(normalizeMsg);
    }
    
    return response.data;
  },

  // Mark a message as read
  async markMessageRead(messageId: string): Promise<{ success: boolean; message: string }> {
    const api = createAuthAxios();
    const response = await api.put(`/conversations/messages/${messageId}/read`);
    return response.data;
  },

  // Mark all messages in a conversation as read
  async markAllMessagesRead(conversationId: string): Promise<{ success: boolean; message: string }> {
    const api = createAuthAxios();
    const response = await api.put(`/conversations/${conversationId}/read`);
    return response.data;
  },

  // Delete a conversation
  async deleteConversation(conversationId: string): Promise<{ success: boolean; message: string }> {
    const api = createAuthAxios();
    const response = await api.delete(`/conversations/${conversationId}`);
    return response.data;
  },

  // Get unread count
  async getUnreadCount(): Promise<{ success: boolean; data: { count: number } }> {
    const api = createAuthAxios();
    const response = await api.get('/me/unread-count');
    return response.data;
  }
};
