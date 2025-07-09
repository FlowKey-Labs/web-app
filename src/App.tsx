import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/react-query';
import Home from './components/home/Home';
import Login from './components/authentication/Login';
import Signup from './components/authentication/Signup';
import ForgotPassword from './components/authentication/ForgotPassword';
import PasswordResetLink from './components/authentication/PasswordResetLink';
import ResetPassword from './components/authentication/ResetPassword';
import SuccessfulPassReset from './components/authentication/SuccessfulPassReset';
import Welcome from './components/onboarding/Welcome';
import TeamMembers from './components/onboarding/TeamMembers';
import BusinessType from './components/onboarding/BusinessType';
import Purpose from './components/onboarding/Purpose';
import MonthlyClients from './components/onboarding/MonthlyClients';
import GettingStarted from './components/dashboard/GettingStarted';
import AllStaff from './components/staff/AllStaff';
import AllClasses from './components/sessions/AllSessions';
import ClassDetails from './components/sessions/SessionDetails';
import StaffDetails from './components/staff/StaffDetails';
import CalendarView from './components/calendar';
import AllClients from './components/clients/AllClients';
import Profile from './components/profile';
import LogoutSuccess from './components/authentication/Logout';
import Settings from './components/accountSettings';
import ClientDetails from './components/clients/ClientDetails';
import ComingSoon from './components/common/ComingSoon';
import SetPassword from './components/authentication/SetPassword';
import { useAuthStore, Role } from './store/auth';
import GroupDetails from './components/clients/GroupDetails';
import AuthWrapper from './components/common/AuthWrapper';
import BookingRequestDetails from './components/clients/BookingRequestDetails';
import AuditLogs from './components/auditLogs/AuditLogs';
import StaffPortal from './components/profile/StaffPortal';
import './App.css';
import FlowkeyLandingPage from './pages/FlowkeyLandingPage';
import PublicBookingPage from './pages/PublicBookingPage';
import LoadingScreen from './components/common/LoadingScreen';

import BookingCancel from './pages/booking/BookingCancel';
import BookingManage from './pages/booking/BookingManage';
import {
  BookingCancelled,
  BookingRescheduled,
} from './pages/booking/BookingSuccess';
import { TimezoneProvider } from './contexts/TimezoneContext';
import { useGetUserProfile } from './hooks/reactQuery';
import { ReactNode } from 'react';


// Component to handle role-gated routes with proper loading state
interface RoleGatedRouteProps {
  children: ReactNode;
  requiredPermission: (role: Role | null) => boolean;
}

const RoleGatedRoute = ({ children, requiredPermission }: RoleGatedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  
  const { isLoading: profileLoading } = useGetUserProfile({
    enabled: isAuthenticated,
    retry: false,
  });

  // Debug logging
  console.log('🔍 RoleGatedRoute Debug:', {
    isAuthenticated,
    role: role ? { id: role.id, name: role.name, permissions: Object.keys(role).filter(key => key.startsWith('can_')).reduce((acc, key) => ({ ...acc, [key]: role[key as keyof Role] }), {}) } : null,
    profileLoading,
    hasRole: !!role,
    permissionResult: role ? requiredPermission(role) : 'no-role',
    timestamp: new Date().toISOString()
  });

  // For authenticated users, wait for both profile loading to complete AND role to be available
  if (isAuthenticated && (profileLoading || !role)) {
    console.log('🔄 RoleGatedRoute: Showing loading screen', { profileLoading, hasRole: !!role });
    return <LoadingScreen />;
  }

  // For unauthenticated users, don't render anything (will be handled by AuthWrapper)
  if (!isAuthenticated) {
    console.log('🚫 RoleGatedRoute: User not authenticated');
    return null;
  }

  // Check permission once role is loaded
  if (role && requiredPermission(role)) {
    console.log('✅ RoleGatedRoute: Permission granted, rendering children');
    return <>{children}</>;
  }

  // If no permission, don't render the route (fallback to catch-all)
  console.log('❌ RoleGatedRoute: Permission denied', { 
    hasRole: !!role, 
    permissionResult: role ? requiredPermission(role) : 'no-role' 
  });
  return null;
};

