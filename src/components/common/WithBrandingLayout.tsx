import React from 'react';
import whiteBackground from '../../assets/images/whiteBg.svg';

interface WithBrandingLayoutProps {
  children: React.ReactNode;
  showHelpText?: boolean;
}

const WithBrandingLayout: React.FC<WithBrandingLayoutProps> = ({
  children,
  showHelpText = true,
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
      {showHelpText && (
        <div className='flex w-full h-[48px] justify-end items-center mb-4 lg:mb-8 px-4 lg:px-0'>
          <h3 className='text-sm text-primary mr-6'>
            Having trouble? <span className='text-secondary'>Get Help</span>
          </h3>
        </div>
      )}

      <div className='flex flex-1 w-full'>
        <div className='w-full px-4 lg:px-8'>
          <div className='w-full h-full flex justify-center'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithBrandingLayout; 