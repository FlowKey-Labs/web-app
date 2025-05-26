import { useGetUserProfile } from '../../hooks/reactQuery';
import SearchBar from '../common/SearchBar';

interface HeaderProps {
  showSearch?: boolean;
}

const Header = ({ showSearch = true }: HeaderProps) => {
  const { data: userProfile } = useGetUserProfile();
  return (
    <div className='h-[70px] sm:h-[80px] flex items-center justify-between px-4 sm:px-6 lg:px-11'>
      {showSearch && (
        <div className="flex-1 max-w-md lg:max-w-lg xl:max-w-xl">
          <SearchBar />
        </div>
      )}

      <div className='flex items-center justify-end gap-3 sm:gap-6 lg:gap-12 ml-auto'>
        <span className='text-primary cursor-pointer text-sm sm:text-base font-medium truncate max-w-[120px] sm:max-w-none hover:text-secondary transition-colors duration-200'>
          <span className="hidden sm:inline">{userProfile?.first_name} {userProfile?.last_name}</span>
          <span className="sm:hidden">{userProfile?.first_name || 'User'}</span>
        </span>
      </div>
    </div>
  );
};

export default Header;
