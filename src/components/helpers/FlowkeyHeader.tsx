import { FlowKeyIcon } from '../../assets/icons';

export const FlowkeyHeader = () => {
  return (
    <div className='flex items-center space-x-2'>
      <FlowKeyIcon className='w-[40px] h-[40px]' />
      <p className='text-primary text-3xl font-extrabold'>FlowKey</p>
    </div>
  );
};
