import { api } from './api';

export interface StoreStats {
  totalListings: number;
  totalViews: number;
  messages: number;
}

export interface StoreMessage {
  id: string;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface StoreListing {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  view_count: number;
  category: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface StoreListingsResponse {
  listings: StoreListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const storeService = {
  // Store istatistiklerini getir
  getStats: async (): Promise<StoreStats> => {
    try {
      const response = await api.get('/store/stats');
      return response.data.data;
    } catch (error) {
      console.error('Store stats error:', error);
      throw error;
    }
  },

  // Store mesajlarını getir
  getMessages: async (limit: number = 10): Promise<StoreMessage[]> => {
    try {
      const response = await api.get(`/store/messages?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Store messages error:', error);
      throw error;
    }
  },

  // Store ilanlarını getir
  getListings: async (page: number = 1, limit: number = 10): Promise<StoreListingsResponse> => {
    try {
      const response = await api.get(`/store/listings?page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Store listings error:', error);
      throw error;
    }
  },

  // Profil tamamlama yüzdesini getir
  getProfileCompletion: async (): Promise<{ percentage: number; suggestions: string[] }> => {
    try {
      const response = await api.get('/store/profile-completion');
      return response.data.data;
    } catch (error) {
      console.error('Profile completion error:', error);
      throw error;
    }
  }
};
