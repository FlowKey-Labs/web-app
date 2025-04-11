import { X } from 'lucide-react'; 
import { useEffect } from 'react';

type NotificationProps = {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description: string;
  onClose?: () => void;
  autoClose?: number | false;
  icon?: React.ReactNode;
};

const NotificationToast = ({
  type = 'info',
  title,
  description,
  onClose,
  autoClose = 3000,
  icon,
}: NotificationProps) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const variants = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-700',
      icon: icon || (
        <svg
          className='w-6 h-6 text-green-500'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
          <polyline points='22 4 12 14.01 9 11.01' />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-700',
      icon: icon || (
        <svg
          className='w-6 h-6 text-red-500'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <circle cx='12' cy='12' r='10' />
          <line x1='15' y1='9' x2='9' y2='15' />
          <line x1='9' y1='9' x2='15' y2='15' />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      icon: icon || (
        <svg
          className='w-6 h-6 text-yellow-500'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
          <line x1='12' y1='9' x2='12' y2='13' />
          <line x1='12' y1='17' x2='12.01' y2='17' />
        </svg>
      ),
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-700',
      icon: icon || (
        <svg
          className='w-6 h-6 text-blue-500'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <circle cx='12' cy='12' r='10' />
          <line x1='12' y1='16' x2='12' y2='12' />
          <line x1='12' y1='8' x2='12.01' y2='8' />
        </svg>
      ),
    },
  };

  const currentVariant = variants[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 w-100 p-4 rounded-md shadow-lg border-l-4 ${currentVariant.bg} ${currentVariant.border} ${currentVariant.text} transition-all duration-300`}
    >
      <div className='flex items-start'>
        <div className='flex-shrink-0'>
          <div className={`rounded-full p-2 ${currentVariant.bg}`}>
            {currentVariant.icon}
          </div>
        </div>
        <div className='ml-3 flex-1'>
          <h3 className='text-sm font-medium'>{title}</h3>
          <p className='mt-1 text-sm'>{description}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className='ml-4 flex-shrink-0 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none'
          >
            <X className='h-5 w-5' />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationToast;
