import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import { GlobalDrawerManager } from '../drawers';

const Home = () => {
  const location = useLocation();
  const path = location.pathname.split('/')[1];
  const activeSection = path === '' ? 'dashboard' : path;

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
