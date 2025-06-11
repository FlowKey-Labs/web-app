import { FlowKeyIcon } from '../../assets/icons';
import { menuItems, bottomMenuItems } from '../../utils/dummyData';
import { useNavigate } from 'react-router-dom';
import {
  navigateToDashboard,
  navigateToSessions,
  navigateToStaff,
  navigateToClients,
  navigateToCalendar,
  navigateToProfile,
  navigateToSettings,
  navigateToHome,
} from '../../utils/navigationHelpers';
import { Role, useAuthStore } from '../../store/auth';
import { useMemo, useState, useEffect } from 'react';
import { useLogout } from '../../hooks/reactQuery';

type NavigationMap = {
  [key: string]: (navigate: ReturnType<typeof useNavigate>) => void;
};

const navigationMap: NavigationMap = {
  dashboard: navigateToDashboard,
  sessions: navigateToSessions,
  staff: navigateToStaff,
  clients: navigateToClients,
  calendar: navigateToCalendar,
  profile: navigateToProfile,
  settings: navigateToSettings,
};

interface SidebarProps {
  activeItem: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const permissionMap: Record<string, keyof Role> = {
  Staff: 'can_view_staff',
  Clients: 'can_view_clients',
  Sessions: 'can_view_sessions',
  Calendar: 'can_view_calendar',
  Profile: 'can_manage_profile',
  Settings: 'can_manage_settings',
};

function filterMenuItemsByRole<T extends { name: string }>(
  items: T[],
  role: Role
): T[] {
  return items.filter((item) => {
    const permissionKey = permissionMap[item.name];
    return permissionKey ? role[permissionKey] : true;
  });
}

const Sidebar = ({ activeItem, isOpen = true, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const logout = useLogout();
  const [isMobile, setIsMobile] = useState(false);

  const filteredMenuItems = useMemo(
    () => (role ? filterMenuItemsByRole(menuItems, role) : []),
    [role]
  );
  const filteredBottomMenuItems = useMemo(
    () => (role ? filterMenuItemsByRole(bottomMenuItems, role) : []),
    [role]
  );

  // Check if mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile && isOpen && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobile, isOpen, onClose]);

  const handleItemClick = (itemName: string) => {
    const route = itemName.toLowerCase();

    if (route === 'logout') {
      logout();
      return;
    }

    const navigationFn = navigationMap[route];
    if (navigationFn) {
      navigationFn(navigate);
    } else {
      navigate(`/${route}`);
    }

    if (isMobile && onClose) {
      onClose();
    }
  };

  const MobileBackdrop = () =>
    isMobile && isOpen ? (
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden'
        onClick={onClose}
        aria-label='Close sidebar'
      />
    ) : null;

  return (
    <>
      <MobileBackdrop />
      <div
        className={`
          fixed md:relative top-0 left-0 z-50 md:z-auto
          min-h-screen flex flex-col bg-white border-r border-gray-100 shadow-lg md:shadow-none
          transition-transform duration-300 ease-in-out
          ${
            isMobile
              ? `w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
              : 'min-w-[240px] translate-x-0'
          }
          py-6 h-screen overflow-y-auto
        `}
        role='navigation'
        aria-label='Main navigation'
      >
        <div className='flex items-center justify-center mb-8 px-6'>
          <h3
            className='flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-90 focus:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded-md p-1'
            onClick={() => navigateToHome(navigate)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToHome(navigate);
              }
            }}
            tabIndex={0}
            role='button'
            aria-label='Go to dashboard'
          >
            <FlowKeyIcon className='w-[33px] h-[29px] flex-shrink-0' />
            <span className='font-[900] text-[24px] text-primary'>FlowKey</span>
          </h3>
        </div>

        <div className='flex-1 overflow-y-auto px-4'>
          <div className='flex flex-col'>
            <ul className='space-y-2 flex flex-col w-full' role='menu'>
              {filteredMenuItems.map((item) => {
                const isActive = activeItem === item.name.toLowerCase();
                const IconComponent = isActive ? item.iconWhite : item.icon;
                return (
                  <li
                    key={item.name}
                    onClick={() => handleItemClick(item.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleItemClick(item.name);
                      }
                    }}
                    className={`
                      flex items-center cursor-pointer w-full h-11 rounded-lg px-4 py-2
                      text-sm font-medium transition-all duration-200 group
                      ${
                        isActive
                          ? 'bg-secondary text-white'
                          : 'text-[#6D7172] hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    tabIndex={0}
                    role='menuitem'
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className='flex items-center gap-3 w-full'>
                      <IconComponent className='w-5 h-5 flex-shrink-0' />
                      <span className='text-sm font-medium truncate'>
                        {item.name}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className='mt-auto px-4 pb-6'>
          <div className='h-[1px] w-full mb-4 bg-gray-200'></div>
          <ul className='space-y-2 flex flex-col w-full' role='menu'>
            {filteredBottomMenuItems.map((item) => {
              const isActive = activeItem === item.name.toLowerCase();
              const IconComponent = isActive ? item.iconWhite : item.icon;
              return (
                <li
                  key={item.name}
                  onClick={() => handleItemClick(item.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleItemClick(item.name);
                    }
                  }}
                  className={`
                    flex items-center cursor-pointer w-full h-11 rounded-lg px-4 py-2
                    text-sm font-medium transition-all duration-200 group
                    ${
                      isActive
                        ? 'bg-secondary text-white'
                        : 'text-[#6D7172] hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  tabIndex={0}
                  role='menuitem'
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className='flex items-center gap-3 w-full'>
                    <IconComponent className='w-5 h-5 flex-shrink-0' />
                    <span className='text-sm font-medium truncate'>
                      {item.name}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
