import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import './App.css';

function App() {
  return (
    <MantineProvider
      theme={{
        fontFamily: 'Urbanist, sans-serif',
      }}
    >
      <Notifications position="top-right" />
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Router>
          <Routes>
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/password-reset' element={<PasswordResetLink />} />
            <Route path='/reset-password' element={<ResetPassword />} />
            <Route
              path='/successful-password-reset'
              element={<SuccessfulPassReset />}
            />
            <Route path='/welcome' element={<Welcome />} />
            <Route path='/team-members' element={<TeamMembers />} />
            <Route path='/business-type' element={<BusinessType />} />
            <Route path='/logout' element={<LogoutSuccess />} />
            <Route path='/monthly-clients' element={<MonthlyClients />} />
            <Route path='/purpose' element={<Purpose />} />
            <Route path='/' element={<Home />}>
              <Route index element={<GettingStarted />} />
              <Route path='dashboard' element={<GettingStarted />} />
              <Route path='staff' element={<AllStaff />} />
              <Route path='staff/:id' element={<StaffDetails />} />
              <Route path='sessions' element={<AllClasses />} />
              <Route path='sessions/:id' element={<ClassDetails />} />
              <Route path='calendar' element={<CalendarView />} />
              <Route path='clients' element={<AllClients />} />
              <Route path='clients/:id' element={<ClientDetails />} />
              <Route path='profile' element={<Profile />} />
              <Route path='settings' element={<Settings />} />
              <Route path='*' element={<ComingSoon />} />
              <Route path='dashboard' element={<GettingStarted />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
