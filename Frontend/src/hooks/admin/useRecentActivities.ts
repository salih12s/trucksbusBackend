import { useQuery } from '@tanstack/react-query';
import adminService from '../../services/adminService';

export const useRecentActivities = (limit: number = 10, refetchInterval?: number) => {
  return useQuery({
    queryKey: ['admin', 'recent-activities', limit],
    queryFn: () => adminService.getRecentActivities(limit),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: refetchInterval || 1000 * 30, // 30 seconds default
  });
};
