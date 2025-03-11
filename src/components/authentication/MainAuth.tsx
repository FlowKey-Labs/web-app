import React from 'react';
import { RegistrationFlowkeyIcon, RegistrationIcon } from '../../assets/icons';
import background from '../../assets/images/back.svg';

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
    <div
      className='flex justify-center items-center min-h-screen  p-4'
      style={{
        backgroundImage: `url(${background})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className='flex flex-col lg:flex-row justify-around items-center w-full max-w-7xl mx-auto'>
        <div className='flex flex-col items-center lg:items-start mb-8 lg:mb-0'>
          <div className='flex items-center'>
            <RegistrationFlowkeyIcon className='w-[54px] h-[47px]' />
            <h3 className='text-white text-3xl lg:text-5xl font-bold ml-[15px]'>
              FlowKey
            </h3>
          </div>
          <div className='w-full lg:w-[604px] flex flex-col justify-center items-center pt-4'>
            <RegistrationIcon className='w-[200px] h-[200px] lg:w-[402px] lg:h-[402px] hidden sm:block' />
            <p className='text-white w-[80%] text-sm lg:text-base lg:w-[361px] text-center pt-4'>
              Manage all your clients, appointments and schedules with no time
              wasted
            </p>
          </div>
        </div>

        <div className='w-full lg:w-auto'>
          <div className='flex justify-center bg-white p-6 lg:p-8 rounded-lg shadow-md w-full lg:w-[480px] h-auto'>
            <div className='w-full max-w-[350px]'>
              <h3 className='text-2xl lg:text-3xl font-bold mb-2 font-urbanist'>
                {title}
              </h3>
              <p className='text-gray-600 text-sm lg:text-base mb-6 font-urbanist'>
                {subtitle}
              </p>
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
