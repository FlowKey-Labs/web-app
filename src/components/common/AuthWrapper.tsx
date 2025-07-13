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
  const currentRole = useAuthStore((state) => state.role);
  
  // Only call profile API for routes that require authentication
  const shouldLoadProfile = requireAuth && isAuthenticated;
  
  console.log('🔐 AuthWrapper Debug:', {
    path: location.pathname,
    requireAuth,
    isAuthenticated,
    shouldLoadProfile,
    currentRole: currentRole ? { id: currentRole.id, name: currentRole.name } : null,
    timestamp: new Date().toISOString()
  });
  
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useGetUserProfile({
    enabled: shouldLoadProfile,
    retry: false,
    onError: () => {
      console.log('❌ AuthWrapper: Profile loading error, logging out');
      const logout = useAuthStore.getState().logout;
      logout();
      window.location.href = "/login";
    },
  });

  console.log('📊 AuthWrapper Profile State:', {
    userProfile: userProfile ? { 
      id: userProfile.id, 
      email: userProfile.email, 
      role: userProfile.role ? { id: userProfile.role.id, name: userProfile.role.name } : null 
    } : null,
    profileLoading,
    profileError: profileError ? String(profileError) : null,
    shouldLoadProfile
  });

  useEffect(() => {
    console.log('🔄 AuthWrapper useEffect triggered:', {
      shouldLoadProfile,
      hasUserProfile: !!userProfile,
      hasRole: !!(userProfile?.role),
      profileLoading,
      currentRoleInStore: currentRole ? { id: currentRole.id, name: currentRole.name } : null
    });

    // Set role immediately when userProfile is available, regardless of loading state
    if (shouldLoadProfile && userProfile?.role) {
      console.log('✅ AuthWrapper: Setting role in store:', userProfile.role);
      setRole(userProfile.role);
    }
  }, [userProfile, shouldLoadProfile, setRole]);

  // Show loading screen for authenticated users while profile is loading OR role is not yet set
  if (requireAuth && isAuthenticated && (profileLoading || (!currentRole && shouldLoadProfile))) {
    console.log('🔄 AuthWrapper: Showing loading screen for profile loading');
    return <LoadingScreen />;
  }

  // Redirect unauthenticated users to login for protected routes
  if (requireAuth && !isAuthenticated) {
    console.log('🚫 AuthWrapper: Redirecting to login - not authenticated');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle public routes (requireAuth = false)
  if (!requireAuth) {
    // If allowPublicAccess is true, allow both authenticated and unauthenticated users
    if (allowPublicAccess) {
      console.log('🌐 AuthWrapper: Allowing public access');
      return <>{children}</>;
    }
    
    // If allowPublicAccess is false and user is authenticated, redirect to dashboard
    if (isAuthenticated) {
      const authPages = ['/login', '/signup', '/forgot-password', '/reset-password', '/set-password', '/password-reset', '/successful-password-reset'];
      if (authPages.includes(location.pathname)) {
        console.log('🏠 AuthWrapper: Redirecting authenticated user to dashboard');
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  console.log('✅ AuthWrapper: Rendering children');
  return <>{children}</>;
};

export default AuthWrapper;
