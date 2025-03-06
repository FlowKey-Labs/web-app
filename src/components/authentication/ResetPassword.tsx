import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../helpers/Input';
import Button from '../helpers/Button';
import Main from '../authentication/MainAuth';
import { useState } from 'react';
import { SubmittingIcon } from '../../assets/icons';
import { useNavigate } from 'react-router-dom';

const schema = yup
  .object({
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  })
  .required();

interface FormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsResetting(true);
    console.log('Form Data ====>', data);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsResetting(false);
    navigate('/successful-password-reset');
  };

  return (
    <Main title='Reset Password'>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Input
            name='password'
            label='New Password'
            type='password'
            placeholder='Enter your password'
          />
          <Input
            name='confirmPassword'
            label='Confirm Password'
            type='password'
            placeholder='Confirm your password'
          />
          <p className='text-sm text-gray-600 mt-4'>
            Remembered your password?{' '}
            <a className='underline text-[#1D9B5E] font-[500]' href='/login'>
              Back to login
            </a>
          </p>
          <Button
            leftSection={
              isResetting ? <SubmittingIcon className='w-5 h-5' /> : null
            }
            w={'100%'}
            type='submit'
            h={'50px'}
            className='w-full mt-6 bg-[#1D9B5E] text-white py-3 rounded-lg hover:bg-[#168a4e] transition-colors'
            style={{ backgroundColor: '#1D9B5E', hover: '#168a4e' }}
            disabled={isResetting}
          >
            {isResetting ? 'Resetting...' : 'Submit'}
          </Button>
        </form>
      </FormProvider>
    </Main>
  );
};

export default ResetPassword;
