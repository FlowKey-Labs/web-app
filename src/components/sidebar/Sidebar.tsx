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
import Button from '../common/Button';

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
    { name: 'Classes', icon: ClassesIcon },
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
    <div className='min-h-screen flex flex-col w-[200px] bg-[#0F2028] fixed left-0 py-6'>
      <div className='flex justify-start items-center mb-12'>
        <h3
          className='flex items-center gap-2 px-6 cursor-pointer transition-opacity hover:opacity-90'
          onClick={() => navigate('/dashboard')}
        >
          <FlowKeyIcon className='w-[33px] h-[29px] fill-[#1D9B5E]' />
          <span className='font-[900] text-[24px] text-white'>FlowKey</span>
        </h3>
      </div>

      <div className='flex flex-col items-center flex-1'>
        <ul className='gap-2 flex flex-col w-[90%] items-center'>
          <h4 className='text-[#A7A9AA] text-[12px] self-start px-6 font-[500] mb-2'>
            MENU
          </h4>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name.toLowerCase();
            return (
              <li
                key={item.name}
                onClick={() => navigate(`/${item.name.toLowerCase()}`)}
                className={`flex items-center cursor-pointer w-[168px] h-[35px] rounded-xl px-4 text-[14px] transition-colors hover:opacity-90 ${
                  isActive ? 'bg-[#F2FDB3] text-[#242424]' : 'text-[#6D7172]'
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

      <div className='flex flex-col items-center mb-8 flex-1 mt-8'>
        <ul className='gap-2 flex flex-col w-[90%] items-center'>
          <h4 className='text-[#A7A9AA]  text-[12px] self-start px-6 font-[500] mb-2'>
            OTHER
          </h4>
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name.toLowerCase();
            return (
              <li
                key={item.name}
                onClick={() => navigate(`/${item.name.toLowerCase()}`)}
                className={`flex items-center cursor-pointer w-[168px] h-[35px] rounded-xl px-4 text-[14px] transition-colors hover:opacity-90 ${
                  isActive ? 'bg-[#F2FDB3] text-[#242424]' : 'text-[#6D7172]'
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
      <div className='flex h-full justify-center items-center w-full'>
        <div className='flex flex-col h-[160px] rounded-xl text-center p-4 items-center justify-between bg-flowkeySecondary w-[90%] '>
          <h4 className='text-[14px] font-[600] text-primary'>
            Let's Manage Your Data Better in Your Hand
          </h4>
          <div className='flex items-center'>
            <Button
              size='md'
              radius='xl'
              variant='filled'
              className='text-primary'
              styles={{
                root: {
                  backgroundColor: 'white',
                  color: '#242424',
                  fontSize: '12px',
                  fontWeight: 700,
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                  },
                },
              }}
            >
              Download App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
