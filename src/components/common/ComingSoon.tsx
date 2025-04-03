import { useState } from 'react';
import Button from '../common/Button';
import MainOnboarding from '../onboarding/MainOnboarding';
import { useNavigate } from 'react-router-dom';
import { FlowkeyOnboardingHeader } from '../common/FlowkeyHeader';
import constructionIcon from '../../assets/icons/constructon.svg';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import Input from './Input';

type FormValues = {
  email: string;
};

const ComingSoon = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const methods = useForm<FormValues>({
    defaultValues: {
      email: '',
    },
  });

  return (
    <MainOnboarding imageHeight='400px' imageWidth='280px'>
      <div className='flex flex-col w-full lg:w-[60%] min-h-[80vh] px-4 lg:px-0 space-y-12'>
        <div className='mb-8'>
          <FlowkeyOnboardingHeader />
        </div>

        <div className='flex flex-col text-left'>
          <div className='flex items-center gap-2'>
            <p className='font-[700] text-primary text-[40px]'>Under</p>
            <img
              src={constructionIcon}
              alt='construction'
              className='h-[35px] w-[35px] '
            />
          </div>
          <span className='font-[700] text-primary text-[40px]'>
            Construction!
          </span>
          <p className='text-gray-400 text-base'>
            We are currently working on this feature. Want to get notified when
            we launch it? Leave us your email below and we’ll let you know.
          </p>
        </div>

        <div className='flex flex-col mt-8 w-full gap-2'>
          <FormProvider {...methods}>
            <Controller
              name='email'
              control={methods.control}
              render={({ field }) => (
                <Input
                  {...field}
                  label='Email address'
                  placeholder='Enter email'
                  className='w-full'
                />
              )}
            />
            <Button
              size='xl'
              w='100%'
              radius='md'
              type='submit'
              className='text-primary mt-2 self-center lg:self-start'
              style={{
                fontFamily: 'Urbanist',
                backgroundColor: isHovered ? '#20aa67' : '#1D9B5E',
                transition: 'background-color 200ms ease-in-out',
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => navigate('/onboarding')}
            >
              Submit
            </Button>
          </FormProvider>
        </div>
      </div>
    </MainOnboarding>
  );
};

export default ComingSoon;
