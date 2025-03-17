import { SearchIcon } from '../../assets/icons';
import SearchInput from '../common/SearchInput';
import Button from '../common/Button';
import filterIcon from '../../assets/icons/filter.svg';
import filter2Icon from '../../assets/icons/filter2.svg';

interface HeaderProps {
  title?: string;
  buttonText?: string;
  buttonIcon?: string;
  searchPlaceholder?: string;
  onButtonClick?: () => void;
  showFilterIcons?: boolean;
  showButton?: boolean;
  showSearch?: boolean;
}

const Header = ({
  title = '',
  buttonText = '',
  buttonIcon = '',
  searchPlaceholder = '',
  onButtonClick,
  showFilterIcons = true,
  showButton = true,
  showSearch = true,
}: HeaderProps) => {
  return (
    <div className='h-[80px] flex items-center justify-between px-8 space-x-12'>
      <div className='flex-shrink-0 justify-center items-center'>
        {title && (
          <div className='flex-shrink-0 self-start'>
            <h1 className='text-xl font-bold text-primary text-center'>
              {title}
            </h1>
          </div>
        )}
      </div>

      <div className='flex items-center gap-8 flex-1 justify-end'>
        {showSearch && (
          <div className=''>
            <SearchInput
              placeholder={searchPlaceholder}
              leftIcon={
                <div className='rounded-full cursor-pointer'>
                  <SearchIcon className='w-5 h-5 text-gray-400' />
                </div>
              }
              containerClassName='w-full'
              inputClassName='border rounded-full w-[350px] pl-12 h-10'
            />
          </div>
        )}

        {showFilterIcons && (
          <div className='flex items-center gap-3'>
            <button className='p-2 bg-cardsBg rounded-full hover:opacity-90 transition-opacity'>
              <img src={filterIcon} alt='filter icon' className='w-5 h-5' />
            </button>
            <button className='p-2 bg-cardsBg rounded-full hover:opacity-90 transition-opacity'>
              <img src={filter2Icon} alt='filter icon' className='w-5 h-5' />
            </button>
          </div>
        )}

        {showButton && (
          <div>
            <Button
              w={140}
              size='sm'
              radius='xl'
              rightSection={
                <img src={buttonIcon} alt='Icon' className='w-4 h-4' />
              }
              style={{
                backgroundColor: '#D2F801',
                color: '#162F3B',
              }}
              onClick={onButtonClick}
            >
              {buttonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
