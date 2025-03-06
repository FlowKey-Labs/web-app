import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../helpers/Input';
import Button from '../helpers/Button';
import Main from '../authentication/MainAuth';
import { useNavigate } from 'react-router-dom';

const schema = yup
  .object({
    email: yup
      .string()
      .email('Invalid email format')
      .required('Email is required'),
    password: yup.string().required('Password is required'),
  })
  .required();

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
  });

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
          <Input
            name='email'
            label='Email address'
            type='email'
            placeholder='Enter your email'
          />
          <Input
            name='password'
            label='Password'
            type='password'
            placeholder='Enter your password'
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
            className='w-full mt-6 bg-[#1D9B5E] text-white py-3 rounded-lg hover:bg-[#168a4e] transition-colors'
            style={{ backgroundColor: '#1D9B5E', hover: '#168a4e' }}
          >
            Log In
          </Button>
        </form>
      </FormProvider>
    </Main>
  );
};

export default Login;
