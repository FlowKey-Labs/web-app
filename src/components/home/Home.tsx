import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';

const Home = () => {
  const location = useLocation();
  const path = location.pathname.split('/')[1];
  const activeSection = path === '' ? 'dashboard' : path;

  return (
    <div className='flex min-h-screen bg-[#F8F9FA] justify-center'>
      <div className='flex w-full max-w-[1600px]'>
        <Sidebar activeItem={activeSection} />
        <div className='flex-grow'>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;
