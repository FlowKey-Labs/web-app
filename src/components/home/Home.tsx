import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';

const Home = () => {
  const location = useLocation();
  const path = location.pathname.split('/')[1];
  const activeSection = path === '' ? 'dashboard' : path;

  return (
    <div className='flex min-h-screen bg-[#F8F9FA]'>
      <Sidebar activeItem={activeSection} />
      <div className='flex-1 ml-[200px]'>
        <Outlet />
      </div>
    </div>
  );
};

export default Home;