function App() {
  const permisions = useAuthStore((state) => state.role);

  return (
    <MantineProvider
      theme={{
        fontFamily: 'Urbanist, sans-serif',
      }}
    >
      <Notifications position='top-right' />
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <TimezoneProvider>
          <Router>
            <Routes>
              {/* Authentication Routes - No authentication required */}
              <Route path='/' element={<FlowkeyLandingPage />} />
              
              {/* Public Booking Routes - No authentication required */}
              <Route
                path='/book/:businessSlug'
                element={
                  <AuthWrapper requireAuth={false} allowPublicAccess={true}>
                    <PublicBookingPage />
                  </AuthWrapper>
                }
              />
              
              {/* Direct Session Booking - No authentication required */}
              <Route
                path='/book/:businessSlug/session/:sessionId'
                element={
                  <AuthWrapper requireAuth={false} allowPublicAccess={true}>
                    <PublicBookingPage />
                  </AuthWrapper>
                }
              />
              
              {/* Direct Service Booking - No authentication required */}
              <Route
                path='/book/:businessSlug/service/:serviceId'
                element={
                  <AuthWrapper requireAuth={false} allowPublicAccess={true}>
                    <PublicBookingPage />
                  </AuthWrapper>
                }
              />
              
              {/* Direct Service Booking with Staff - No authentication required */}
              <Route
                path='/book/:businessSlug/service/:serviceId/staff/:staffId'
                element={
                  <AuthWrapper requireAuth={false} allowPublicAccess={true}>
                    <PublicBookingPage />
                  </AuthWrapper>
                }
              />
              
              {/* Direct Service Booking with Location - No authentication required */}
              <Route
                path='/book/:businessSlug/service/:serviceId/location/:locationId'
                element={
                  <AuthWrapper requireAuth={false} allowPublicAccess={true}>
                    <PublicBookingPage />
                  </AuthWrapper>
                }
              />
              
              {/* Direct Service Booking with Staff and Location - No authentication required */}
              <Route
                path='/book/:businessSlug/service/:serviceId/staff/:staffId/location/:locationId'
                element={
                  <AuthWrapper requireAuth={false} allowPublicAccess={true}>
                    <PublicBookingPage />
                  </AuthWrapper>
                }
              />
              
              {/* Direct Service Booking with Location and Staff (alternate order) - No authentication required */}
              <Route
                path='/book/:businessSlug/service/:serviceId/location/:locationId/staff/:staffId'
                element={
                  <AuthWrapper requireAuth={false} allowPublicAccess={true}>
                    <PublicBookingPage />
                  </AuthWrapper>
                }
              />
              
              {/* Public Booking Management Routes - No authentication required */}
              <Route
                path='/booking/cancel/:bookingReference'
                element={
                  <AuthWrapper requireAuth={false} allowPublicAccess={true}>
                    <BookingCancel />
                  </AuthWrapper>
                }
              />
              
              <Route
                path='/booking/manage/:bookingReference'
                element={
                  <AuthWrapper requireAuth={false} allowPublicAccess={true}>
                    <BookingManage />
                  </AuthWrapper>
                }
              />
              
              <Route
                path='/booking/cancelled'
                element={
                  <AuthWrapper requireAuth={false} allowPublicAccess={true}>
                    <BookingCancelled />
                  </AuthWrapper>
                }
              />
              
              <Route
                path='/booking/rescheduled'
                element={
                  <AuthWrapper requireAuth={false} allowPublicAccess={true}>
                    <BookingRescheduled />
                  </AuthWrapper>
                }
              />

              {/* Authentication routes */}
              <Route
                path='/login'
                element={
                  <AuthWrapper requireAuth={false}>
                    <Login />
                  </AuthWrapper>
                }
              />
              <Route
                path='/set-password'
                element={
                  <AuthWrapper requireAuth={false}>
                    <SetPassword />
                  </AuthWrapper>
                }
              />
              <Route
                path='/forgot-password'
                element={
                  <AuthWrapper requireAuth={false}>
                    <ForgotPassword />
                  </AuthWrapper>
                }
              />
              <Route
                path='/password-reset'
                element={
                  <AuthWrapper requireAuth={false}>
                    <PasswordResetLink />
                  </AuthWrapper>
                }
              />
              <Route
                path='/reset-password'
                element={
                  <AuthWrapper requireAuth={false}>
                    <ResetPassword />
                  </AuthWrapper>
                }
              />
              <Route
                path='/successful-password-reset'
                element={
                  <AuthWrapper requireAuth={false}>
                    <SuccessfulPassReset />
                  </AuthWrapper>
                }
              />

              {/* Signup route - only in development */}
              {import.meta.env.VITE_APP_ENVIRONMENT === 'development' && (
                <Route
                  path='/signup'
                  element={
                    <AuthWrapper requireAuth={false}>
                      <Signup />
                    </AuthWrapper>
                  }
                />
              )}

              {/* Protected Routes - Require authentication */}
              <Route
                path='/'
                element={
                  <AuthWrapper requireAuth={true}>
                    <Home />
                  </AuthWrapper>
                }
              >
                <Route path='/dashboard' element={<GettingStarted />} />
                <Route path='/welcome' element={<Welcome />} />
                <Route path='/team-members' element={<TeamMembers />} />
                <Route path='/business-type' element={<BusinessType />} />
                <Route path='/monthly-clients' element={<MonthlyClients />} />
                <Route path='/purpose' element={<Purpose />} />
                <Route path='/logout' element={<LogoutSuccess />} />

                {/* Permission-gated routes using both methods for compatibility */}
                
                {/* Staff routes */}
                <Route 
                  path='staff' 
                  element={
                    <RoleGatedRoute requiredPermission={(role) => !!(role?.can_view_staff)}>
                      <AllStaff />
                    </RoleGatedRoute>
                  } 
                />
                {permisions?.can_view_staff && (
                  <Route path='staff/:id' element={<StaffDetails />} />
                )}
                
                {/* Session routes */}
                <Route 
                  path='sessions' 
                  element={
                    <RoleGatedRoute requiredPermission={(role) => !!(role?.can_view_sessions)}>
                      <AllClasses />
                    </RoleGatedRoute>
                  } 
                />
                {permisions?.can_view_sessions && (
                  <Route path='sessions/:id' element={<ClassDetails />} />
                )}
                
                {/* Calendar route */}
                <Route 
                  path='calendar' 
                  element={
                    <RoleGatedRoute requiredPermission={(role) => !!(role?.can_view_calendar)}>
                      <CalendarView />
                    </RoleGatedRoute>
                  } 
                />
                
                {/* Client routes */}
                <Route 
                  path='clients' 
                  element={
                    <RoleGatedRoute requiredPermission={(role) => !!(role?.can_view_clients)}>
                      <AllClients />
                    </RoleGatedRoute>
                  } 
                />
                {permisions?.can_view_clients && (
                  <>
                    <Route path='groups/:id' element={<GroupDetails />} />
                    <Route path='clients/:id' element={<ClientDetails />} />
                    <Route
                      path='booking-requests/:id'
                      element={<BookingRequestDetails />}
                    />
                  </>
                )}
                
                {/* Profile route */}
                <Route 
                  path='profile' 
                  element={
                    <RoleGatedRoute requiredPermission={(role) => !!(role?.can_manage_profile)}>
                      <Profile />
                    </RoleGatedRoute>
                  } 
                />
                
                {/* Settings route */}
                <Route 
                  path='settings' 
                  element={
                    <RoleGatedRoute requiredPermission={(role) => !!(role?.can_manage_settings)}>
                      <Settings />
                    </RoleGatedRoute>
                  } 
                />

                {/* Audit Logs route - Permission-based access */}
                <Route 
                  path='audit-logs' 
                  element={
                    <RoleGatedRoute requiredPermission={(role) => !!(role?.can_view_audit_logs)}>
                      <AuditLogs />
                    </RoleGatedRoute>
                  } 
                />
                {permisions?.can_view_audit_logs && (
                  <Route path='audit-logs' element={<AuditLogs />} />
                )}

                {/* Staff Portal route - For staff members to manage their own exceptions */}
                <Route 
                  path='staff-portal' 
                  element={
                    <RoleGatedRoute requiredPermission={(role) => !!(role?.can_access_staff_portal)}>
                      <StaffPortal />
                    </RoleGatedRoute>
                  } 
                />

                {/* Catch-all route for authenticated users */}
                <Route path='*' element={<ComingSoon />} />
              </Route>

              {/* Redirect any other paths to login */}
              <Route path='*' element={<Navigate to='/login' replace />} />
            </Routes>
          </Router>
        </TimezoneProvider>

        {/* Add auth debugger for development */}
  
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
