import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import LoadingScreen from "./LoadingScreen";
import { useGetUserProfile } from "../../hooks/reactQuery";

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth: boolean;
  allowPublicAccess?: boolean;
}

/**
 * A wrapper component that handles authentication logic for routes
 * @param children - The components to render if authentication passes
 * @param requireAuth - Whether authentication is required for this route
 * @param allowPublicAccess - Whether to allow authenticated users to access this route (for public routes)
 */
const AuthWrapper = ({ children, requireAuth, allowPublicAccess = false }: AuthWrapperProps) => {
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

  // Show loading screen for authenticated users while profile is loading
  if (requireAuth && isAuthenticated && profileLoading) {
    return <LoadingScreen />;
  }

  // Redirect unauthenticated users to login for protected routes
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle public routes (requireAuth = false)
  if (!requireAuth) {
    // If allowPublicAccess is true, allow both authenticated and unauthenticated users
    if (allowPublicAccess) {
      return <>{children}</>;
    }
    
    // If allowPublicAccess is false and user is authenticated, redirect to dashboard
    
    if (isAuthenticated) {
      const authPages = ['/login', '/signup', '/forgot-password', '/reset-password', '/set-password', '/password-reset', '/successful-password-reset'];
      if (authPages.includes(location.pathname)) {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default AuthWrapper;
