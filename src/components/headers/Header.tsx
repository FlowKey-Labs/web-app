import { Badge } from '@mantine/core';
import {
  MessageNotificationIcon,
  NotificationBingIcon,
  SearchIcon,
} from '../../assets/icons';
import SearchInput from '../common/SearchInput';

const Header = () => {
  return (
    <div className='h-[80px] flex items-center justify-center px-8'>
      <div className='w-1/2'>
        <SearchInput
          placeholder='Search Appointment, Clients, Staff etc'
          leftIcon={
            <div className='bg-[#F5F5F5] p-2 rounded-full cursor-pointer'>
              <SearchIcon className='w-4 h-4 text-primary' />
            </div>
          }
          containerClassName='w-[100%]'
          inputClassName=''
        />
      </div>

      <div className='flex w-1/2'>
        <div className='flex items-center gap-12 w-1/2 justify-end'>
          <div className='relative'>
            <NotificationBingIcon className='w-6 h-6 cursor-pointer' />
            <Badge
              className='absolute -top-3 -right-5 flex items-center justify-center text-primary'
              radius='xl'
              variant='filled'
              color='red'
              h={25}
              w={25}
              style={{ padding: 6 }}
            >
              12
            </Badge>
          </div>
          <div className='relative'>
            <MessageNotificationIcon className='w-6 h-6 cursor-pointer' />
          </div>
        </div>

        <span className='text-primary flex mr-12 w-1/2 justify-end cursor-pointer'>
          Doris Waithira
        </span>
      </div>
    </div>
  );
};

export default Header;
