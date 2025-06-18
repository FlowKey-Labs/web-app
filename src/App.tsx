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
import { useAuthStore } from './store/auth';
import GroupDetails from './components/clients/GroupDetails';
import AuthWrapper from './components/common/AuthWrapper';
import BookingRequestDetails from './components/clients/BookingRequestDetails';
import AuditLogs from './components/auditLogs/AuditLogs';
import './App.css';
import FlowkeyLandingPage from './pages/FlowkeyLandingPage';
import PublicBookingPage from './pages/PublicBookingPage';

import BookingCancel from './pages/booking/BookingCancel';
import BookingManage from './pages/booking/BookingManage';
import { TimezoneProvider } from './contexts/TimezoneContext';

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
            
            {/* Public Booking Route - No authentication required */}
            <Route
              path='/book/:businessSlug'
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

              {/* Permission-gated routes */}
              {permisions?.can_view_staff && (
                <Route path='staff' element={<AllStaff />} />
              )}
              {permisions?.can_view_staff && (
                <Route path='staff/:id' element={<StaffDetails />} />
              )}
              {permisions?.can_view_sessions && (
                <Route path='sessions' element={<AllClasses />} />
              )}
              {permisions?.can_view_sessions && (
                <Route path='sessions/:id' element={<ClassDetails />} />
              )}
              {permisions?.can_view_calendar && (
                <Route path='calendar' element={<CalendarView />} />
              )}
              {permisions?.can_view_clients && (
                <>
                  <Route path='clients' element={<AllClients />} />
                  <Route path='groups/:id' element={<GroupDetails />} />
                  <Route path='clients/:id' element={<ClientDetails />} />
                  <Route path='booking-requests/:id' element={<BookingRequestDetails />} />
                </>
              )}
              {permisions?.can_manage_profile && (
                <Route path='profile' element={<Profile />} />
              )}
              {permisions?.can_manage_settings && (
                <Route path='settings' element={<Settings />} />
              )}

              {/* Audit Logs route - Permission-based access */}
              {permisions?.can_view_audit_logs && (
                <Route path='audit-logs' element={<AuditLogs />} />
              )}

              {/* Catch-all route for authenticated users */}
              <Route path='*' element={<ComingSoon />} />
            </Route>

            {/* Redirect any other paths to login */}
            <Route path='*' element={<Navigate to='/login' replace />} />
          </Routes>
        </Router>
        </TimezoneProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
