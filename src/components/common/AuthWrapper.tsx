import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import LoadingScreen from "./LoadingScreen";
import { useGetUserProfile } from "../../hooks/reactQuery";

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth: boolean;
}

/**
 * A wrapper component that handles authentication logic for routes
 * @param children - The components to render if authentication passes
 * @param requireAuth - Whether authentication is required for this route
 */
const AuthWrapper = ({ children, requireAuth }: AuthWrapperProps) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setRole = useAuthStore((state) => state.setRole);
  const { data: userProfile, isLoading: profileLoading } = useGetUserProfile({
    enabled: isAuthenticated,
    retry: false,
    onError: () => {
      const logout = useAuthStore.getState().logout;
      logout();
      window.location.href = "/login";
    },
  });

  useEffect(() => {
    if (isAuthenticated && userProfile?.role && !profileLoading) {
      setRole(userProfile.role);
    }
  }, [userProfile, profileLoading, isAuthenticated, setRole]);

  if (requireAuth && isAuthenticated && profileLoading) {
    return <LoadingScreen />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
