import { useNavigate } from 'react-router-dom';

export const navigateToDashboard = (navigate: ReturnType<typeof useNavigate>) => {
  navigate('/dashboard');
};

export const navigateToSessions = (
  navigate: ReturnType<typeof useNavigate>
) => {
  navigate(`/sessions`);
};

export const navigateToSessionDetails = (
  navigate: ReturnType<typeof useNavigate>,
  sessionId: string
) => {
  navigate(`/sessions/${sessionId}`);
};

export const navigateToStaffDetails = (
  navigate: ReturnType<typeof useNavigate>,
  staffId: string
) => {
  navigate(`/staff/${staffId}`);
};

export const navigateToStaff = (navigate: ReturnType<typeof useNavigate>) => {
  navigate(`/staff`);
};

export const navigateToClients = (navigate: ReturnType<typeof useNavigate>) => {
  navigate(`/clients`);
};

export const navigateToClientDetails = (
  navigate: ReturnType<typeof useNavigate>,
  clientId: string
) => {
  navigate(`/clients/${clientId}`);
};

export const navigateToGroupDetails = (
  navigate: ReturnType<typeof useNavigate>,
  groupId: string
) => {
  navigate(`/groups/${groupId}`);
};

export const navigateToCalendar = (
  navigate: ReturnType<typeof useNavigate>
) => {
  navigate(`/calendar`);
};

export const navigateToProfile = (
  navigate: ReturnType<typeof useNavigate>
) => {
  navigate('/profile');
};

export const navigateToSettings = (
  navigate: ReturnType<typeof useNavigate>
) => {
  navigate('/settings');
};
