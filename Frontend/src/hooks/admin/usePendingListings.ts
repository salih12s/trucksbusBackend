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
      const response = await api.get('/admin/listings', {
        params: {
          ...params,
          page: params.page + 1, // Convert 0-based to 1-based
          status: 'PENDING'
        }
      });
      
      return response.data.data;
    },
    staleTime: 0, // Always refetch pending listings
    refetchInterval: 30000, // Auto-refresh every 30 seconds
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
