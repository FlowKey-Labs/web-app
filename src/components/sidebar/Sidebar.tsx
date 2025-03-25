import {
  FlowKeyIcon,
  DashboardIcon,
  StaffIcon,
  ClientsIcon,
  ClassesIcon,
  ChatsIcon,
  TransactionsIcon,
  CalendarIcon,
  SettingsIcon,
  LogoutIcon,
  ProfileIcon,
} from '../../assets/icons';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeItem: string;
}

const Sidebar = ({ activeItem }: SidebarProps) => {
  const navigate = useNavigate();
  const menuItems = [
    { name: 'Dashboard', icon: DashboardIcon },
    { name: 'Staff', icon: StaffIcon },
    { name: 'Clients', icon: ClientsIcon },
    { name: 'Sessions', icon: ClassesIcon },
    { name: 'Transactions', icon: TransactionsIcon },
    { name: 'Calendar', icon: CalendarIcon },
    { name: 'Chats', icon: ChatsIcon },
  ];

  const bottomMenuItems = [
    { name: 'Profile', icon: ProfileIcon },
    { name: 'Settings', icon: SettingsIcon },
    { name: 'Logout', icon: LogoutIcon },
  ];

  return (
    <div className='min-h-screen flex flex-col w-[230px] bg-[#ffffff] py-6 h-screen overflow-y-auto'>
      <div className='flex justify-center items-center mb-6'>
        <h3
          className='flex items-center gap-2 px-6 cursor-pointer transition-opacity hover:opacity-90'
          onClick={() => navigate('/dashboard')}
        >
          <FlowKeyIcon className='w-[33px] h-[29px]' />
          <span className='font-[900] text-[24px] text-primary'>FlowKey</span>
        </h3>
      </div>

      <div className='flex-1 overflow-y-auto'>
        <div className='flex flex-col items-center'>
          <ul className='gap-2 flex flex-col w-[90%] items-center'>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.name.toLowerCase();
              return (
                <li
                  key={item.name}
                  onClick={() => navigate(`/${item.name.toLowerCase()}`)}
                  className={`flex items-center cursor-pointer w-[168px] h-[35px] rounded-lg px-4 text-[14px] transition-colors hover:opacity-90 ${
                    isActive ? 'bg-secondary text-white' : 'text-[#6D7172]'
                  }`}
                >
                  <div className='relative w-full flex items-center justify-center -ml-8'>
                    <div className='absolute left-1/2 -translate-x-full pr-[16px]'>
                      <Icon
                        className={`w-[20px] h-[20px] ${
                          isActive
                            ? 'text-[#242424] stroke-[#242424]'
                            : 'text-[#6D7172] stroke-[#6D7172]'
                        }`}
                      />
                    </div>
                    <div className='absolute left-1/2 translate-x-0'>
                      <span className='text-[14px] font-[400]'>
                        {item.name}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className='mt-auto flex flex-col items-center pb-6'>
        <div className='h-[1px] w-[80%] mb-2 bg-gray-400'></div>
        <ul className='gap-2 flex flex-col w-[90%] items-center'>
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name.toLowerCase();
            return (
              <li
                key={item.name}
                onClick={() => navigate(`/${item.name.toLowerCase()}`)}
                className={`flex items-center cursor-pointer w-[168px] h-[35px] rounded-lg px-4 text-[14px] transition-colors hover:opacity-90 ${
                  isActive ? 'bg-secondary text-white' : 'text-[#6D7172]'
                }`}
              >
                <div className='relative w-full flex items-center justify-center -ml-8'>
                  <div className='absolute left-1/2 -translate-x-full pr-[16px]'>
                    <Icon
                      className={`w-[20px] h-[20px] ${
                        isActive
                          ? 'text-[#242424] stroke-[#242424]'
                          : 'text-[#6D7172] stroke-[#6D7172]'
                      }`}
                    />
                  </div>
                  <div className='absolute left-1/2 translate-x-0'>
                    <span className='text-[14px] font-[400]'>{item.name}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
