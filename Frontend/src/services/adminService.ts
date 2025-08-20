import api from './api';

export interface DashboardStats {
  totalUsers: {
    value: number;
    change: number;
    thisMonth: number;
    lastMonth: number;
  };
  totalListings: {
    value: number;
    change: number;
    thisMonth: number;
    lastMonth: number;
  };
  pendingListings: {
    value: number;
    active: number;
  };
  totalCategories: {
    value: number;
  };
  totalMessages: {
    value: number;
    change: number;
    thisMonth: number;
    lastMonth: number;
  };
  userStats: {
    today_users: number;
    week_users: number;
    month_users: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'user' | 'listing' | 'message';
  title: string;
  description: string;
  user: string;
  email?: string;
  time: string;
  status: string;
  price?: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    created_at: string;
    phone?: string;
  }>;
  recentListings: Array<{
    id: string;
    title: string;
    price: number;
    seller_name: string;
    created_at: string;
    is_pending: boolean;
  }>;
  topCategories: Array<{
    category_id: string;
    name: string;
    _count: { category_id: number };
  }>;
  topCities: Array<{
    city_id: string;
    name: string;
    _count: { city_id: number };
  }>;
  charts: {
    listingsByStatus: Array<{
      status: string;
      _count: { status: number };
    }>;
  };
  systemInfo: {
    uptime: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    nodeVersion: string;
    timestamp: string;
  };
}

class AdminService {
  async getDashboardStats(): Promise<DashboardData> {
    try {
      console.log('📊 Fetching dashboard stats...');
      const response = await api.get('/admin/dashboard/stats');
      
      if (response.data.success) {
        console.log('✅ Dashboard stats fetched:', response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Dashboard verilerini alırken hata oluştu');
      }
    } catch (error: any) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw new Error(error.response?.data?.message || error.message || 'Dashboard verilerini alırken hata oluştu');
    }
  }

  async getRecentActivities(limit: number = 20): Promise<RecentActivity[]> {
    try {
      console.log('🔔 Fetching recent activities...');
      const response = await api.get(`/admin/dashboard/activities?limit=${limit}`);
      
      if (response.data.success) {
        console.log('✅ Recent activities fetched:', response.data.data.length, 'activities');
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Son aktiviteler alınırken hata oluştu');
      }
    } catch (error: any) {
      console.error('❌ Error fetching recent activities:', error);
      throw new Error(error.response?.data?.message || error.message || 'Son aktiviteler alınırken hata oluştu');
    }
  }

  async getPendingListings(page: number = 1, limit: number = 10) {
    try {
      console.log('📋 Fetching pending listings...');
      const response = await api.get(`/admin/listings/pending?page=${page}&limit=${limit}`);
      
      if (response.data.success) {
        console.log('✅ Pending listings fetched:', response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Bekleyen ilanları alırken hata oluştu');
      }
    } catch (error: any) {
      console.error('❌ Error fetching pending listings:', error);
      throw new Error(error.response?.data?.message || error.message || 'Bekleyen ilanları alırken hata oluştu');
    }
  }

  async approveListings(listingIds: string[]) {
    try {
      console.log('✅ Approving listings:', listingIds);
      const promises = listingIds.map(id => 
        api.put(`/admin/listings/${id}/approve`)
      );
      
      const results = await Promise.all(promises);
      console.log('✅ Listings approved successfully');
      return results;
    } catch (error: any) {
      console.error('❌ Error approving listings:', error);
      throw new Error(error.response?.data?.message || error.message || 'İlanları onaylarken hata oluştu');
    }
  }

  async rejectListings(listingIds: string[], reason: string) {
    try {
      console.log('❌ Rejecting listings:', listingIds, 'Reason:', reason);
      const promises = listingIds.map(id => 
        api.put(`/admin/listings/${id}/reject`, { reason })
      );
      
      const results = await Promise.all(promises);
      console.log('✅ Listings rejected successfully');
      return results;
    } catch (error: any) {
      console.error('❌ Error rejecting listings:', error);
      throw new Error(error.response?.data?.message || error.message || 'İlanları reddederken hata oluştu');
    }
  }

  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) {
      return `${days} gün ${hours} saat`;
    } else if (hours > 0) {
      return `${hours} saat ${minutes} dakika`;
    } else {
      return `${minutes} dakika`;
    }
  }

  formatMemoryUsage(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('tr-TR').format(num);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return this.formatDate(date);
  }
}

export const adminService = new AdminService();
export default adminService;
