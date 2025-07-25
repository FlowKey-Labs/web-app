import { useState } from 'react';
import { GreenArrowIcon } from '../../assets/icons';
import waveIcon from '../../assets/icons/wave.svg';
import Button from '../common/Button';
import MainOnboarding from './MainOnboarding';
import { useNavigate } from 'react-router-dom';
import { FlowkeyOnboardingHeader } from '../common/FlowkeyHeader';
import { useGetUserProfile } from '../../hooks/reactQuery';

const WelcomePage = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { data: userProfile } = useGetUserProfile();

  return (
    <MainOnboarding>
      <div className='flex flex-col w-full lg:w-[80%] min-h-[80vh] px-4 lg:px-0 space-y-12'>
        <div className='mb-8'>
          <FlowkeyOnboardingHeader />
        </div>

        <div className='flex flex-col space-y-1 text-left'>
          <div className='flex gap-2'>
            <p className='text-primary text-[40px]'>
              Hello <span className='text-secondary font-bold'>{userProfile?.first_name}</span>
            </p>
            <div className='flex items-center justify-center'>
              <img src={waveIcon} alt='Wave' className='w-8 h-8 mt-1' />{' '}
              <span className='self-end'>,</span>
            </div>
          </div>
          <p>
            <span className='font-bold text-primary text-[40px]'>
              Welcome to FlowKey...
            </span>
          </p>
          <p className='text-primary text-[24px]'>Let's get you started</p>
        </div>

        <div className='flex flex-col w-[80%]'>
          <GreenArrowIcon className='w-[90px] h-[72px] self-end' />
          <Button
            w='80%'
            h='50px'
            className='text-primary mt-2 self-center lg:self-start'
            style={{
              fontFamily: 'Urbanist',
              backgroundColor: isHovered ? '#20aa67' : '#1D9B5E',
              transition: 'background-color 200ms ease-in-out',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate('/business-type')}
          >
            Set up your Account
          </Button>
        </div>
      </div>
    </MainOnboarding>
  );
};

export default WelcomePage;
