
import comingSoonIcon from '../../assets/icons/comingSoon.svg';

const DropdownComingSoon = () => {
  return (
    <div className='flex flex-col items-center gap-2 p-6 space-y-4'>
        <p className='text-sm font-medium text-gray-500'>This feature is</p>
      <p className='text-2xl font-bold text-secondary'>Coming Soon</p>
      <img src={comingSoonIcon} alt='coming soon' className='w-18 h-18' />
      <p className='text-sm font-medium text-gray-500'>support@flowkeys.com</p>
    </div>
  );
};

export default DropdownComingSoon;
