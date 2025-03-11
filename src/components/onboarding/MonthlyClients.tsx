import MainOnboarding from './MainOnboarding';
import { FlowkeyHeader } from '../helpers/FlowkeyHeader';

import Button from '../helpers/Button';
import { useNavigate } from 'react-router-dom';
import { OnboardingProgress } from '../helpers/OnboardingProgress';
import { useState } from 'react';

interface MonthlyClientOption {
  id: string;
  label: string;
}

const MonthlyClients = () => {
  const navigate = useNavigate();
  const [selectedMonthlyClients, setSelectedMonthlyClients] = useState<
    string | null
  >(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [buttonHovered, setButtonHovered] = useState(false);

  const monthlyClientOptions: MonthlyClientOption[] = [
    { id: '1', label: '<10' },
    { id: '2', label: '10-20' },
    { id: '3', label: '20-30' },
    { id: '4', label: '30-40' },
    { id: '5', label: '>50' },
  ];

  return (
    <MainOnboarding>
      <div className='flex flex-col w-[80%] min-h-[90vh]'>
        <div className='mb-10 self-start'>
          <FlowkeyHeader />
        </div>
        <div className='flex flex-col text-left mb-8'>
          <h3 className='text-2xl lg:text-3xl font-bold mb-2 text-primary'>
            How many clients do you handle in a month?
          </h3>
          <OnboardingProgress currentStep='monthly-clients' />
        </div>
        <div className='flex flex-col flex-grow'>
          <div className='grid grid-cols-5 gap-[5px] max-w-2xl mx-auto w-full mb-4 place-items-stretch'>
            {monthlyClientOptions.map((option) => {
              const isSelected = selectedMonthlyClients === option.id;
              return (
                <div
                  key={option.id}
                  className={`flex items-center justify-center text-primary h-[42px] rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium select-none ${
                    isSelected
                      ? 'border-[1px] border-[#1D9B5E] bg-[#F8FBF9]'
                      : hoveredOption === option.id
                      ? 'border-[1px] border-gray-300 bg-[#F8FBF9]'
                      : 'border-[1px] border-gray-200'
                  }`}
                  onMouseEnter={() => setHoveredOption(option.id)}
                  onMouseLeave={() => setHoveredOption(null)}
                  onClick={() => setSelectedMonthlyClients(option.id)}
                >
                  {option.label}
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
            onClick={() => navigate('/team-members')}
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
            onClick={() => navigate('/purpose')}
            disabled={!selectedMonthlyClients}
          >
            Continue
          </Button>
        </div>
      </div>
    </MainOnboarding>
  );
};

export default MonthlyClients;
