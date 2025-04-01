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

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const methods = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log(data);
    
    navigate('/');
  };

  return (
    <Main
      title='Log In to FlowKey'
      subtitle='Welcome Back!'
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
          <Controller
            name='password'
            control={methods.control}
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
                if (!hasUpperCase)
                  errorMessage += 'At least one uppercase letter. ';
                if (!hasLowerCase)
                  errorMessage += 'At least one lowercase letter. ';
                if (!hasNumber) errorMessage += 'At least one number. ';
                if (!hasSpecialChar)
                  errorMessage += 'At least one special character. ';

                return errorMessage === '' || errorMessage.trim();
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                name='password'
                label='Password'
                type='password'
                placeholder='Enter your password'
              />
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
          >
            Log In
          </Button>
        </form>
      </FormProvider>
    </Main>
  );
};

export default Login;
