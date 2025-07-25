import { useState, useEffect, useMemo } from 'react';
import { Button } from '@mantine/core';
import { Footer } from '../components/layout/Footer';
import logo from '../assets/landingpageAssets/Icons/logo.svg';
import incomeArrow from '../assets/landingpageAssets/Icons/incomeArrow.svg';
import upcomingClock from '../assets/landingpageAssets/Icons/upcomingClock.svg';
import schedulingAppointment from '../assets/landingpageAssets/Icons/schedulingAppointments.svg';
import eclipse from '../assets/landingpageAssets/Icons/eclipse.svg';
import payIncomeIcon from '../assets/landingpageAssets/Icons/PayIncomeIcon.svg';
import paymentsIncome from '../assets/landingpageAssets/Icons/paymentsIncome.svg';
import paymentsGraph from '../assets/landingpageAssets/Icons/paymentsGraph.svg';
import payrollBell from '../assets/landingpageAssets/Icons/payrollBell.svg';
import tools from '../assets/landingpageAssets/Icons/tools.svg';
import storyLocal from '../assets/landingpageAssets/Icons/storyLocal.svg';
import storyDesign from '../assets/landingpageAssets/Icons/storyDesign.svg';
import storySupport from '../assets/landingpageAssets/Icons/storySupport.svg';
import arrowRight from '../assets/landingpageAssets/Icons/arrowRight.svg';

import DemoBookingForm, {
  BookingFormData,
} from '../components/freeDemo/demoBookingform';

import payrollMobile from '../assets/landingpageAssets/Icons/payrollMobile.svg';

import { motion } from 'framer-motion';

const FlowkeyLandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [opened, setOpened] = useState(false);

  const handleBookingFormOpen = () => {
    setOpened(true);
  };

  const SlideCard = ({
    img,
    title,
    text,
  }: {
    img: string;
    title: string;
    text: string;
  }) => (
    <div className='flex flex-col items-center md:items-start justify-center gap-6 md:w-[360px] md:h-[327px] w-full h-[303px] border-[1px] border-[#F2F2F2] p-8 rounded-xl shadow-sm'>
      <img src={img} alt={title} className='w-[56px] h-[56px]' />
      <h3 className='font-[700] text-[20px] text-[#323232] font-spaceGrotesk'>
        {title}
      </h3>
      <p className='font-[400] text-base text-[#969696]'>{text}</p>
    </div>
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const slides = useMemo(
    () => [
      {
        img: storyLocal,
        title: 'Local Expertise',
        text: 'We speak your language – literally. FlowKey is Made in Kenya and integrates local payment methods like M-PESA',
      },
      {
        img: storyDesign,
        title: 'Simple by Design',
        text: 'No confusing features. Just the tools you need to run your business smoothly.',
      },
      {
        img: storySupport,
        title: 'Real Human Support',
        text: 'We offer 24/7 support to our clients. No bots or endless ticket queues.',
      },
    ],
    []
  );

  const features = useMemo(
    () => [
      {
        title: 'Appointment Scheduling',
      },
      {
        title: 'Online Booking',
      },
      {
        title: 'WhatsApp Integration',
      },
      {
        title: 'Progress Tracking',
      },
      {
        title: 'Client Management',
      },
      {
        title: 'Multi-Location Management',
      },
    ],
    []
  );

  return (
    <div className='flex flex-col w-full max-w-[100vw] overflow-x-hidden'>
      {/* header section  */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='flex flex-col w-full justify-center'
        style={{
          backgroundImage: `url(${'https://res.cloudinary.com/djxu3bryf/image/upload/v1751721489/Hero_Section_wr4hnm.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* navbar  */}
        <div className='w-[90%] md:w-[80%] flex flex-wrap justify-between items-center mx-auto py-4 relative'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='flex items-center gap-2 cursor-pointer'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.img
              src={logo}
              alt='logo'
              className='w-[28px] h-[24px] md:w-[55px] md:h-[48px]'
            />
            <motion.p
              className='text-[24px] md:text-[36px] font-[900] text-[#0F2028]'
              whileHover={{ color: '#1D9B5E' }}
              transition={{ duration: 0.3 }}
            >
              FlowKey
            </motion.p>
          </motion.div>

          {/* Hamburger button for mobile */}
          <button
            className='md:hidden p-2 text-secondary hover:text-[#1D9B5E] focus:outline-none'
            onClick={() =>
              document.getElementById('mobile-menu')?.classList.toggle('hidden')
            }
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='2'
              stroke='currentColor'
              className='size-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
              />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className='hidden md:flex items-center gap-[40px] font-[500] text-base text-[#0F2028]'
          >
            <motion.p
              className='cursor-pointer'
              whileHover={{ color: '#1D9B5E', scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Home
            </motion.p>
            <motion.p
              className='cursor-pointer'
              whileHover={{ color: '#1D9B5E', scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                const featuresSection = document.getElementById('features');
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Features
            </motion.p>
            <motion.p
              className='cursor-pointer'
              whileHover={{ color: '#1D9B5E', scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                  aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              About Us
            </motion.p>
          </motion.div>

          {/* Mobile Navigation */}
          <div
            id='mobile-menu'
            className='hidden md:hidden w-full md:w-auto mt-4 md:mt-0'
          >
            <div className='flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-[40px] font-[500] text-base text-[#0F2028]'>
              <p className='cursor-pointer hover:text-[#1D9B5E] transition-colors w-full py-2 border-b border-gray-100 md:border-0'>
                Home
              </p>
              <p
                className='cursor-pointer hover:text-[#1D9B5E] transition-colors w-full py-2 border-b border-gray-100 md:border-0'
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Features
              </p>
              <p
                className='cursor-pointer hover:text-[#1D9B5E] transition-colors w-full py-2 border-b border-gray-100 md:border-0'
                onClick={() => {
                  const aboutSection = document.getElementById('about');
                  if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                About Us
              </p>
              <div className='w-full py-2 md:hidden'>
                <Button
                  onClick={handleBookingFormOpen}
                  color='#1D9B5E'
                  radius='12px'
                  h='55px'
                  size='lg'
                  fullWidth
                >
                  Book Free Demo
                </Button>
              </div>
            </div>
          </div>

          <div className='hidden md:flex items-center'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                color='#1D9B5E'
                radius='12px'
                h='55px'
                size='lg'
                onClick={handleBookingFormOpen}
              >
                Book Free Demo
              </Button>
            </motion.div>
          </div>
        </div>
        {/* header details  */}
        <motion.div
          className='flex flex-wrap flex-col md:flex-row justify-between w-[90%] md:w-[80%] mx-auto pt-12 pb-16 md:pb-24'
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <motion.div className='flex flex-col gap-6 md:items-start items-center text-center md:text-left justify-center md:w-[60%]'>
            <motion.h3
              className='font-[700] text-[36px] md:text-[60px] text-[#0F2028] font-spaceGrotesk leading-tight'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Run Your Service Business Smoothly.
            </motion.h3>
            <motion.p
              className='text-[#8A8D8E] text-base font-[400] md:w-[80%] text-lg md:text-xl'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              Are you ready to take your service business to new heights?
              Discover the power of automation to simplify and streamline, your
              operations.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='w-fit mt-4'
            >
              <Button
                color='#1D9B5E'
                radius='12px'
                h='55px'
                size='lg'
                className='w-full'
                onClick={handleBookingFormOpen}
              >
                Get Started
              </Button>
            </motion.div>
          </motion.div>
          <div className='md:w-[40%] w-full relative'>
            <div className='absolute top-[250px] md:top-[400px] left-[-10px] md:left-[-100px] w-[201px] h-[71px] md:w-[360px] md:h-[106px] bg-white rounded-xl shadow-sm border-[1px] border-[#F2F2F2]'>
              <div className='flex md:p-4 p-2 gap-3'>
                <img
                  src={upcomingClock}
                  alt='upcomingClock'
                  className='self-start'
                />
                <div className='flex flex-col gap-1'>
                  <p className='font-[700] text-xs md:text-base text-[#323232]'>
                    Upcoming Appointments
                  </p>
                  <p className='text-[#969696] text-[8px] md:text-xs font-[400]'>
                    You have a Make-up appointment with Shirú Waceke coming up
                    at 14.30Hr
                  </p>
                </div>
              </div>
            </div>
            <div className='flex justify-center'>
              <img
                src={
                  'https://res.cloudinary.com/djxu3bryf/image/upload/v1751720371/headerImage_zthpj6.png'
                }
                alt='headerPhone'
                className='hidden md:block'
              />
              <img
                src={
                  'https://res.cloudinary.com/djxu3bryf/image/upload/v1751721024/fullPhone_c4aj57.jpg'
                }
                alt='fullPhone'
                className='md:hidden self-center mt-4 w-[230px] h-[365px]'
              />
            </div>

            <div className='absolute top-[80px] md:top-[150px] left-[200px] md:left-[320px] w-[154px] h-[67px] md:w-[224px] md:h-[105px] bg-white rounded-xl shadow-sm border-[1px] border-[#F2F2F2]'>
              <div className='flex md:p-4 p-2 gap-3'>
                <div className='flex flex-col gap-1'>
                  <p className='font-[400] text-xs md:text-base text-[#0A1519B2]'>
                    Net Income
                  </p>
                  <div className='flex items-center gap-4'>
                    <p className='text-[#0A1519] text-sm md:text-[24px] font-[600]'>
                      KES 123,498k
                    </p>
                    <img src={incomeArrow} alt='incomeArrow' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      {/* features section */}
      <motion.div
        className='flex flex-col bg-white w-full justify-center pt-12'
        id='features'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className='flex flex-col w-[50%] mx-auto space-y-4 items-center'
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h3
            className='text-secondary font-[400] md:font-[600] text-base'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Key Features
          </motion.h3>
          <motion.p
            className='text-[#0F2028] text-[32px] w-[327px] text-center md:w-full md:text-[40px] font-[700] font-spaceGrotesk'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Everything you need in one place.
          </motion.p>
          <motion.p
            className='font-[400] text-[20px] md:text-base w-[327px] md:w-full text-center text-[#969696]'
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Juggling appointments, payments and client communication shouldn’t
            eat up your time. Flowkey automates the busywork so you can focus on
            what you do best, serving your clients.
          </motion.p>
          <motion.div
            className='w-full flex-wrap justify-center flex'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              staggerChildren: 0.1,
              when: 'beforeChildren',
            }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                className='flex p-2 rounded-md md:min-w-[200px]'
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{
                  y: -5,
                  transition: { type: 'spring', stiffness: 300 },
                }}
              >
                <motion.h3
                  className='bg-[#1D9B5E33] py-2 px-6 rounded-xl w-[300px] md:w-full text-center md:text-start font-[500] font-sans text-sm text-secondary'
                  whileHover={{ scale: 1.05 }}
                >
                  {feature.title}
                </motion.h3>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        {/* features cards */}
        <motion.div className='flex flex-col md:flex-row w-[90%] md:w-[80%] mx-auto justify-around py-4 md:py-12 mt-4 md:mt-12'>
          <motion.div
            className='flex flex-col gap-2 md:gap-4 justify-center md:w-[570px]'
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className='font-[700] text-[32px] md:text-[40px] w-full text-[#0F2028] font-spaceGrotesk'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span className='text-secondary'>Smart Scheduling</span> to serve
              your customers better and grow revenue
            </motion.h2>
            <motion.p
              className='text-[#8A8D8E] text-[20px] font-[400]'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Transform your booking process with a fully customizable online
              booking system.
            </motion.p>
            <motion.p
              className='text-[#8A8D8E] text-[20px] font-[400]'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Whether you run a Beauty, Wellness, or Fitness business, your
              clients can seamlessly schedule appointments or classes at their
              convenience, from anywhere.
            </motion.p>
          </motion.div>
          <motion.div
            className='relative mt-5 md:mt-0'
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className='absolute top-[20px] md:top-[-20px] md:left-[-60px] left-[10px] w-[200px] h-[71px] md:w-[360px] md:h-[106px] bg-white rounded-xl shadow-sm border-[1px] border-[#F2F2F2] z-30'
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <div className='flex p-2 md:p-4 gap-3'>
                <img
                  src={upcomingClock}
                  alt='upcomingClock'
                  className='self-start'
                />
                <div className='flex flex-col gap-1'>
                  <p className='font-[700] text-xs md:text-base text-[#323232]'>
                    Upcoming Appointments
                  </p>
                  <p className='text-[#969696] md:text-xs text-[8px] font-[600] md:font-[400]'>
                    You have a Make-up appointment with Shirú Waceke coming up
                    at 14.30Hr
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              className='relative z-20'
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img
                src={
                  'https://res.cloudinary.com/djxu3bryf/image/upload/v1751722250/scheduling_vz3nhu.png'
                }
                alt='scheduling'
                className='relative z-20'
              />
            </motion.div>
            <motion.div
              className='absolute hidden md:block top-[350px] left-[-100px] w-[290px] h-[60px] bg-white rounded-xl shadow-sm border-[1px] border-[#F2F2F2] items-center z-30'
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ x: -5 }}
            >
              <div className='flex p-2 gap-3 items-center'>
                <img src={schedulingAppointment} alt='schedulingAppointment' />
                <div className='flex flex-col gap-1'>
                  <p className='font-[400] text-xs text-[#8A8D8E]'>
                    You have 3 New Appointments
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              className='flex absolute md:top-[180px] top-[170px] md:right-[-30px] right-[-20px] z-10'
              animate={{
                rotate: 360,
                transition: {
                  repeat: Infinity,
                  duration: 20,
                  ease: 'linear',
                },
              }}
            >
              <img
                src={eclipse}
                alt='eclipse'
                className='w-[50px] h-[50px] md:w-[77px] md:h-[77px]'
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className='flex flex-col-reverse md:flex-row w-[90%] md:w-[80%] mx-auto justify-around py-4 md:py-12 md:mt-12'
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className='relative mt-5 md:mt-0'
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div
              className='relative z-20'
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img
                src={
                  'https://res.cloudinary.com/djxu3bryf/image/upload/v1751722770/appointment_tr7scs.png'
                }
                alt='payments'
                className='relative z-20'
              />
            </motion.div>
            <motion.div
              className='absolute md:top-[350px] md:right-[-100px] top-[270px] right-[10px] md:w-[330px] md:h-[132px] w-[247px] h-[99px] bg-white rounded-xl shadow-sm border-[1px] border-[#F2F2F2] items-center z-30'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <motion.div className='flex flex-col p-2 gap-3 items-center'>
                <div className='relative justify-between w-full'>
                  <div className='flex md:w-full'>
                    <img src={payIncomeIcon} alt='payIncomeIcon' />
                    <p className='font-[700] md:text-base text-sm text-[#0F0F0FB2]'>
                      Income
                    </p>
                  </div>
                  <div className='absolute top-5 md:left-[200px] left-[140px] flex items-center gap-2 w-full'>
                    <img src={paymentsGraph} alt='paymentsGraph' />
                    <p className='text-[#969BA0] md:text-xs text-[10px]'>
                      4% (30 Days)
                    </p>
                  </div>
                </div>
                <div className='flex flex-col  gap-1 w-[149px] md:w-full'>
                  <img src={paymentsIncome} alt='paymentsIncome' />
                </div>
              </motion.div>
            </motion.div>
            <div className='flex absolute md:top-[180px] top-[170px] md:left-[-30px] right-[-20px] z-10'>
              <img
                src={eclipse}
                alt='eclipse'
                className='w-[50px] h-[50px] md:w-[77px] md:h-[77px]'
              />
            </div>
          </motion.div>
          <motion.div
            className='flex flex-col gap-2 md:gap-4 justify-center md:w-[570px]'
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.h2
              className='font-[700] text-[32px] md:text-[40px] w-full text-[#0F2028] font-spaceGrotesk'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span className='text-secondary'>Automated WhatsApp</span>{' '}
              Reminders
            </motion.h2>
            <motion.p
              className='text-[#8A8D8E] text-[20px] font-[400]'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Say goodbye to no-shows! Send timely, personalized WhatsApp
              reminders directly to your clients' phones, drastically reducing
              missed appointments and improving attendance.
            </motion.p>
            <motion.p
              className='text-[#8A8D8E] text-[20px] font-[400]'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Automated WhatsApp reminders are sent to your clients for their
              upcoming appointments. Send promotional and Thank-You texts.{' '}
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          className='flex flex-col md:flex-row w-[90%] md:w-[80%] mx-auto justify-around py-4 md:py-12 md:mt-12'
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className='flex flex-col gap-2 md:gap-4 justify-center md:w-[570px]'
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.h2
              className='font-[700] text-[32px] md:text-[40px] w-full text-[#0F2028] font-spaceGrotesk'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Comprehensive{' '}
              <span className='text-secondary'>Client Progress</span> &
              Engagement Tracking
            </motion.h2>
            <motion.p
              className='text-[#8A8D8E] text-[20px] font-[400]'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Keep detailed records of client journeys, preferences and
              engagement.
            </motion.p>
            <motion.p
              className='text-[#8A8D8E] text-[20px] font-[400]'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Understand what motivates your clients and personalize their
              experience for better retention.
            </motion.p>
          </motion.div>
          <motion.div
            className='relative'
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className='absolute top-[300px] md:left-[-120px] left-[10px] md:w-[360px] md:h-[100px] w-[201px] h-[71px] bg-white rounded-xl shadow-sm border-[1px] border-[#F2F2F2] items-center z-30'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <div className='flex md:p-4 p-2 gap-3'>
                <img
                  src={payrollBell}
                  alt='upcomingClock'
                  className='self-start'
                />
                <div className='flex flex-col gap-1'>
                  <p className='font-[700] text-base text-[#323232]'>Payment</p>
                  <p className='text-[#969696] text-xs font-[400]'>
                    Salary Payment to Coach Frank was successful
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              className='relative z-20'
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img
                src={
                  'https://res.cloudinary.com/djxu3bryf/image/upload/v1751722910/payments_p4hrop.png'
                }
                alt='scheduling'
                className='relative z-20 hidden md:block'
              />
              <img
                src={payrollMobile}
                alt='payrollMobile'
                className='relative z-20 block md:hidden w-[430px] h-[430px]'
              />
            </motion.div>

            <motion.div
              className='flex absolute md:top-[180px] top-[170px] md:right-[-30px] right-[-20px] z-10'
              animate={{
                rotate: 360,
                transition: {
                  repeat: Infinity,
                  duration: 20,
                  ease: 'linear',
                },
              }}
            >
              <img
                src={eclipse}
                alt='eclipse'
                className='w-[50px] h-[50px] md:w-[77px] md:h-[77px]'
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className='flex flex-col-reverse md:flex-row w-[90%] md:w-[80%] mx-auto justify-around py-4 md:py-12 md:mt-12'
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className='relative mt-5 mb:mt-0'
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div
              className='relative z-20 '
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img
                src={
                  'https://res.cloudinary.com/djxu3bryf/image/upload/v1751724272/360_dvwbgb.png'
                }
                alt='payments'
                className='relative z-20'
              />
            </motion.div>
            <motion.div
              className='absolute md:top-[280px] top-[240px] md:right-[-100px] right-[-10px] md:w-[330px] md:h-[132px] w-[247px] h-[99px] shadow-sm z-30'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <img
                src={
                  'https://res.cloudinary.com/djxu3bryf/image/upload/v1751725332/columnGraph_ztxzts.png'
                }
                alt='graph'
              />
            </motion.div>
            <motion.div className='flex absolute md:top-[180px] top-[170px] md:left-[-30px] right-[-20px] z-10'>
              <img
                src={eclipse}
                alt='eclipse'
                className='w-[50px] h-[50px] md:w-[77px] md:h-[77px]'
              />
            </motion.div>
          </motion.div>
          <motion.div
            className='flex flex-col gap-2 md:gap-4 justify-center md:w-[570px]'
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.h2
              className='font-[700] text-[32px] md:text-[40px] w-full text-[#0F2028] font-spaceGrotesk'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Get a 360°{' '}
              <span className='text-secondary'>business insights</span> without
              extra tools
            </motion.h2>
            <motion.p
              className='text-[#8A8D8E] text-[20px] font-[400]'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Gain valuable data on what’s working in your business.
            </motion.p>
            <motion.p
              className='text-[#8A8D8E] text-[20px] font-[400]'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Track popular services, peak booking times, and client activity to
              make informed decisions without needing complex analytics
              software.
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          className='bg-cardsBg mx-auto w-full pt-12 mt-12  items-center justify-center'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className='flex flex-col md:flex-row mx-auto md:w-[80%] w-[90%] justify-around'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              staggerChildren: 0.2,
              when: 'beforeChildren',
            }}
          >
            <motion.div
              className='flex flex-col gap-4 md:w-[50%] w-full justify-center'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <motion.h3
                className='text-secondary font-[600] text-base '
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                COMING SOON
              </motion.h3>
              <motion.h2
                className='md:text-[60px] text-[40px] font-[700] font-spaceGrotesk'
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Even More Power to Your Business!
              </motion.h2>
              <motion.p
                className='text-[#8A8D8E] text-[20px] font-[400] w-[100%] md:w-full'
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                We're continuously evolving FlowKey to be the ultimate solution
                for your service business:
              </motion.p>
              <motion.div
                className='hidden md:block'
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
              >
                <Button
                  variant='transparent'
                  rightSection={<img src={arrowRight} alt='arrow' />}
                  color='#1D9B5E'
                  h='55px'
                  radius='14px'
                  size='md'
                  mt='30px'
                  fw='bolder'
                  onClick={handleBookingFormOpen}
                >
                  Start Free Trial
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              className='flex flex-col md:w-[50%] w-full md:gap-6 gap-2 mt-5 md:mt-0 items-center justify-end'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                staggerChildren: 0.2,
                when: 'beforeChildren',
              }}
            >
              <motion.div
                className='flex gap-4 bg-white px-6 py-8 rounded-lg md:w-[500px] w-full shadow-sm'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <motion.img
                  src={tools}
                  alt=''
                  className='self-start'
                  whileHover={{ rotate: 15 }}
                />
                <div className='flex flex-col gap-1'>
                  <h3 className='text-[#323232] font-[700] font-spaceGrotesk md:text-lg text-sm'>
                    Easy M-Pesa & Card Payments Integration
                  </h3>
                  <p className='font-[400] md:text-base text-xs text-[#969696]'>
                    Simplify your financial transactions with seamless payment
                    processing directly within FlowKey, offering convenience to
                    both you and your clients.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className='flex gap-4 bg-white px-6 py-8 rounded-lg md:w-[500px] w-full shadow-sm'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <motion.img
                  src={tools}
                  alt=''
                  className='self-start'
                  whileHover={{ rotate: 15 }}
                />
                <div className='flex flex-col gap-1'>
                  <h3 className='text-[#323232] font-[700] font-spaceGrotesk md:text-lg text-sm'>
                    Simple Payroll & Team Management
                  </h3>
                  <p className='font-[400] md:text-base text-xs text-[#969696]'>
                    Calculate wages, deductions and taxes automatically based on
                    shift logs. Print or email pay-slips directly to staff.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className='self-start md:hidden'
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
              >
                <Button
                  h='55px'
                  w='200px'
                  radius='md'
                  size='md'
                  mt='30px'
                  variant='transparent'
                  rightSection={<img src={arrowRight} alt='arrow' />}
                  color='#1D9B5E'
                  fw='bolder'
                  onClick={handleBookingFormOpen}
                >
                  Start Free Trial
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.img
            src={
              'https://res.cloudinary.com/djxu3bryf/image/upload/v1751725503/white-curve-1_csslur.png'
            }
            alt='whiteCurve'
            className='flex justify-end w-[100%] md:h-[140px] mt-12 self-end object-cover'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>

        <motion.div
          className='flex flex-col items-center justify-center md:w-full md:pt-12 pt-6 bg-white w-[90%] mx-auto'
          id='about'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            className='flex flex-col gap-4 items-center text-center'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.h2
              className='md:font-[600] font-[400] text-base text-secondary'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Our Story
            </motion.h2>
            <motion.h3
              className='font-[700] w-[327px] md:w-full text-[40px] text-[#0F2028] font-spaceGrotesk'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Built in Kenya, for Kenyan Businesses
            </motion.h3>
            <motion.p
              className='text-[#969696] text-base font-[400] w-[327px] md:w-[940px]'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              FlowKey started in 2024 when our founder, a Nairobi salon owner,
              got tired of losing money to missed appointments and messy
              spreadsheets. After struggling with expensive, complex tools that
              didn’t understand local needs, she teamed up with Kenyan
              developers to build a better solution. Today, FlowKey powers
              hundreds of service businesses across Kenya – from salons to
              tutoring centers – helping them save time and boost profits.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button
                variant='transparent'
                rightSection={<img src={arrowRight} alt='arrow' />}
                color='#1D9B5E'
                h='55px'
                radius='14px'
                size='md'
                mt='30px'
                fw='bolder'
                onClick={handleBookingFormOpen}
              >
                Start Free Trial
              </Button>
            </motion.div>
          </motion.div>

          {/* Slider Container */}
          <motion.div
            className='relative w-full md:py-12 py-6'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className='hidden md:flex gap-8 items-center justify-center'>
              {slides.map((slide, index) => (
                <SlideCard key={index} {...slide} />
              ))}
            </div>

            {/* Mobile Slider */}
            {isMobile && (
              <motion.div
                className='md:hidden w-full overflow-hidden relative'
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div
                  className='flex transition-transform duration-300 ease-out'
                  style={{
                    transform: `translateX(-${currentSlide * 100}%)`,
                    width: '100%',
                    display: 'flex',
                  }}
                >
                  {slides.map((slide, index) => (
                    <div key={index} className='flex-shrink-0 w-full px-4'>
                      <SlideCard {...slide} />
                    </div>
                  ))}
                </div>

                <div className='flex justify-center mt-6 gap-2'>
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentSlide === index ? 'bg-secondary' : 'bg-[#D9D9D9]'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        <Footer />
      </motion.div>

      <DemoBookingForm
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={(data: BookingFormData) => {
          console.log(data);
          setOpened(false);
        }}
      />
    </div>
  );
};

export default FlowkeyLandingPage;
