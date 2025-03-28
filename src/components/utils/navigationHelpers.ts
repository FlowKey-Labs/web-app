import { useNavigate } from 'react-router-dom';

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

export const navigateToStaff = (
  navigate: ReturnType<typeof useNavigate>,
) => {
  navigate(`/staff`);
};

export const navigateToClients = (
  navigate: ReturnType<typeof useNavigate>,
) => {
  navigate(`/clients`);
};
