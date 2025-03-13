import Button from '../helpers/Button';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../helpers/Input';
import Main from '../authentication/MainAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const schema = yup
  .object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    mobileNumber: yup
      .number()
      .typeError('Mobile number must be a number')
      .required('Mobile number is required'),
    email: yup
      .string()
      .email('Invalid email format')
      .required('Email is required'),
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
  firstName: string;
  lastName: string;
  mobileNumber: number;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormData> = (data) => {
    navigate('/welcome');
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <Main
      title='Sign Up'
      subtitle="Let's get you started"
      footer={
        <p className='w-full text-xs text-gray-600 mt-4'>
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
          <Input
            name='firstName'
            label='First Name'
            type='text'
            placeholder='Enter your first name'
          />
          <Input
            name='lastName'
            label='Last Name'
            type='text'
            placeholder='Enter your last name'
          />
          <Input
            name='mobileNumber'
            label='Mobile Number'
            type='text'
            placeholder='Enter your mobile number'
          />
          <Input
            name='email'
            label='Email'
            type='email'
            placeholder='Enter your email'
          />
          <Input
            name='password'
            label='Password'
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
          >
            Sign Up
          </Button>
        </form>
      </FormProvider>
    </Main>
  );
};

export default Signup;
