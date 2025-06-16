import { SearchIcon } from '../../assets/icons';
import SearchInput from '../common/SearchInput';
import Button from '../common/Button';
import filterIcon from '../../assets/icons/filter.svg';
import filter2Icon from '../../assets/icons/filter2.svg'
import { useRef, useEffect } from 'react';

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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Preserve cursor position and focus during value updates
  useEffect(() => {
    if (searchInputRef.current && document.activeElement === searchInputRef.current) {
      const input = searchInputRef.current;
      const cursorPosition = input.selectionStart;
      // Small delay to ensure the value has been updated
      setTimeout(() => {
        if (input && cursorPosition !== null) {
          input.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    }
  }, [searchValue]);

  return (
    <div className='h-[80px] flex items-center justify-between px-8 py-12 space-x-12'>
      <div className='flex-shrink-0 justify-center items-center'>
        {title && (
          <div className='flex-shrink-0 self-start'>
            <h1 className='text-[32px] font-bold text-primary text-center'>
              {title}
            </h1>
          </div>
        )}
      </div>

      <div className='flex items-center gap-8 flex-1 justify-end'>
        {showSearch && (
          <div className=''>
            <SearchInput
              ref={searchInputRef}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              leftIcon={
                <div className='rounded-full cursor-pointer'>
                  <SearchIcon className='w-5 h-5 text-gray-400' />
                </div>
              }
              containerClassName='w-full'
              inputClassName='border rounded-full w-[350px] pl-12 h-12'
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
              h={52}
              size='sm'
              radius='md'
              leftSection={
                leftIcon && <img src={leftIcon} alt='Icon' className='w-3 h-3' />
              }
              rightSection={
                buttonIcon && <img src={buttonIcon} alt='Icon' className='w-3 h-3' />
              }
              style={{
                backgroundColor: '#1D9B5E',
                color: '#fff',
                fontSize: "16px",
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
