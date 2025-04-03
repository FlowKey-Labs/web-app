import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { registerUser, loginUser } from '../api/api';
import { setTokens } from '../utils/localstorage';

export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      console.log('User registered successfully');
      queryClient.invalidateQueries();
      setTokens(data.accessToken, data.refreshToken);
    },
    onError: (error) => {
      console.error('Failed to register ======>', error);
    },
  });
};

export const useLoginUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log('User logged in successfully');
      queryClient.invalidateQueries();
      setTokens(data.accessToken, data.refreshToken);
    },
    onError: (error) => {
      console.error('Failed to log in ======>', error);
    },
  });
};
