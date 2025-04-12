import { FlowKeyIcon } from '../../assets/icons';
import flowkeyIcon from '../../assets/icons/flowkeyIcon.svg';

export const FlowkeyHeader = () => {
  return (
    <div className='flex items-center space-x-2'>
      <FlowKeyIcon className='w-[40px] h-[40px]' />
      <p className='text-primary text-3xl font-extrabold'>FlowKey</p>
    </div>
  );
};

export const FlowkeyOnboardingHeader = () => {
  return (
    <div className='flex items-center space-x-2'>
      <img src={flowkeyIcon} alt='flowkey' className='w-[40px] h-[40px]' />
      <p className='font-[700] text-primary text-[40px]'>FlowKey</p>
    </div>
  );
};
