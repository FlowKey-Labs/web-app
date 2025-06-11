import { SearchIcon } from '../../assets/icons';
import SearchInput from '../common/SearchInput';
import Button from '../common/Button';
import filterIcon from '../../assets/icons/filter.svg';
import filter2Icon from '../../assets/icons/filter2.svg';

interface HeaderProps {
  title?: string;
  buttonText?: string;
  buttonIcon?: string;
  leftIcon?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onButtonClick?: () => void;
  onSearchChange?: (value: string) => void;
  showFilterIcons?: boolean;
  showButton?: boolean;
  showSearch?: boolean;
}

const Header = ({
  title = '',
  buttonText = '',
  buttonIcon = '',
  leftIcon = '',
  searchPlaceholder = '',
  searchValue = '',
  onButtonClick,
  onSearchChange,
  showFilterIcons = false,
  showButton = true,
  showSearch = true,
}: HeaderProps) => {
  return (
    <div className='h-[80px] flex flex-col md:flex-row md:items-center justify-between px-2 md:px-8 md:py-12 py-6 mt-3 md:mt-0 md:space-x-12 space-x-2'>
      <div className='flex-shrink-0 justify-center items-center'>
        {title && (
          <div className='flex-shrink-0 self-start'>
            <h1 className='md:text-[32px] text-[24px] font-bold text-primary text-center'>
              {title}
            </h1>
          </div>
        )}
      </div>

      <div className='flex items-center md:gap-8 gap-4 pt-3 md:pt-0 flex-1 justify-end'>
        {showSearch && (
          <div className=''>
            <SearchInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              leftIcon={
                <div className='rounded-full cursor-pointer'>
                  <SearchIcon className='w-5 h-5 text-gray-400' />
                </div>
              }
              containerClassName='w-full'
              inputClassName='border rounded-full md:w-[350px] w-[180px] pl-12 md:h-12 h-10'
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
          <>
            <div className='hidden md:block'>
              <Button
                h={52}
                size='sm'
                radius='md'
                leftSection={
                  leftIcon && (
                    <img src={leftIcon} alt='Icon' className='w-3 h-3' />
                  )
                }
                rightSection={
                  buttonIcon && (
                    <img src={buttonIcon} alt='Icon' className='w-3 h-3' />
                  )
                }
                style={{
                  backgroundColor: '#1D9B5E',
                  color: '#fff',
                  fontSize: '16px',
                }}
                onClick={onButtonClick}
              >
                {buttonText}
              </Button>
            </div>
            <div className='flex md:hidden w-full justify-center items-center'>
              <Button
                h={40}
                w={180}
                size='sm'
                radius='xl'
                leftSection={
                  leftIcon && (
                    <img src={leftIcon} alt='Icon' className='w-3 h-3' />
                  )
                }
                style={{
                  backgroundColor: '#1D9B5E',
                  color: '#fff',
                  fontSize: '16px',
                }}
                onClick={onButtonClick}
              >
                {buttonText}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
