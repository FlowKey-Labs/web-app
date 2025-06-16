import { useState, useEffect } from 'react';
import { Button } from '@mantine/core';

import logo from '../assets/landingpageAssets/Icons/logo.svg';
import headerPhone from '../assets/landingpageAssets/Icons/headerPhone.svg';
import incomeArrow from '../assets/landingpageAssets/Icons/incomeArrow.svg';
import upcomingClock from '../assets/landingpageAssets/Icons/upcomingClock.svg';
import scheduling from '../assets/landingpageAssets/Icons/scheduling.svg';
import schedulingAppointment from '../assets/landingpageAssets/Icons/schedulingAppointments.svg';
import eclipse from '../assets/landingpageAssets/Icons/eclipse.svg';
import payments from '../assets/landingpageAssets/Icons/payments.svg';
import payIncomeIcon from '../assets/landingpageAssets/Icons/PayIncomeIcon.svg';
import paymentsIncome from '../assets/landingpageAssets/Icons/paymentsIncome.svg';
import paymentsGraph from '../assets/landingpageAssets/Icons/paymentsGraph.svg';
import payroll from '../assets/landingpageAssets/Icons/payroll.svg';
import payrollBell from '../assets/landingpageAssets/Icons/payrollBell.svg';
import graph from '../assets/landingpageAssets/Icons/graph.svg';
import graph360 from '../assets/landingpageAssets/Icons/360.svg';
import tools from '../assets/landingpageAssets/Icons/tools.svg';
import whiteCurve from '../assets/landingpageAssets/Icons/whiteCurve.svg';
import storyLocal from '../assets/landingpageAssets/Icons/storyLocal.svg';
import storyDesign from '../assets/landingpageAssets/Icons/storyDesign.svg';
import storySupport from '../assets/landingpageAssets/Icons/storySupport.svg';
import email from '../assets/landingpageAssets/Icons/email.svg';
import facebook from '../assets/landingpageAssets/Icons/facebook.svg';
import twitter from '../assets/landingpageAssets/Icons/twitter.svg';
import linkedin from '../assets/landingpageAssets/Icons/linkedin.svg';
import instagram from '../assets/landingpageAssets/Icons/instagram.svg';

import headerImage from '../assets/landingpageAssets/images/Hero Section.png';
import footerImage from '../assets/landingpageAssets/images/Footer.png';

import fullPhone from '../assets/landingpageAssets/Icons/fullPhone.svg';
import payrollMobile from '../assets/landingpageAssets/Icons/payrollMobile.svg';

const FlowkeyLandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

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

  const slides = [
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
  ];

  return (
    <div className='flex flex-col w-full max-w-[100vw] overflow-x-hidden'>
    
    </div>
  );
};

export default FlowkeyLandingPage;
