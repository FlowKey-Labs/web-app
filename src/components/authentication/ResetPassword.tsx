import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
  useWatch,
} from 'react-hook-form';
import Input from '../common/Input';
import Button from '../common/Button';
import Main from '../authentication/MainAuth';
import { useState } from 'react';
import { EyeClosedIcon, EyeOpenIcon, SubmittingIcon } from '../../assets/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResetPassword } from '../../hooks/reactQuery';

interface FormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isResetting, setIsResetting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const methods = useForm<FormData>();
  const { control } = methods;
  const password = useWatch({ control, name: 'password' });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const searchParams = new URLSearchParams(location.search);
  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const first_name = searchParams.get('first_name') || '';
  const last_name = searchParams.get('last_name') || '';
  const mobile_number = searchParams.get('mobile_number') || '';

  const { mutateAsync } = useResetPassword();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsResetting(true);
    try {
      await mutateAsync({
        uid,
        token,
        email,
        first_name,
        last_name,
        mobile_number,
        new_password: data.password,
      });
      setIsResetting(false);
      navigate('/successful-password-reset', { state: { from: location } });
    } catch (error) {
      setIsResetting(false);
      alert('Failed to reset password. Please try again.');
    }
  };

  return (
    <Main title='Reset Password'>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
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
            disabled={isResetting}
            className='w-full mt-6 text-white py-3 rounded-lg'
            style={{
              backgroundColor: isHovered ? '#20aa67' : '#1D9B5E',
              transition: 'background-color 200ms ease-in-out',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isResetting ? 'Resetting...' : 'Submit'}
          </Button>
        </form>
      </FormProvider>
    </Main>
  );
};

export default ResetPassword;
