import Main from '../authentication/MainAuth';
import { PasswordResetIcon } from '../../assets/icons';

const SuccessfulPassReset = () => {
  return (
    <Main
      footer={
        <p className='w-full text-sm text-[#08040C] mt-4 text-center'>
          Your password has been reset successfully!
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

export default SuccessfulPassReset;
