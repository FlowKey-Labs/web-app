import React from 'react';
import testImage from '../../assets/images/bg.svg';
import whiteBackground from '../../assets/images/whiteBg.svg';

interface MainOnboardingProps {
  children: React.ReactNode;
}

const MainOnboarding: React.FC<MainOnboardingProps> = ({ children }) => {
  return (
    <div
      className='flex flex-col min-h-screen'
      style={{
        backgroundImage: `url(${whiteBackground})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className='flex w-full h-[48px] justify-end items-center mb-4 lg:mb-8 px-4 lg:px-0'>
        <h3 className='text-sm font-urbanist text-[#162F3B] mr-6'>
          Having trouble? <span className='text-[#1D9B5E]'>Get Help</span>
        </h3>
      </div>

      <div className='flex flex-col lg:flex-row flex-1'>
        <div className='flex flex-col w-full lg:w-1/2 px-4 lg:px-8'>
          <div className='w-full flex justify-center'>{children}</div>
        </div>

        <div className='hidden lg:flex justify-center lg:justify-end items-end w-full lg:w-1/2 mt-8 lg:mt-0 '>
          <img
            src={testImage}
            alt='logo'
            className='h-[300px] lg:h-[500px] object-contain rounded-tl-[50px]'
          />
        </div>
      </div>
    </div>
  );
};

export default MainOnboarding;
