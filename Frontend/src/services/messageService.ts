import { api } from './api';
import { normalizeMessage, normalizeConversation } from '../utils/normalizers';

// Message interface
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  users?: {
    id: string;
    first_name: string;
    last_name: string;
    username?: string;
  };
}

// Conversation interface
export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  listing_id?: string;
  created_at: string;
  updated_at?: string;
  last_message_at?: string;
  unreadCount: number;
  otherParticipant?: {
    id: string;
    first_name: string;
    last_name: string;
    username?: string;
  };
  listing?: {
    id: string;
    title: string;
    images?: string[];
  };
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
    sender_name?: string;
  };
}

// Request/Response interfaces
export interface SendMessageRequest {
  conversationId: string;
  content: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: Message;
}

// Clean messageService with single API instance
export const messageService = {
  // Get all conversations for current user
  async getConversations(): Promise<{
    success: boolean;
    conversations: Conversation[];
  }> {
    const response = await api.get('/conversations');
    
    // Normalize conversations
    if (response.data?.success && response.data?.conversations) {
      response.data.conversations = response.data.conversations.map(normalizeConversation);
    }
    
    return response.data;
  },

  // Get single conversation by ID
  async getConversation(id: string): Promise<{
    success: boolean;
    conversation: Conversation;
  }> {
    const response = await api.get(`/conversations/${id}`);
    
    // Normalize conversation
    if (response.data?.success && response.data?.conversation) {
      response.data.conversation = normalizeConversation(response.data.conversation);
    }
    
    return response.data;
  },

  // Send a message in a conversation
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await api.post(`/conversations/${data.conversationId}/messages`, {
      content: data.content,
      body: data.content // backup field for compatibility
    });
    
    // Normalize message
    if (response.data?.success && response.data?.message) {
      response.data.message = normalizeMessage(response.data.message);
    }
    
    return response.data;
  },

  // Get messages for a conversation
  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<{
    success: boolean;
    messages: Message[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      has_next: boolean;
      has_previous: boolean;
    };
  }> {
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit }
    });
    
    // Normalize messages
    if (response.data?.success && response.data?.messages) {
      response.data.messages = response.data.messages.map(normalizeMessage);
    }
    
    return response.data;
  },

  // Mark all messages in conversation as read
  async markAllMessagesRead(conversationId: string): Promise<{
    success: boolean;
  }> {
    const response = await api.put(`/conversations/${conversationId}/read`);
    return response.data;
  },

  // Get unread count for current user
  async getUnreadCount(): Promise<{
    success: boolean;
    data: {
      count: number;
    };
  }> {
    const response = await api.get('/me/unread-count');
    return response.data;
  },

  // Start or create conversation with another user about a listing
  async startConversation(data: {
    listingId: string;
    otherUserId: string;
    initialMessage?: string;
  }): Promise<{
    success: boolean;
    conversation: Conversation;
    message?: Message;
  }> {
    const response = await api.post('/conversations', {
      listing_id: data.listingId,
      participant_id: data.otherUserId,
      initial_message: data.initialMessage
    });
    
    // Normalize response
    if (response.data?.success) {
      if (response.data?.conversation) {
        response.data.conversation = normalizeConversation(response.data.conversation);
      }
      if (response.data?.message) {
        response.data.message = normalizeMessage(response.data.message);
      }
    }
    
    return response.data;
  },

  // Delete a conversation
  async deleteConversation(conversationId: string): Promise<{
    success: boolean;
  }> {
    const response = await api.delete(`/conversations/${conversationId}`);
    return response.data;
  }
};

export default messageService;
