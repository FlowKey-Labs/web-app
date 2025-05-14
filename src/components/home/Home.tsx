import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import { useGetUserProfile } from '../../hooks/reactQuery';
import { useMemo } from 'react';
import { useAuthStore } from '../../store/auth';
import { GlobalDrawerManager } from '../drawers';

const Home = () => {
  const location = useLocation();
  const path = location.pathname.split('/')[1];
  const activeSection = path === '' ? 'dashboard' : path;

  const { data: userProfile } = useGetUserProfile();
  const setRole = useAuthStore((state) => state.setRole);

  const permissions = useMemo(() => {
    if (userProfile?.role) {
      setRole(userProfile.role)
      return userProfile.role;
    }
    return null;
  }, [userProfile, setRole]);

  return (
    <div className='flex min-h-screen bg-[#F8F9FA] justify-center'>
      <div className='flex w-full'>
        <Sidebar activeItem={activeSection} />
        <div className='flex-grow overflow-auto'>
          <Outlet />
        </div>
      </div>
      <GlobalDrawerManager />
    </div>
  );
};

export default Home;
