import { useState } from 'react';
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

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');

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
    <div className='w-full h-screen flex flex-col'>
      <div className='flex justify-center items-center pt-[20px] pb-[20px]'>
        <h3 className='flex items-center gap-[4px]'>
          <FlowKeyIcon className='w-[33.43px] h-[29px]' />
          <span className='font-urbanist font-[900] text-[24px]'>FlowKey</span>
        </h3>
      </div>

      <div className='flex flex-col items-center flex-1'>
        <ul className='gap-2 flex flex-col mt-8 w-full items-center'>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;
            return (
              <li
                key={item.name}
                onClick={() => setActiveItem(item.name)}
                className={`flex justify-center items-center cursor-pointer w-[245px] h-[54px] rounded-md px-4 font-urbanist text-[16px] ${
                  isActive ? 'bg-[#1D9B5E] text-[#222B45]' : 'hover:bg-gray-100'
                }`}
              >
                <div className='relative w-full flex items-center justify-center -ml-8'>
                  <div className='absolute left-1/2 -translate-x-full pr-[24px]'>
                    <Icon className='w-[24px] h-[24px]' />
                  </div>
                  <div className='absolute left-1/2 translate-x-0'>
                    <span>{item.name}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className='flex flex-col items-center mb-8'>
        <div className='w-[245px] h-[1px] bg-black mb-8'></div>
        <ul className='gap-2 flex flex-col w-full items-center'>
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.name;
            return (
              <li
                key={item.name}
                onClick={() => setActiveItem(item.name)}
                className={`flex justify-center items-center cursor-pointer w-[245px] h-[54px] rounded-md px-4 font-urbanist text-[16px] ${
                  isActive ? 'bg-[#1D9B5E] text-[#222B45]' : 'hover:bg-gray-100'
                }`}
              >
                <div className='relative w-full flex items-center justify-center -ml-8'>
                  <div className='absolute left-1/2 -translate-x-full pr-[24px]'>
                    <Icon className='w-[24px] h-[24px]' />
                  </div>
                  <div className='absolute left-1/2 translate-x-0'>
                    <span>{item.name}</span>
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
