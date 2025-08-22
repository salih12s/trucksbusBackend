import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { api, ApiResponse, QueryParams, buildQuery } from '../../services/api';

export interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  _count?: {
    listings: number;
    messages: number;
  };
}

export interface AdminUsersFilters {
  q?: string; // Search by name, email, phone
  role?: 'USER' | 'ADMIN';
  isActive?: boolean;
}

export interface AdminUsersParams extends QueryParams {
  filters?: AdminUsersFilters;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  count: number;
}

// Get admin users with pagination and filtering
export const useAdminUsers = (
  params: AdminUsersParams = {}
): UseQueryResult<AdminUsersResponse, Error> => {
  const queryParams = buildQuery(params);
  
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async (): Promise<AdminUsersResponse> => {
      const url = `/admin/users${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get<ApiResponse<AdminUser[]>>(url);
      return {
        data: response.data.data,
        count: response.data.count || 0
      };
    },
    staleTime: 30_000,
  });
};

// Reports interfaces
export interface AdminReport {
  id: string;
  reason: string;
  description?: string;
  status: 'NEW' | 'RESOLVED';
  created_at: string;
  updated_at: string;
  reporter: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  listing: {
    id: string;
    title: string;
    price: number;
    users: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export interface AdminReportsFilters {
  status?: 'NEW' | 'RESOLVED';
  q?: string; // Search by listing title or reporter name
}

export interface AdminReportsParams extends QueryParams {
  filters?: AdminReportsFilters;
}

export interface AdminReportsResponse {
  data: AdminReport[];
  count: number;
}

// Get admin reports with pagination and filtering
export const useAdminReports = (
  params: AdminReportsParams = {}
): UseQueryResult<AdminReportsResponse, Error> => {
  const queryParams = buildQuery(params);
  
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: async (): Promise<AdminReportsResponse> => {
      const url = `/admin/reports${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get<ApiResponse<AdminReport[]>>(url);
      return {
        data: response.data.data,
        count: response.data.count || 0
      };
    },
    staleTime: 30_000,
  });
};

// Resolve report mutation
export const useResolveReport = (): UseMutationResult<
  AdminReport,
  Error,
  string,
  { previousData?: AdminReportsResponse }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string): Promise<AdminReport> => {
      const response = await api.put<ApiResponse<AdminReport>>(`/admin/reports/${reportId}/resolve`);
      return response.data.data;
    },
    
    onMutate: async (reportId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin', 'reports'] });

      // Snapshot previous data
      const previousData = queryClient.getQueryData<AdminReportsResponse>(['admin', 'reports']);

      // Optimistically update report status
      if (previousData) {
        queryClient.setQueryData<AdminReportsResponse>(['admin', 'reports'], {
          ...previousData,
          data: previousData.data.map(report => 
            report.id === reportId 
              ? { ...report, status: 'RESOLVED' as const, updated_at: new Date().toISOString() }
              : report
          )
        });
      }

      return { previousData };
    },

    onError: (_err, _reportId, context) => {
      // Rollback optimistic updates
      if (context?.previousData) {
        queryClient.setQueryData(['admin', 'reports'], context.previousData);
      }
    },

    onSettled: () => {
      // Always refetch after success or error
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
    }
  });
};
