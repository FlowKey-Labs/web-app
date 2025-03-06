import Main from '../authentication/MainAuth';
import { PasswordResetIcon } from '../../assets/icons';

const PasswordResetLink = () => {
  return (
    <Main
      footer={
        <p className='w-full text-sm text-[#08040C] mt-4 text-center'>
          A password reset link has been sent to your email,{' '}
          <span className='underline text-[#1D9B5E]'>info@rayfish.com</span>,
          please open it to create a new password
        </p>
      }
    >
      <div className='w-full text-center'>
        <PasswordResetIcon className='w-[60px] h-[60px]' />
        <h2 className='text-2xl'>Password Reset Link Sent</h2>
      </div>
    </Main>
  );
};

export default PasswordResetLink;
