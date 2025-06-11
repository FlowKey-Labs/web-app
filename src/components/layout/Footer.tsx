import { Button } from '@mantine/core';
import email from '../../assets/landingpageAssets/Icons/email.svg';
import facebook from '../../assets/landingpageAssets/Icons/facebook.svg';
import twitter from '../../assets/landingpageAssets/Icons/twitter.svg';
import linkedin from '../../assets/landingpageAssets/Icons/linkedin.svg';
import instagram from '../../assets/landingpageAssets/Icons/instagram.svg';

import footerImage from '../../assets/landingpageAssets/images/Footer.png';
import logo from '../../assets/landingpageAssets/Icons/logo.svg';

interface FooterProps {
  handleBookingFormOpen: () => void;
}

export const Footer = ({ handleBookingFormOpen }: FooterProps) => {
  return (
    <div>
      <div
        className='flex flex-col items-center justify-center w-full md:pt-12 py-12'
        style={{
          backgroundImage: `url(${footerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='flex flex-col text-center justify-center gap-4'>
          <div>
            <h2 className='font-[700] md:text-[48px] text-[32px] text-white md:w-[680px] w-[327px] self-center font-spaceGrotesk'>
              Get Early Access & Start Your Pilot Journey Today
            </h2>
            <h2 className='font-[300] md:text-[48px] text-[32px] text-white md:w-[680px] w-[327px] self-center font-sans !italic'>
              at no cost
            </h2>
          </div>
          <p className='text-base font-[400] text-[#969696] md:w-[650px] w-[327px] self-center'>
            Simplify your operations. Get started with Flowkey and spend less
            time managing your business—and more time running it.
          </p>
          <div className='flex items-center md:w-[500px] w-[327px] h-[72px] shadow-sm bg-white rounded-[24px] md:rounded-xl justify-between p-3 mt-4 self-center'>
            <div className='flex items-center gap-2'>
              <img src={email} alt='email' />
              <input
                type='email'
                placeholder='Enter your email address'
                className='bg-transparent border-none focus:outline-none'
              />
            </div>
            <div className='hidden md:block'>
              <Button color='#1D9B5E' h='50px' w='170px' radius='lg' size='md'>
                Book Free Demo
              </Button>
            </div>
          </div>
          <div className='md:hidden mt-5 '>
            <Button
              onClick={handleBookingFormOpen}
              color='#1D9B5E'
              h='70px'
              w='170px'
              radius='lg'
              size='md'
            >
              Book Free Demo
            </Button>
          </div>
        </div>
      </div>

      <div className='flex flex-col items-center justify-center w-full pt-12 bg-white md:py-12 py-6'>
        <div className='md:w-[80%] w-[90%] flex md:flex-row flex-col justify-between mx-auto md:py-4 space-y-6 md:space-y-0'>
          <div className='flex flex-col gap-8 md:w-[440px] w-[327px]'>
            <div className='flex items-center gap-2 cursor-pointer'>
              <img
                src={logo}
                alt='logo'
                className='w-[28px] h-[24px] md:w-[55px] md:h-[48px]'
              />
              <p className='text-[24px] md:text-[36px] font-[900] text-[#0F2028]'>
                FlowKey
              </p>
            </div>
            <p className='text-[#0F2028] text-xl font-[300]'>
              Empowering service businesses to run like pros without the
              overhead
            </p>
            <p className='text-[#0F2028] font-[300] text-xl'>
              Streamline.Track.Grow
            </p>
          </div>
          <div
            className='flex flex-col gap-4 font-[500] md:text-base text-xs md:text-[#0F2028] text-[#969696]'
            style={{ fontFamily: 'Inter' }}
          >
            <p className='cursor-pointer'>Home</p>
            <p className='cursor-pointer'>Features</p>
            <p className='cursor-pointer'>About Us</p>
          </div>
          <div className='flex items-center md:justify-end'>
            <div className='flex gap-4 self-end'>
              <img src={facebook} alt='facebook' className='cursor-pointer' />
              <img src={twitter} alt='twitter' className='cursor-pointer' />
              <img src={linkedin} alt='linkedin' className='cursor-pointer' />
              <img src={instagram} alt='instagram' className='cursor-pointer' />
            </div>
          </div>
          <div className='flex flex-col md:hidden gap-6'>
            <p className='font-[700] text-base'>Contact Us</p>
            <p className='text-[#969696] text-sm'>info@flowwkeylabs.com</p>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-center w-full p-2 bg-[#0F2028]'>
        <div
          className='w-[80%] flex justify-between mx-auto py-4 text-white text-base font-[400]'
          style={{ fontFamily: 'Inter' }}
        >
          <p>
            &copy; {new Date().getFullYear()} FlowKeyLabs. All rights reserved.
          </p>
          <p className='cursor-pointer hidden md:block'>Privacy Policy</p>
          <p className='cursor-pointer hidden md:block'>Terms of Service</p>
        </div>
      </div>
    </div>
  );
};
