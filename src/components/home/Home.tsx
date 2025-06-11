import { useLocation, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../sidebar/Sidebar';
import { GlobalDrawerManager } from '../drawers';

const Home = () => {
  const location = useLocation();
  const path = location.pathname.split('/')[1];
  const activeSection = path === '' ? 'dashboard' : path;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className='flex min-h-screen bg-[#F8F9FA]'>
      <div className='flex w-full relative'>
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className={`
              fixed top-3 left-6 z-[60] p-3 bg-white rounded-xl shadow-lg border border-gray-200 
              hover:bg-gray-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 
              transition-all duration-200 md:hidden
              ${isSidebarOpen ? 'left-[280px]' : 'left-6'}
            `}
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isSidebarOpen}
          >
            <svg
              className='w-5 h-5 text-gray-700'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              ) : (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              )}
            </svg>
          </button>
        )}

        <Sidebar
          activeItem={activeSection}
          isOpen={isMobile ? isSidebarOpen : true}
          onClose={closeSidebar}
        />

        <div
          className={`
          flex-grow overflow-auto transition-all duration-300 ease-in-out min-h-screen
          ${isMobile ? 'w-full' : 'ml-0'}
        `}
        >
          <Outlet />
        </div>
      </div>
      <GlobalDrawerManager />
    </div>
  );
};

export default Home;
