import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  registerUser,
  loginUser,
  business_profile,
  update_business_profile,
  get_business_profile,
  searchCities,
  get_business_services,
} from '../api/api';
import { useAuthStore } from '../store/auth';
import { BusinessServices } from '../types/business';

export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      setAuth(data.accessToken, data.user);
    },
    onError: (error) => {
      console.error('Failed to register==>', error);
    },
  });
};

export const useLoginUser = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      setAuth(data.access, data.user);
    },
    onError: (error) => {
      console.error('Failed to log in==>', error);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  return () => {
    logout();
    window.location.href = '/login';
  };
};

export const useBusinessProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: business_profile,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Failed to update business profile==>', error);
    },
  });
};

export const useUpdateBusinessProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updateData }: {
      id: string;
      updateData: {
        business_name?: string;
        contact_person?: string;
        contact_email?: string;
        contact_phone?: string;
        address?: string;
        about?: string;
      };
    }) => {
      return update_business_profile(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: (error) => console.error('Update error:', error),
  });
};

export const useGetBusinessProfile = () => {
  return useQuery({
    queryKey: ['business_profile'],
    queryFn: get_business_profile,
  });
};

export const useSearchCities = () => {
  return useMutation({
    mutationFn: searchCities,
    onError: (error) => {
      console.error('Failed to search cities:', error);
    },
  });
};

export const useGetBusinessServices = () => {
  return useQuery<BusinessServices>({
    queryKey: ['business_services'],
    queryFn: get_business_services,
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
