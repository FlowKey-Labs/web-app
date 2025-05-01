import { Badge } from '@mantine/core';
import { useGetUserProfile } from '../../hooks/reactQuery';

import {
  MessageNotificationIcon,
  NotificationBingIcon,
} from '../../assets/icons';
import DropdownComingSoon from '../common/DropdownComingSoon';
import { HoverCard, Group } from '@mantine/core';
import SearchBar from '../common/SearchBar';

interface HeaderProps {
  showSearch?: boolean;
}

const Header = ({ showSearch = true }: HeaderProps) => {
  const { data: userProfile } = useGetUserProfile();
  return (
    <div className='h-[80px] flex items-center justify-between px-11'>
      {showSearch && (
        <SearchBar />
      )}

      <div className='flex items-center justify-end gap-12 ml-auto'>
        <Group justify='center'>
          <HoverCard width={280} shadow='md' position='bottom' withArrow>
            <HoverCard.Target>
              <div className='relative'>
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
              </div>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <DropdownComingSoon />
            </HoverCard.Dropdown>
          </HoverCard>
        </Group>

        <Group justify='center'>
          <HoverCard width={280} shadow='md' position='bottom' withArrow>
            <HoverCard.Target>
              <div className='relative'>
                <MessageNotificationIcon className='w-6 h-6 cursor-pointer' />
              </div>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <DropdownComingSoon />
            </HoverCard.Dropdown>
          </HoverCard>
        </Group>
        <span className='text-primary cursor-pointer'>
          {userProfile?.first_name} {userProfile?.last_name}
        </span>
      </div>
    </div>
  );
};

export default Header;
