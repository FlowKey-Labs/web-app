import Button from '../common/Button';
import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
} from 'react-hook-form';
import Input from '../common/Input';
import Main from '../authentication/MainAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatch } from 'react-hook-form';
import { useRegisterUser } from '../../hooks/reactQuery';
import { notifications } from '@mantine/notifications';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';

import { EyeClosedIcon, EyeOpenIcon } from '../../assets/icons';

interface FormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  const methods = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      mobileNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { control } = methods;
  const password = useWatch({ control, name: 'password' });
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const { mutate: registerUser, isPending } = useRegisterUser();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    registerUser(
      {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        mobile_number: data.mobileNumber,
        password: data.password,
        confirm_password: data.confirmPassword,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Registration successful! Redirecting...',
            color: 'green',
            radius: 'md',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
                <img src={successIcon} alt='Success' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: 'top-right',
          });
          setTimeout(() => {
            navigate('/welcome');
          }, 1500);
        },
        onError: (error: any) => {
          console.error('Registration error:', error);
          const errorMessage = error?.response?.data?.detail || 
            error?.response?.data?.email?.[0] || 
            error?.response?.data?.mobile_number?.[0] ||
            'Registration failed. Please try again.';
          notifications.show({
            title: 'Error',
            message: errorMessage,
            color: 'red',
            radius: 'md',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                <img src={errorIcon} alt='Error' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: 'top-right',
          });
        },
      }
    );
  };

  return (
    <Main
      title='Sign Up'
      subtitle="Let's get you started"
      footer={
        <p className='w-full text-xs text-gray-600 mt-2'>
          By signing up, you agree to FlowKey's{' '}
          <a href='/terms' className='underline text-[#1D9B5E]'>
            Terms & Conditions
          </a>
          .
        </p>
      }
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Controller
            name='firstName'
            control={control}
            rules={{ required: 'First name is required' }}
            render={({ field }) => (
              <Input
                {...field}
                label='First Name'
                type='text'
                placeholder='Enter your first name'
              />
            )}
          />

          <Controller
            name='lastName'
            control={control}
            rules={{ required: 'Last name is required' }}
            render={({ field }) => (
              <Input
                {...field}
                label='Last Name'
                type='text'
                placeholder='Enter your last name'
              />
            )}
          />

          <Controller
            name='mobileNumber'
            control={control}
            rules={{
              required: 'Mobile number is required',
              pattern: {
                value:
                  /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
                message: 'Invalid mobile number',
              },
              minLength: {
                value: 10,
                message: 'Mobile number must be at least 10 digits',
              },
              maxLength: {
                value: 15,
                message: 'Mobile number must not exceed 15 digits',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                label='Mobile Number'
                type='text'
                placeholder='Enter your mobile number'
              />
            )}
          />

          <Controller
            name='email'
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message:
                  'Please enter a valid email address (e.g., name@example.com)',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                label='Email'
                type='email'
                placeholder='Enter your email'
              />
            )}
          />

          <Controller
            name='password'
            control={control}
            rules={{
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              validate: (value) => {
                const hasUpperCase = /[A-Z]/.test(value);
                const hasLowerCase = /[a-z]/.test(value);
                const hasNumber = /[0-9]/.test(value);
                const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

                let errorMessage = '';
                if (!hasUpperCase) errorMessage += '1 uppercase letter. ';
                if (!hasLowerCase) errorMessage += '1 lowercase letter. ';
                if (!hasNumber) errorMessage += '1 number. ';
                if (!hasSpecialChar) errorMessage += '1 special character. ';

                return (
                  errorMessage === '' || `Must contain: ${errorMessage.trim()}`
                );
              },
            }}
            render={({ field }) => (
              <div className='relative pb-6'>
                <Input
                  {...field}
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

          <Controller
            name='confirmPassword'
            control={control}
            rules={{
              required: 'Please confirm your password',
              validate: (value) =>
                value === password || 'Passwords do not match',
            }}
            render={({ field }) => (
              <div className='relative pb-6'>
                <Input
                  {...field}
                  label='Confirm Password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Confirm your password'
                />
                <button
                  type='button'
                  className='absolute right-3 top-[20px]'
                  onClick={toggleConfirmPasswordVisibility}
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeClosedIcon className='w-5 h-5 text-gray-500' />
                  ) : (
                    <EyeOpenIcon className='w-5 h-5 text-gray-500' />
                  )}
                </button>
              </div>
            )}
          />

          <p className='text-sm text-gray-600 mt-4'>
            Already have an account?{' '}
            <a className='underline text-[#1D9B5E] font-[500]' href='/login'>
              Log In
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
            {isPending ? 'Registering...' : 'Sign Up'}
          </Button>
        </form>
      </FormProvider>

    </Main>
  );
};

export default Signup;
