import Main from '../authentication/MainAuth';
import { PasswordResetIcon } from '../../assets/icons';

const SuccessfulPassReset = () => {
  return (
    <Main
      footer={
        <p className='w-full text-sm text-[#08040C] mt-4 text-center'>
          <p className='text-sm mt-4'>
            <a className='underline text-[#1D9B5E] font-[500]' href='/login'>
              Back to Sign in
            </a>
          </p>{' '}
        </p>
      }
    >
      <div className='w-full text-center'>
        <PasswordResetIcon className='w-[60px] h-[60px]' />
        <h2 className='text-base'>
          Your password has been reset successfully!
        </h2>
      </div>
    </Main>
  );
};

export default SuccessfulPassReset;
