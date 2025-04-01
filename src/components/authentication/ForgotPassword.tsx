import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
} from 'react-hook-form';
import Input from '../common/Input';
import Button from '../common/Button';
import Main from '../authentication/MainAuth';
import { SubmittingIcon } from '../../assets/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormData {
  email: string;
}

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const methods = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    console.log(data);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    navigate('/password-reset');
  };

  return (
    <Main
      title='Forgot Password?'
      subtitle='Please enter the email address associated with your account'
      footer={
        <p className='w-full text-xs text-gray-600 mt-4'>
          Don't have an account?{' '}
          <a href='/signup' className='underline text-[#1D9B5E]'>
            Sign Up Here
          </a>
        </p>
      }
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Controller
            name='email'
            control={methods.control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                name='email'
                label='Email address'
                type='email'
                placeholder='Enter your email'
              />
            )}
          />
          <p className='text-sm text-gray-600 mt-4'>
            Remembered your password?{' '}
            <a className='underline text-[#1D9B5E] font-[500]' href='/login'>
              Back to login
            </a>
          </p>
          <Button
            leftSection={
              isSubmitting ? <SubmittingIcon className='w-5 h-5' /> : null
            }
            w={'100%'}
            type='submit'
            h={'50px'}
            disabled={isSubmitting}
            className='w-full mt-6 text-white py-3 rounded-lg'
            style={{
              backgroundColor: isHovered ? '#20aa67' : '#1D9B5E',
              transition: 'background-color 200ms ease-in-out',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </FormProvider>
    </Main>
  );
};

export default ForgotPassword;
