import { useNavigate } from 'react-router-dom';

export const navigateToClassDetails = (
  navigate: ReturnType<typeof useNavigate>,
  classId: string
) => {
  navigate(`/classes/${classId}`);
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
