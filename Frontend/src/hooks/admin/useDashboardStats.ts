import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { api, ApiResponse } from '../../services/api';

export interface DashboardStats {
  pendingCount: number;
  activeCount: number;
  usersCount: number;
  reportsOpenCount: number;
  todayCreated: number;
  weekCreated: number;
  monthCreated: number;
  totalListings: number;
  totalMessages: number;
}

export const useDashboardStats = (
  options: {
    refetchInterval?: number;
    enabled?: boolean;
  } = {}
): UseQueryResult<DashboardStats, Error> => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
      return response.data.data;
    },
    staleTime: 30_000, // 30 seconds
    refetchInterval: options.refetchInterval || 30_000, // Auto refresh every 30s
    enabled: options.enabled !== false,
    ...options
  });
};
