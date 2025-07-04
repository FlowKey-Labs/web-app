import { useQuery } from '@tanstack/react-query';
import {
  get_upcoming_birthdays,
  get_category_distribution,
  get_sessions_per_staff,
} from '../../api/analytics';

import { UpcomingBirthdaysResponse } from '../../types/birthdays';
import { CategoryDistributionResponse } from '../../types/categoryDistribution';
import { DailyStaffSessionsResponse } from '../../types/sessionTypes';

export const useGetUpcomingBirthdays = () => {
  const { data, isLoading, error } = useQuery<UpcomingBirthdaysResponse>({
    queryKey: ['upcoming-birthdays'],
    queryFn: () => get_upcoming_birthdays(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
  return { data, isLoading, error };
};

export const useGetCategoryDistribution = () => {
  const { data, isLoading, error } = useQuery<CategoryDistributionResponse>({
    queryKey: ['category-distribution'],
    queryFn: () => get_category_distribution(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
  return { data, isLoading, error };
};

export const useGetSessionsPerStaff = () => {
  const { data, isLoading, error } = useQuery<DailyStaffSessionsResponse | null>({
    queryKey: ['sessions-per-staff'],
    queryFn: async () => {
      try {
        const response = await get_sessions_per_staff();
        return response || null;
      } catch (error) {
        console.error('Error fetching sessions per staff:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
  
  return { 
    data: data || undefined, 
    isLoading, 
    error 
  };
};
