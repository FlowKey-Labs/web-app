import { Button } from '@mantine/core';

import logo from '../assets/landingpageAssets/Icons/logo.svg';
import headerPhone from '../assets/landingpageAssets/Icons/headerPhone.svg';
import incomeArrow from '../assets/landingpageAssets/Icons/incomeArrow.svg';
import upcomingClock from '../assets/landingpageAssets/Icons/upcomingClock.svg';

const FlowkeyLandingPage = () => {
  return (
    <div className='flex flex-col h-screen'>
      <div className='flex flex-col bg-[#F9FBFF] w-full justify-center'>
        {/* navbar  */}
        <div className='w-[80%] flex justify-between mx-auto py-4'>
          <div className='flex items-center gap-2'>
            <img src={logo} alt='logo' className='w-[55px] h-[48px]' />
            <p className='text-[36px] font-[900] text-[#0F2028]'>FlowKey</p>
          </div>
          <div className='flex items-center gap-[40px] font-[500] text-base text-[#0F2028]'>
            <p>Home</p>
            <p>Features</p>
            <p>About Us</p>
          </div>
          <div className='flex items-center'>
            <Button color='#1D9B5E' radius='lg' h='55px' size='lg'>
              Book Free Demo
            </Button>
          </div>
        </div>
        {/* header details  */}
        <div className='flex justify-between w-[80%] mx-auto pt-12'>
          <div className='flex flex-col gap-4 items-start justify-center w-[60%]'>
            <h3
              className='font-[700] text-[60px] text-[#0F2028] '
              style={{ fontFamily: 'Space Grotesk' }}
            >
              Run Your Service Business Smoothly.
            </h3>
            <p className='text-[#8A8D8E] text-base font-[400] w-[80%]'>
              Flowkey is the all-in-one platform for local businesses to
              streamline operations, from bookings and payments to staff and
              client management - without spreadsheets or stress
            </p>
            <Button color='#1D9B5E' h='50px' radius='md' size='md' mt='30px'>
              Book Free Demo
            </Button>
          </div>
          <div className='w-[40%] relative'>
            <div className='absolute top-[400px] left-[-100px] w-[360px] h-[106px] bg-white rounded-lg shadow-sm'>
              <div className='flex p-4 gap-3'>
                <img
                  src={upcomingClock}
                  alt='upcomingClock'
                  className='self-start'
                />
                <div className='flex flex-col gap-1'>
                  <p className='font-[700] text-base text-[#323232]'>
                    Upcoming Appointments
                  </p>
                  <p className='text-[#969696] text-xs font-[400]'>
                    You have a Make-up appointment with Shirú Waceke coming up
                    at 14.30Hr
                  </p>
                </div>
              </div>
            </div>
            <div className=''>
              <img src={headerPhone} alt='headerPhone' />
            </div>

            <div className='absolute top-[150px] left-[320px] w-[224px] h-[105px] bg-white rounded-xl shadow-sm'>
              <div className='flex p-4 gap-3'>
                <div className='flex flex-col gap-1'>
                  <p className='font-[400] text-base text-[#0A1519B2]'>
                    Net Income
                  </p>
                  <div className='flex items-center gap-4'>
                    <p className='text-[#0A1519] text-[24px] font-[600]'>
                      KES 123,498k
                    </p>
                    <img src={incomeArrow} alt='incomeArrow' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowkeyLandingPage;
