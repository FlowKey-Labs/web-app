import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
} from 'react-hook-form';
import Input from '../common/Input';
import Button from '../common/Button';
import Main from '../authentication/MainAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { EyeClosedIcon, EyeOpenIcon } from '../../assets/icons';
import { useLoginUser } from '../../hooks/reactQuery';
import { notifications } from '@mantine/notifications';

import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const methods = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate: loginUser, isPending } = useLoginUser();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    loginUser(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Login successful',
            color: 'green',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
                <img src={successIcon} alt='Success' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
          });
          setTimeout(() => {
            navigate('/landing-page');
          }, 1500);
        },
        onError: (error: any) => {
          console.error('Login error:', error);
          notifications.show({
            title: 'Error',
            message:
              'Failed to login. Please try again.' +
              error?.response?.data?.detail,
            color: 'red',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                <img src={errorIcon} alt='Error' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
          });
        },
      }
    );
  };

  return (
    <Main
      title='Log In to FlowKey'
      subtitle='Welcome Back!'
      footer={
        import.meta.env.VITE_APP_ENVIRONMENT === 'development' && (
          <p className='w-full text-xs text-gray-600 mt-4'>
            Don't have an account?{' '}
            <a href='/signup' className='underline text-[#1D9B5E]'>
              Sign Up Here
            </a>
          </p>
        )
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
          <Controller
            name='password'
            control={methods.control}
            rules={{
              required: 'Password is required',
            }}
            render={({ field }) => (
              <div className='relative pb-6'>
                <Input
                  {...field}
                  name='password'
                  label='Password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                />
                <button
                  type='button'
                  className='absolute right-3 top-[20px]'
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeClosedIcon className='w-5 h-5 text-gray-500' />
                  ) : (
                    <EyeOpenIcon className='w-5 h-5 text-gray-500' />
                  )}
                </button>
              </div>
            )}
          />

          <p className='text-sm text-gray-600 mt-4'>
            <a
              className='underline text-[#1D9B5E] font-[500]'
              href='/forgot-password'
            >
              Forgot Password?
            </a>
          </p>
          <Button
            w={'100%'}
            type='submit'
            h={'50px'}
            className='w-full mt-6 text-white py-3 rounded-lg'
            style={{
              backgroundColor: isHovered ? '#20aa67' : '#1D9B5E',
              transition: 'background-color 200ms ease-in-out',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isPending}
          >
            {isPending ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
      </FormProvider>
    </Main>
  );
};

export default Login;
