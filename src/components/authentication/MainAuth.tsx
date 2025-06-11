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
      className='flex-1 justify-center items-center h-screen p-4 overflow-y-auto'
      style={{
        backgroundImage: `url(${background})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className='flex flex-col lg:flex-row justify-around items-center w-full max-w-7xl mx-auto'>
        <div className='flex flex-col items-center space-y-12 md:space-y-0 lg:items-start mb-8 lg:mb-0'>
          <div className='flex items-center mt-6 md:mt-0'>
            <RegistrationFlowkeyIcon className='w-[54px] h-[47px]' />
            <h3 className='text-white text-3xl lg:text-5xl font-bold ml-[15px]'>
              FlowKey
            </h3>
          </div>
          <div className='w-full lg:w-[604px] flex flex-col justify-center items-center pt-4'>
            <RegistrationIcon className='w-[200px] h-[200px] lg:w-[402px] lg:h-[402px]' />
            <p className='text-white w-[80%] text-sm lg:text-base lg:w-[361px] text-center pt-4'>
              Manage all your clients, appointments and schedules with no time
              wasted
            </p>
          </div>
        </div>

        <div className='flex justify-center items-center w-full lg:w-auto md:h-[95vh] rounded-lg shadow-md overflow-y-auto mt-12 md:mt-0'>
          <div className='flex justify-center bg-white p-2 rounded-lg lg:py-4   w-full lg:w-[480px]'>
            <div className='w-full max-w-[350px]'>
              <h3 className='text-xl lg:text-xl font-bold mb-1 '>{title}</h3>
              <p className='text-gray-600 text-sm lg:text-base mb-2 '>
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
