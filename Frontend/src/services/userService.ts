import api from './api';

export interface UserProfile {
  id: string; // Changed from number to string to match backend
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  created_at: string;
}

export interface UserStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  messagesReceived?: number;
  joinDate: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  // Kullanıcı profil bilgilerini getir
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/me/profile');
    return response.data;
  },

  // Kullanıcı profil bilgilerini güncelle
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.put('/me/profile', data);
    return response.data;
  },

  // Kullanıcı istatistiklerini getir
  async getStats(): Promise<UserStats> {
    const response = await api.get('/me/stats');
    return response.data;
  },

  // Şifre değiştir
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.put('/me/change-password', data);
    return response.data;
  }
};
