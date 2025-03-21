import Button from '../common/Button';
import Header from '../headers/Header';

const Profile = () => {
  return (
    <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
      <div className='mt-2'>
        <Header />
      </div>
      <div className='flex-1 p-6'>
        <div className='flex justify-between items-center px-4'>
          <h2 className='text-primary text-[24px] font-[600]'>User Profile</h2>
          <div className='flex gap-6'>
            <Button variant='outline' color='red' radius='md'>
              Cancel
            </Button>
            <Button radius='md' color='#1D9B5E'>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
