import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { api, ApiResponse, QueryParams, buildQuery } from '../../services/api';

export interface AdminListing {
  id: string;
  title: string;
  description?: string;
  price: number;
  year: number;
  km?: number;
  
  // Base fields
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  is_approved: boolean;
  is_pending: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  reject_reason?: string;
  
  // Vehicle details
  color?: string;
  engine_power?: string;
  engine_volume?: string;
  fuel_type?: string;
  transmission?: string;
  vehicle_condition?: string;
  is_exchangeable?: boolean;
  
  // Truck specific fields
  body_type?: string;
  carrying_capacity?: string;
  cabin_type?: string;
  tire_condition?: string;
  drive_type?: string;
  plate_origin?: string;
  features?: any; // Json field for features
  damage_record?: string;
  paint_change?: string;
  tramer_record?: string;
  
  // Relations
  users: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  categories: {
    id: string;
    name: string;
  };
  brands?: {
    id: string;
    name: string;
  };
  models?: {
    id: string;
    name: string;
  };
  variants?: {
    id: string;
    name: string;
  };
  vehicle_types?: {
    id: string;
    name: string;
  };
  cities?: {
    id: string;
    name: string;
  };
  districts?: {
    id: string;
    name: string;
  };
  listing_images: Array<{
    id: string;
    image_url: string;
    order: number;
  }>;
  listing_properties: Array<{
    id: string;
    property_name: string;
    property_value: string;
  }>;
}

export interface AdminListingsFilters {
  q?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  isApproved?: boolean;
  isPending?: boolean;
  categoryId?: string;
  brandId?: string;
  cityId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminListingsParams extends QueryParams {
  filters?: AdminListingsFilters;
}

export interface AdminListingsResponse {
  data: AdminListing[];
  count: number;
}

// Get all admin listings with pagination and filtering
export const useAdminListings = (
  params: AdminListingsParams = {}
): UseQueryResult<AdminListingsResponse, Error> => {
  const queryParams = buildQuery(params);
  
  return useQuery({
    queryKey: ['admin', 'listings', params],
    queryFn: async (): Promise<AdminListingsResponse> => {
      const url = `/admin/listings${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get<ApiResponse<{ listings: AdminListing[], pagination: any }>>(url);
      
      // Debug log
      console.log('🔍 useAdminListings response:', response.data);
      
      return {
        data: response.data.data.listings,
        count: response.data.data.pagination.totalCount
      };
    },
    staleTime: 30_000,
  });
};

// Get pending listings (shortcut)
export const usePendingListings = (
  params: Omit<AdminListingsParams, 'filters'> = {}
): UseQueryResult<AdminListingsResponse, Error> => {
  const paramsWithFilter = {
    ...params,
    filters: { status: 'PENDING' as const }
  };
  const queryParams = buildQuery(paramsWithFilter);
  
  return useQuery({
    queryKey: ['admin', 'listings', 'pending', params],
    queryFn: async (): Promise<AdminListingsResponse> => {
      const url = `/admin/listings${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get<ApiResponse<{ listings: AdminListing[], pagination: any }>>(url);
      
      // Convert backend format to expected format
      return {
        data: response.data.data.listings,
        count: response.data.data.pagination.totalCount
      };
    },
    staleTime: 0, // Always fresh data for pending listings
    refetchInterval: 30_000, // Auto-refresh every 30 seconds
  });
};

// Get single listing detail
export const useAdminListingDetail = (
  id: string,
  options: { enabled?: boolean } = {}
): UseQueryResult<AdminListing, Error> => {
  return useQuery({
    queryKey: ['admin', 'listings', id],
    queryFn: async (): Promise<AdminListing> => {
      const response = await api.get<ApiResponse<AdminListing>>(`/admin/listings/${id}`);
      return response.data.data;
    },
    staleTime: 30_000,
    enabled: options.enabled !== false && !!id,
  });
};

// Approve listing mutation
export const useApproveListing = (): UseMutationResult<
  AdminListing,
  Error,
  string,
  { previousData?: AdminListingsResponse; previousPending?: AdminListingsResponse }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string): Promise<AdminListing> => {
      const response = await api.put<ApiResponse<AdminListing>>(`/admin/listings/${listingId}/approve`);
      return response.data.data;
    },
    
    onMutate: async (listingId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin', 'listings'] });

      // Snapshot previous data
      const previousListings = queryClient.getQueryData<AdminListingsResponse>(['admin', 'listings']);
      const previousPending = queryClient.getQueryData<AdminListingsResponse>(['admin', 'listings', 'pending']);

      // Optimistically remove from pending listings
      if (previousPending) {
        queryClient.setQueryData<AdminListingsResponse>(['admin', 'listings', 'pending'], {
          ...previousPending,
          data: previousPending.data.filter(listing => listing.id !== listingId),
          count: previousPending.count - 1
        });
      }

      return { previousData: previousListings, previousPending };
    },

    onError: (_err, _listingId, context) => {
      // Rollback optimistic updates
      if (context?.previousPending) {
        queryClient.setQueryData(['admin', 'listings', 'pending'], context.previousPending);
      }
    },

    onSettled: () => {
      // Always refetch after success or error
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
    }
  });
};

// Reject (hard delete) listing mutation
export const useRejectListing = (): UseMutationResult<
  void,
  Error,
  { listingId: string; reason?: string },
  { previousData?: AdminListingsResponse; previousPending?: AdminListingsResponse }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, reason }: { listingId: string; reason?: string }): Promise<void> => {
      await api.delete(`/admin/listings/${listingId}`, {
        params: reason ? { reason } : undefined
      });
    },
    
    onMutate: async ({ listingId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin', 'listings'] });

      // Snapshot previous data
      const previousListings = queryClient.getQueryData<AdminListingsResponse>(['admin', 'listings']);
      const previousPending = queryClient.getQueryData<AdminListingsResponse>(['admin', 'listings', 'pending']);

      // Optimistically remove from all listings
      if (previousListings) {
        queryClient.setQueryData<AdminListingsResponse>(['admin', 'listings'], {
          ...previousListings,
          data: previousListings.data.filter(listing => listing.id !== listingId),
          count: previousListings.count - 1
        });
      }

      if (previousPending) {
        queryClient.setQueryData<AdminListingsResponse>(['admin', 'listings', 'pending'], {
          ...previousPending,
          data: previousPending.data.filter(listing => listing.id !== listingId),
          count: previousPending.count - 1
        });
      }

      return { previousData: previousListings, previousPending };
    },

    onError: (_err, { listingId: _listingId }, context) => {
      // Rollback optimistic updates
      if (context?.previousData) {
        queryClient.setQueryData(['admin', 'listings'], context.previousData);
      }
      if (context?.previousPending) {
        queryClient.setQueryData(['admin', 'listings', 'pending'], context.previousPending);
      }
    },

    onSettled: () => {
      // Always refetch after success or error
      queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
    }
  });
};
