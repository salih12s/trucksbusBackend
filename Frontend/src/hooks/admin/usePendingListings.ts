import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { AdminListing, AdminListingsResponse } from './useAdminListings';

export interface UsePendingListingsParams {
  page: number;
  pageSize: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const usePendingListings = (params: UsePendingListingsParams) => {
  return useQuery({
    queryKey: ['admin', 'pendingListings', params],
    queryFn: async (): Promise<AdminListingsResponse> => {
      const requestParams = {
        ...params,
        status: 'PENDING'
      };
      
      const response = await api.get('/admin/listings', {
        params: requestParams
      });
      
      return {
        data: response.data.data.listings,
        count: response.data.data.pagination.totalCount
      };
    },
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: 300000, // Auto-refresh every 5 minutes instead of 30 seconds
  });
};

export const useApproveListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listingId: string): Promise<AdminListing> => {
      const response = await api.put(`/admin/listings/${listingId}/approve`);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingListings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboardStats'] });
    }
  });
};

export const useRejectListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ listingId, reason }: { listingId: string; reason: string }): Promise<AdminListing> => {
      const response = await api.put(`/admin/listings/${listingId}/reject`, { reason });
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'pendingListings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboardStats'] });
    }
  });
};
