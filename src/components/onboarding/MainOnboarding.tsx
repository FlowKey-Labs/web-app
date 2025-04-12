import React from 'react';
import whiteBackground from '../../assets/images/whiteBg.svg';
import onboardingImage from '../../assets/images/onboarding.svg';

interface MainOnboardingProps {
  children: React.ReactNode;
  imageHeight?: string; 
  imageWidth?: string; 
  imageClassName?: string; 
}

const MainOnboarding: React.FC<MainOnboardingProps> = ({
  children,
  imageHeight,
  imageWidth,
  imageClassName,
}) => {

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
        <h3 className='text-sm text-primary mr-6'>
          Having trouble? <span className='text-secondary'>Get Help</span>
        </h3>
      </div>

      <div className='flex flex-col lg:flex-row flex-1'>
        <div className='flex flex-col w-full lg:w-1/2 px-4 lg:px-8'>
          <div className='w-full h-full flex justify-center items-center'>
            {children}
          </div>
        </div>

        <div className='hidden lg:flex justify-center lg:justify-end items-end w-full lg:w-1/2 mt-8 lg:mt-0'>
          <img
            src={onboardingImage}
            alt='onboarding illustration'
            className={`
              object-cover rounded-tl-[50px] 
              ${imageClassName || ''}
              ${imageHeight ? `h-[${imageHeight}]` : `h-[300px] lg:h-[600px]`}
              ${imageWidth ? `w-[${imageWidth}]` : `w-auto`}
            `}
          />
        </div>
      </div>
    </div>
  );
};

export default MainOnboarding;
