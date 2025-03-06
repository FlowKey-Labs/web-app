import React from 'react';
import { RegistrationFlowkeyIcon, RegistrationIcon } from '../../assets/icons';

interface MainAuthProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const Main: React.FC<MainAuthProps> = ({
  title,
  subtitle,
  children,
  footer,
}) => {
  return (
    <div className='flex justify-center items-center min-h-screen bg-[#0F2028]'>
      <div className='flex justify-around items-center w-full'>
        <div className='flex flex-col'>
          <div className='flex items-center'>
            <RegistrationFlowkeyIcon className='w-[54px] h-[47px]' />
            <h3 className='text-white text-5xl font-bold ml-[15px]'>FlowKey</h3>
          </div>
          <div className='w-[604px] flex flex-col justify-center items-center pt-4'>
            <RegistrationIcon className='w-[402px] h-[402px]' />
            <p className='text-white text-base w-[361px] text-center pt-4'>
              Manage all your clients, appointments and schedules with no time
              wasted
            </p>
          </div>
        </div>
        <div className=''>
          <div className='flex justify-center bg-white p-8 rounded-lg shadow-md w-[480px] h-auto'>
            <div className='w-full max-w-[350px]'>
              <h3 className='text-3xl font-bold mb-2'>{title}</h3>
              <p className='text-gray-600 mb-6'>{subtitle}</p>
              {children}
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
