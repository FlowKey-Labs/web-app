import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../helpers/Input';
import Button from '../helpers/Button';
import Main from '../authentication/MainAuth';
import { SubmittingIcon } from '../../assets/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const schema = yup
  .object({
    email: yup
      .string()
      .email('Invalid email format')
      .required('Email is required'),
  })
  .required();

interface FormData {
  email: string;
}

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    console.log('Form Data ====>', data);
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
          <Input
            name='email'
            label='Email address'
            type='email'
            placeholder='Enter your email'
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
            className='w-full mt-6 bg-[#1D9B5E] text-white py-3 rounded-lg hover:bg-[#c9f1dd] transition-colors'
            disabled={isSubmitting}
            style={{ backgroundColor: '#1D9B5E', hover: '#168a4e' }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </FormProvider>
    </Main>
  );
};

export default ForgotPassword;
