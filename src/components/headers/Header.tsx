import { Badge, Tooltip } from '@mantine/core';
import SearchInput from '../common/SearchInput';
import { useGetUserProfile } from '../../hooks/reactQuery';

import {
  MessageNotificationIcon,
  NotificationBingIcon,
  SearchIcon,
} from '../../assets/icons';

interface HeaderProps {
  showSearch?: boolean;
}

const Header = ({ showSearch = true }: HeaderProps) => {
  const { data: userProfile } = useGetUserProfile();
  return (
    <div className='h-[80px] flex items-center justify-between px-11'>
      {showSearch && (
        <div className='flex-1 max-w-[50%]'>
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
      )}

      <div className='flex items-center justify-end gap-12 ml-auto'>
        <Tooltip
          label='Coming Soon'
          position='bottom'
          withArrow
          arrowSize={10}
          color='#1D9B5E'
        >
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
        </Tooltip>
        <Tooltip
          label='Coming Soon'
          position='bottom'
          withArrow
          arrowSize={10}
          color='#1D9B5E'
        >
          <div className='relative'>
            <MessageNotificationIcon className='w-6 h-6 cursor-pointer' />
          </div>
        </Tooltip>
        <span className='text-primary cursor-pointer'>
          {userProfile?.first_name} {userProfile?.last_name}
        </span>
      </div>
    </div>
  );
};

export default Header;
