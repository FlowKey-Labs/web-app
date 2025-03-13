import { TextInput, Badge } from '@mantine/core';
import {
  MessageNotificationIcon,
  NotificationBingIcon,
  SearchIcon,
} from '../../assets/icons';

const Header = () => {
  const notificationCount = 5;

  return (
    <div className='h-[112px] flex items-center gap-12 px-8'>
      <div className='w-[600px]'>
        <TextInput
          radius='md'
          w='100%'
          h={48}
          leftSection={
            <div className='bg-[#F5F5F5] p-1 rounded-xl'>
              <SearchIcon className='w-4 h-4' />
            </div>
          }
          placeholder='Search Appointment, Clients, Staff etc'
        />
      </div>

      <div className='flex items-center gap-6'>
        <div className='relative'>
          <NotificationBingIcon className='w-6 h-6' />
          <Badge
            className='absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center'
            radius='xl'
            variant='filled'
            color='red'
          >
            {notificationCount}
          </Badge>
        </div>
        <MessageNotificationIcon className='w-6 h-6' />
      </div>

      <span className='text-gray-800 font-medium ml-auto'>Doris Waithira</span>
    </div>
  );
};

export default Header;
