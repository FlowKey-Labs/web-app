import MainOnboarding from './MainOnboarding';
import { FlowkeyOnboardingHeader } from '../common/FlowkeyHeader';

import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { OnboardingProgress } from '../common/OnboardingProgress';
import { useState } from 'react';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useBusinessProfile } from '../../hooks/reactQuery';

import arrowRightIcon from '../../assets/icons/arrowRight.svg';

import { businessPurpose } from '../../utils/dummyData';

import { navigateToDashboard } from '../../utils/navigationHelpers';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

const Purpose = () => {
  const navigate = useNavigate();
  const { businessType, teamSize, monthlyClients, purpose, setPurpose } =
    useOnboardingStore();
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(
    purpose
  );
  const { mutate: updateBusinessProfile, status } = useBusinessProfile();
  const isLoading = status === 'pending';
  const [buttonHovered, setButtonHovered] = useState(false);

  return (
    <MainOnboarding>
      <div className='flex flex-col w-[80%] min-h-[90vh]'>
        <div className='mb-10 self-start'>
          <FlowkeyOnboardingHeader />
        </div>
        <div className='flex flex-col text-left mb-8'>
          <h3 className='text-2xl lg:text-3xl font-bold mb-2 text-primary'>
            What do you want to use FlowKey for?
          </h3>
          <OnboardingProgress currentStep='purpose' />
        </div>
        <div className='flex flex-col flex-grow'>
          <div className='grid gap-3 mb-auto'>
            {businessPurpose.map((business) => {
              const isSelected =
                selectedBusiness ===
                business.title.toLowerCase().replace(/ /g, '_');
              const IconComponent = business.icon;

              return (
                <div
                  key={business.id}
                  className={`flex p-2 cursor-pointer rounded-xl transition-all bg-white hover:bg-transparent hover:shadow-sm ${
                    isSelected
                      ? 'border border-[#1D9B5E] bg-[#F8FBF9]'
                      : 'hover:bg-[#F8FBF9] border'
                  }`}
                  onClick={() => {
                    setSelectedBusiness(
                      business.title.toLowerCase().replace(/ /g, '_')
                    );
                    setPurpose(business.title.toLowerCase().replace(/ /g, '_'));
                  }}
                >
                  <div className='flex items-center w-full'>
                    <div className='flex items-center justify-center rounded-full bg-[#F8F7F7] w-12 h-12 flex-shrink-0'>
                      <img
                        src={IconComponent}
                        className={`w-6 h-6 transition-all ${
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
                    <div className='flex flex-col flex-grow mx-6'>
                      <h4 className='text-primary mb-2 text-[14px] font-bold'>
                        {business.title}
                      </h4>
                      <p className='text-sm line-clamp-2 leading-relaxed text-primary'>
                        {business.description}
                      </p>
                    </div>
                    <div
                      className={`flex items-center justify-center w-6 h-6 flex-shrink-0 mr-2 bg-[#1D9B5E] rounded-full ${
                        !isSelected && 'invisible'
                      }`}
                    >
                      <img
                        src={arrowRightIcon}
                        className='w-4 h-4 opacity-90'
                        alt=''
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className='flex items-center justify-end space-x-4 mt-auto mb-6 max-w-2xl mx-auto w-full bottom-0'>
          <Button
            w={90}
            h={40}
            radius='md'
            className='text-primary'
            variant='outline'
            color='green'
            onClick={() => navigate('/monthly-clients')}
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
              backgroundColor: buttonHovered ? '#20aa67' : '#1D9B5E',
              transition: 'background-color 200ms ease-in-out',
            }}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
            onClick={() => {
              if (
                businessType &&
                teamSize &&
                monthlyClients &&
                selectedBusiness
              ) {
                updateBusinessProfile(
                  {
                    business_type: businessType,
                    team_size: parseInt(teamSize),
                    monthly_clients: monthlyClients,
                    reason_for_using: selectedBusiness,
                  },
                  {
                    onSuccess: () => {
                      notifications.show({
                        color: 'green',
                        title: 'Success!',
                        message: 'Onboarding completed successfully',
                        icon: (
                          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
                            <img
                              src={successIcon}
                              alt='Success'
                              className='w-4 h-4'
                            />
                          </span>
                        ),
                        withBorder: true,
                        autoClose: 3000,
                        position: 'top-right',
                      });
                      setTimeout(() => {
                        navigateToDashboard(navigate);
                      }, 1500);
                    },
                    onError: () => {
                      notifications.show({
                        color: 'red',
                        title: 'Error',
                        message:
                          'Failed to complete onboarding. Please try again.',
                        icon: (
                          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                            <img
                              src={errorIcon}
                              alt='Error'
                              className='w-4 h-4'
                            />
                          </span>
                        ),
                        withBorder: true,
                        autoClose: 3000,
                        position: 'top-right',
                      });
                    },
                  }
                );
              }
            }}
            disabled={!selectedBusiness || isLoading}
          >
            Continue
          </Button>
        </div>
      </div>
    </MainOnboarding>
  );
};

export default Purpose;
