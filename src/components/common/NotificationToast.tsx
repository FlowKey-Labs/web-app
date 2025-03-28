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
          className='w-5 h-5 text-green-500'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path
            fillRule='evenodd'
            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
            clipRule='evenodd'
          />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-700',
      icon: icon || (
        <svg
          className='w-5 h-5 text-red-500'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path
            fillRule='evenodd'
            d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
            clipRule='evenodd'
          />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      icon: icon || (
        <svg
          className='w-5 h-5 text-yellow-500'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path
            fillRule='evenodd'
            d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
            clipRule='evenodd'
          />
        </svg>
      ),
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-700',
      icon: icon || (
        <svg
          className='w-5 h-5 text-blue-500'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path
            fillRule='evenodd'
            d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
            clipRule='evenodd'
          />
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
        <div className='flex-shrink-0 pt-0.5'>{currentVariant.icon}</div>
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
