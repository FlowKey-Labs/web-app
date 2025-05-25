import Header from '../headers/Header';
import { Button, Checkbox, Progress } from '@mantine/core';
import {
  useGetClients,
  useGetBusinessProfile,
  useGetStaff,
} from '../../hooks/reactQuery';
import { useNavigate } from 'react-router-dom';

import landingWave from '../../assets/icons/landingWave.svg';
import landingActivity from '../../assets/icons/landingActivity.svg';
import landingFeatures from '../../assets/icons/landingFeatures.svg';
import landingConnection from '../../assets/icons/landingConnection.svg';

const LandingPage = () => {
  const { data: businessProfiles = [] } = useGetBusinessProfile();
  const { data: clients = [] } = useGetClients();
  const { data: staff = [] } = useGetStaff();

  const businessProfile = businessProfiles[0] || {
    business_name: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    about: '',
  };

  const isProfileComplete = Boolean(
    businessProfile.business_name?.trim() &&
      businessProfile.contact_person?.trim() &&
      businessProfile.contact_phone?.trim() &&
      businessProfile.contact_email?.trim() &&
      businessProfile.about?.trim()
  );

  const hasClients = clients.length > 0;
  const hasStaff = staff.length > 0;

  const totalSteps = 3;
  const completedSteps = [isProfileComplete, hasStaff, hasClients].filter(
    Boolean
  ).length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  const navigate = useNavigate();

  return (
    <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
      <div className='mt-2'>
        <Header />
      </div>
      <div className='flex-1 mt-6 px-12'>
        <div className='flex justify-between bg-white items-center px-4 py-2 rounded-lg relative border-dashed border border-secondary'>
          <div className='flex items-center justify-between w-[80%]'>
            <div className='flex flex-col gap-1 ml-4 p-4'>
              <h3 className='text-[36px] font-[600]'>Hello RayFish!</h3>
              <p className='text-[24px] font-[500]'>
                Let's get you set up on FlowKey
              </p>
              <p className='text-md font-[400]'>
                Complete your profile to get get started
              </p>
              <div className='flex flex-col gap-2'>
                <p className='text-xs font-light'>
                  Your Profile:
                  <span className='text-xs text-secondary'>
                    {progressPercentage}%
                  </span>
                </p>
                <Progress
                  value={progressPercentage}
                  size='md'
                  color='#1D9B5E'
                />
              </div>
            </div>
            <div className='flex items-center justify-center h-full'>
              <img src={landingConnection} alt='connection' />
            </div>
          </div>
          <div className=''>
            <div className='absolute top-12 right-0' style={{ zIndex: 10 }}>
              <img
                src={landingWave}
                alt='wave'
                className='transform -translate-y-1/2'
              />
            </div>
          </div>
        </div>
        <div className='flex gap-6 mt-16'>
          <div className='flex flex-col gap-1 items-center w-[50%]'>
            <img src={landingActivity} alt='activity' />
            <p className='text-[24px] mt-4 font-[600] text-[#050F0D]'>
              No Activities Yet
            </p>
            <p className='text-base font-[500] text-[#7f7d81] w-[70%] text-center'>
              You’ll be able to view your activities here once you complete your
              profile and add staff and clients.
            </p>
            <Button color='#1D9B5E' radius='md' size='md' mt={40} w={400} onClick={() => navigate('/profile')}>
              Complete Your Profile
            </Button>
          </div>
          <div className='flex flex-col gap-1 items-center w-[50%] justify-around'>
            <div className='flex flex-col gap-1 items-center justify-center rounded-lg w-[70%] bg-white'>
              <h3 className='text-md text-secondary bg-[#D6E9E7] w-full px-4 py-2 rounded-t-lg'>
                Getting Started
              </h3>
              <div className='flex flex-col gap-2 p-6 self-start'>
                <Checkbox
                  label='Complete Profile'
                  radius='xl'
                  color='#1D9B5E'
                  checked={isProfileComplete}
                  readOnly
                />
                <Checkbox
                  label='Set up Staff'
                  radius='xl'
                  color='#1D9B5E'
                  checked={hasStaff}
                  readOnly
                />
                <Checkbox
                  label='Set up Clients'
                  radius='xl'
                  color='#1D9B5E'
                  checked={hasClients}
                  readOnly
                />
              </div>
            </div>
            <div className='flex gap-2 rounded-lg w-[70%] bg-secondary px-4 py-2'>
              <div className='w-[50%] flex items-center justify-center'>
                <img src={landingFeatures} alt='features' />
              </div>
              <div className='flex flex-col gap-4 w-[50%] justify-center'>
                <p className='text-[20px] font-[600] text-white'>
                  More premium features coming soon
                </p>
                <p className='text-base underline font-[500] text-[#D2F801]'>
                  Upgrade Account
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
