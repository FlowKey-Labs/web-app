import MainOnboarding from './MainOnboarding';
import { FlowkeyOnboardingHeader } from '../common/FlowkeyHeader';
import { useState } from 'react';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { OnboardingProgress } from '../common/OnboardingProgress';

import musicIcon from '../../assets/icons/music.svg';
import spaIcon from '../../assets/icons/spa.svg';
import swimIcon from '../../assets/icons/swim.svg';
import gymIcon from '../../assets/icons/gym.svg';
import therapyIcon from '../../assets/icons/therapy.svg';

interface BusinessOption {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const BusinessType = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);

  const businessOptions: BusinessOption[] = [
    {
      id: 'music',
      icon: musicIcon,
      title: 'Music School',
      description: 'Just the usual music classes I guess',
    },
    {
      id: 'spa',
      icon: spaIcon,
      title: 'Spa',
      description: 'Just the usual spa classes I guess',
    },
    {
      id: 'swim',
      icon: swimIcon,
      title: 'Swim School',
      description: 'Just the usual swim classes I guess',
    },
    {
      id: 'gym',
      icon: gymIcon,
      title: 'Gym',
      description: 'Just the usual gym classes I guess',
    },
    {
      id: 'therapy',
      icon: therapyIcon,
      title: 'Therapy',
      description: 'Just the usual therapy classes I guess',
    },
  ];
  return (
    <MainOnboarding>
      <div className='flex flex-col w-[80%] min-h-[90vh]'>
        <div className='mb-4 self-start'>
          <FlowkeyOnboardingHeader />
        </div>
        <div className='flex flex-col text-left mb-8'>
          <h3 className='text-xl font-bold mb-2 text-primary'>
            What type of business do you have?
          </h3>
          <OnboardingProgress currentStep='business-type' />
        </div>

        <div className='grid grid-cols-2 gap-2.5 mb-auto'>
          {businessOptions.map((business) => {
            const isSelected = selectedBusiness === business.id;
            const IconComponent = business.icon;

            return (
              <div
                key={business.id}
                className={`flex p-4 cursor-pointer rounded-xl transition-all hover:shadow-sm bg-white hover:bg-transparent ${
                  isSelected ? 'border border-[#1D9B5E]' : 'border'
                }`}
                onClick={() => setSelectedBusiness(business.id)}
              >
                <div className='relative w-full'>
                  <div className='flex flex-col items-start gap-1.5'>
                    <div className='flex justify-between w-full flex-shrink-0'>
                      <div className='flex items-center justify-center rounded-full bg-[#F8F7F7] w-10 h-10'>
                        <img
                          src={IconComponent}
                          className={`w-5 h-5 transition-all ${
                            isSelected ? 'text-[#1D9B5E]' : ''
                          }`}
                          style={
                            isSelected
                              ? {
                                  filter:
                                    'invert(48%) sepia(93%) saturate(389%) hue-rotate(93deg) brightness(94%) contrast(88%)',
                                }
                              : undefined
                          }
                          alt=''
                        />
                      </div>
                      {isSelected && (
                        <div className='relative top-1 w-6 h-6 bg-[#1D9B5E] rounded-full flex items-center justify-center'>
                          <svg
                            width='10'
                            height='10'
                            viewBox='0 0 10 10'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M10 3L4.5 8.5L2 6'
                              stroke='white'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className='flex flex-col min-w-0'>
                      <h4 className='text-primary font-semibold text-[14px] mb-0.5 truncate'>
                        {business.title}
                      </h4>
                      <p className='text-primary text-[14px] text-gray-600 line-clamp-2 leading-snug'>
                        {business.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className='flex items-center justify-end space-x-4 mt-4 mb-6'>
          <Button
            w={90}
            h={40}
            radius='md'
            className='text-primary'
            variant='outline'
            color='green'
            onClick={() => navigate('/welcome')}
          >
            Back
          </Button>
          <Button
            w={120}
            h={40}
            radius='md'
            className='text-primary font-bold'
            variant='filled'
            style={{
              backgroundColor: isHovered ? '#20aa67' : '#1D9B5E',
              transition: 'background-color 200ms ease-in-out',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate('/team-members')}
            disabled={!selectedBusiness}
          >
            Continue
          </Button>
        </div>
      </div>
    </MainOnboarding>
  );
};

export default BusinessType;
