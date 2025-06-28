import config from '../../utils/config';

const DropdownComingSoon = () => {
  return (
    <div className='p-4'>
      <h3 className='text-lg font-semibold text-gray-800 mb-2'>
        Coming Soon
      </h3>
      <p className='text-sm text-gray-600 mb-3'>
        This feature is under development. Stay tuned!
      </p>
      <p className='text-sm font-medium text-gray-500'>{config.emails.support}</p>
    </div>
  );
};

export default DropdownComingSoon;
