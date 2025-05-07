import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
  useWatch,
} from 'react-hook-form';
import Input from '../common/Input';
import Button from '../common/Button';
import Main from './MainAuth';
import { useState } from 'react';
import { EyeClosedIcon, EyeOpenIcon, SubmittingIcon } from '../../assets/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSetStaffPassword } from '../../hooks/reactQuery';
import { notifications } from '@mantine/notifications';

interface FormData {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

const SetPassword = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const methods = useForm<FormData>();
  const { control } = methods;
  const password = useWatch({ control, name: 'password' });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const { mutate: setStaffPassword, isPending } = useSetStaffPassword();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const uid = searchParams.get('uid');
  const email = searchParams.get('email');

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setStaffPassword(
      {
        uid: uid || '',
        token: token || '',
        email: email || '',
        first_name: data.firstName || '',
        last_name: data.lastName || '',
        password: data.password,
        new_password: data.confirmPassword,
      },
      {
        onSuccess: () => {
          notifications.show({
            color: 'green',
            title: 'Success!',
            message: 'Password set successfully. Please log in to continue',
          });
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        },
        onError: (error: any) => {
          console.error('Login error:', error);
          notifications.show({
            color: 'red',
            title: 'Error',
            message:
              error?.response?.data?.detail ||
              'Invalid credentials, please try again.',
          });
        },
      }
    );
  };

  return (
    <Main title='Set Your Password'>
      <p className='text-sm'>Please set up your password to proceed</p>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Controller
            name='firstName'
            control={control}
            render={({ field }) => (
              <Input {...field} label='First Name' className='w-full' placeholder='Enter first name' />
            )}
          />
          <Controller
            name='lastName'
            control={control}
            render={({ field }) => (
              <Input {...field} label='Last Name' className='w-full' placeholder='Enter last name' />
            )}
          />
          <Controller
            name='password'
            control={control}
            rules={{
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
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

          <Button
            leftSection={<SubmittingIcon className='w-5 h-5' />}
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
          >
            {isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </FormProvider>
    </Main>
  );
};

export default SetPassword;
