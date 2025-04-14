import React from 'react';
import emptyDataIcon from '../../assets/icons/empty.svg';

interface EmptyDataPageProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  showButton?: boolean;
  icon?: string;
  className?: string;
}

const EmptyDataPage: React.FC<EmptyDataPageProps> = ({
  title = 'No records!',
  description = "You don't have any records yet",
  buttonText = 'Create New Session',
  onButtonClick,
  showButton = true,
  icon = emptyDataIcon,
  className = '',
}) => {
  return (
    <div
      className={`w-full h-full bg-black opacity-50 flex items-center justify-center ${className}`}
    >
      <div className='rounded-md bg-white flex flex-col items-center justify-center p-6 shadow-sm min-w-[400px]'>
        <img src={icon} alt='Empty data' className='mb-3' />
        <p className='text-gray-700 text-base font-semibold'>{title}</p>
        <p className='text-gray-500 text-sm mt-1'>{description}</p>
        {showButton && onButtonClick && (
          <button
            className='mt-4 bg-secondary text-white py-2 px-4 rounded-full hover:bg-secondary/90 transition-colors'
            onClick={onButtonClick}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyDataPage;
