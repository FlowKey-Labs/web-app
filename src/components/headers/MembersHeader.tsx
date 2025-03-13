import { SearchIcon } from '../../assets/icons';
import SearchInput from '../common/SearchInput';
import Button from '../common/Button';
import plusIcon from '../../assets/icons/plus.svg';
import filterIcon from '../../assets/icons/filter.svg';
import filter2Icon from '../../assets/icons/filter2.svg';

const Header = () => {
  return (
    <div className='h-[80px] flex items-center justify-end px-8 space-x-12'>
      <div className=''>
        <SearchInput
          placeholder='Search by ID,Name or Subject'
          leftIcon={
            <div className=' rounded-full cursor-pointer'>
              <SearchIcon className='w-5 h-5 text-gray-400' />
            </div>
          }
          containerClassName='w-[100%]'
          inputClassName='border rounded-full w-[350px] pl-12 h-11 '
        />
      </div>

      <div className='flex space-x-12'>
        <div className='flex items-center gap-6 w-1/2 justify-end'>
          <div className='relative'>
            <div className='p-2 cursor-pointer bg-cardsBg rounded-full'>
              <img src={filterIcon} alt='filter icon' className='w-6 h-6 ' />
            </div>
          </div>
          <div className='relative'>
            <div className='p-2 cursor-pointer bg-cardsBg rounded-full'>
              <img src={filter2Icon} alt='filter icon' className='w-6 h-6 ' />
            </div>
          </div>
        </div>

        <span className='text-primary flex mr-12 w-1/2 justify-end cursor-pointer'>
          <Button
            w={120}
            size='sm'
            rightSection={
              <img src={plusIcon} alt='Plus' className='w-4 h-4 ' />
            }
            style={{
              backgroundColor: '#D2F801',
              color: '#162F3B',
            }}
          >
            New Staff
          </Button>
        </span>
      </div>
    </div>
  );
};

export default Header;
