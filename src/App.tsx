import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
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

function App() {
  return (
    <MantineProvider
      theme={{
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
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
          <Route path='/monthly-clients' element={<MonthlyClients />} />
          <Route path='/purpose' element={<Purpose />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
