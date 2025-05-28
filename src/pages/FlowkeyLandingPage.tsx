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

const FlowkeyLandingPage = () => {
  return (
    <div className='flex flex-col h-screen'>
      {/* header section  */}
      <div
        className='flex flex-col w-full justify-center'
        style={{
          backgroundImage: `url(${headerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* navbar  */}
        <div className='w-[90%] md:w-[80%] flex flex-wrap justify-between items-center mx-auto py-4 relative'>
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
          <div className='hidden md:flex items-center gap-[40px] font-[500] text-base text-[#0F2028]'>
            <p className='cursor-pointer hover:text-[#1D9B5E] transition-colors'>
              Home
            </p>
            <p className='cursor-pointer hover:text-[#1D9B5E] transition-colors'>
              Features
            </p>
            <p className='cursor-pointer hover:text-[#1D9B5E] transition-colors'>
              About Us
            </p>
          </div>

          {/* Mobile Navigation */}
          <div
            id='mobile-menu'
            className='hidden md:hidden w-full md:w-auto mt-4 md:mt-0'
          >
            <div className='flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-[40px] font-[500] text-base text-[#0F2028]'>
              <p className='cursor-pointer hover:text-[#1D9B5E] transition-colors w-full py-2 border-b border-gray-100 md:border-0'>
                Home
              </p>
              <p className='cursor-pointer hover:text-[#1D9B5E] transition-colors w-full py-2 border-b border-gray-100 md:border-0'>
                Features
              </p>
              <p className='cursor-pointer hover:text-[#1D9B5E] transition-colors w-full py-2 border-b border-gray-100 md:border-0'>
                About Us
              </p>
              <div className='w-full py-2 md:hidden'>
                <Button
                  color='#1D9B5E'
                  radius='lg'
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
            <Button color='#1D9B5E' radius='lg' h='55px' size='lg'>
              Book Free Demo
            </Button>
          </div>
        </div>
        {/* header details  */}
        <div className='flex flex-wrap flex-col md:flex-row justify-between w-[80%] mx-auto pt-12'>
          <div className='flex flex-col gap-4 md:items-start items-center text-center md:text-left justify-center md:w-[60%]'>
            <h3 className='font-[700] text-[36px] md:text-[60px] text-[#0F2028] font-spaceGrotesk'>
              Run Your Service Business Smoothly.
            </h3>
            <p className='text-[#8A8D8E] text-base font-[400] md:w-[80%] '>
              Flowkey is the all-in-one platform for local businesses to
              streamline operations, from bookings and payments to staff and
              client management - without spreadsheets or stress
            </p>
            <Button color='#1D9B5E' h='50px' radius='md' size='md' mt='30px'>
              Book Free Demo
            </Button>
          </div>
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
                src={headerPhone}
                alt='headerPhone'
                className='hidden md:block'
              />
              <img
                src={fullPhone}
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
        </div>
      </div>
      {/* features section */}
      <div className='flex flex-col bg-white w-full justify-center pt-12'>
        <div className='flex flex-col w-[50%] mx-auto space-y-4 items-center'>
          <h3 className='text-secondary font-[600] text-base'>Key Features</h3>
          <p
            className='text-[#0F2028] text-[40px] font-[700]'
            style={{ fontFamily: 'Space Grotesk' }}
          >
            Everything you need in one place.
          </p>
          <p className='text-[400] text-base text-center text-[#969696]'>
            Juggling appointments, payments and client communication shouldn’t
            eat up your time. Flowkey automates the busywork so you can focus on
            what you do best, serving your clients.
          </p>
        </div>
        {/* features cards */}
        <div className='flex w-[80%] mx-auto justify-around py-12 mt-12'>
          <div className='flex flex-col gap-4 justify-center w-[570px]'>
            <h2
              className='font-[700] text-[40px] text-[#0F2028]'
              style={{ fontFamily: 'Space Grotesk' }}
            >
              Smart Scheduling
            </h2>
            <p className='text-[#8A8D8E] text-[20px] font-[400]'>
              Replace chaotic ordinary time-tables with a color-coded calendar
              that syncs across devices.
            </p>
            <p className='text-[#8A8D8E] text-[20px] font-[400]'>
              Auto-send confirmations and reschedule in one click.
            </p>
          </div>
          <div className='relative'>
            <div className='absolute top-[-20px] left-[-100px] w-[360px] h-[106px] bg-white rounded-lg shadow-sm border-[1px] border-[#F2F2F2] z-30'>
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
            <div className='relative z-20'>
              <img
                src={scheduling}
                alt='scheduling'
                className='relative z-20'
              />
            </div>
            <div className='absolute top-[350px] left-[-100px] w-[290px] h-[60px] bg-white rounded-lg shadow-sm border-[1px] border-[#F2F2F2] items-center z-30'>
              <div className='flex p-2 gap-3 items-center'>
                <img src={schedulingAppointment} alt='schedulingAppointment' />
                <div className='flex flex-col gap-1'>
                  <p className='font-[400] text-xs text-[#8A8D8E]'>
                    You have 3 New Appointments
                  </p>
                </div>
              </div>
            </div>
            <div className='flex justify-end absolute top-[180px] right-[-40px] z-10'>
              <img src={eclipse} alt='eclipse' />
            </div>
          </div>
        </div>

        <div className='flex w-[80%] mx-auto justify-around py-12 mt-12'>
          <div className='relative'>
            <div className='relative z-20'>
              <img src={payments} alt='payments' className='relative z-20' />
            </div>
            <div className='absolute top-[350px] right-[-100px] w-[330px] h-[132px] bg-white rounded-lg shadow-sm border-[1px] border-[#F2F2F2] items-center z-30'>
              <div className='flex flex-col p-2 gap-3 items-center'>
                <div className='relative justify-between w-full'>
                  <div className='flex full'>
                    <img src={payIncomeIcon} alt='payIncomeIcon' />
                    <p className='font-[700] text-base text-[#0F0F0FB2]'>
                      Income
                    </p>
                  </div>
                  <div className='absolute top-5 left-[200px] flex items-center gap-2 w-full'>
                    <img src={paymentsGraph} alt='paymentsGraph' />
                    <p className='text-[#969BA0] text-xs'>4% (30 Days)</p>
                  </div>
                </div>
                <div className='flex flex-col gap-1'>
                  <img src={paymentsIncome} alt='paymentsIncome' />
                </div>
              </div>
            </div>
            <div className='flex justify-end absolute top-[180px] left-[-40px] z-10'>
              <img src={eclipse} alt='eclipse' />
            </div>
          </div>
          <div className='flex flex-col gap-4 justify-center w-[570px]'>
            <h2
              className='font-[700] text-[40px] text-[#0F2028]'
              style={{ fontFamily: 'Space Grotesk' }}
            >
              Payments & Invoicing
            </h2>
            <p className='text-[#8A8D8E] text-[20px] font-[400]'>
              Generate invoices with one click and track payments in real time.
            </p>
            <p className='text-[#8A8D8E] text-[20px] font-[400]'>
              Send automatic reminders for overdue bills—no more lost cash.
            </p>
          </div>
        </div>

        <div className='flex w-[80%] mx-auto justify-around py-12 mt-12'>
          <div className='flex flex-col gap-4 justify-center w-[570px]'>
            <h2
              className='font-[700] text-[40px] text-[#0F2028]'
              style={{ fontFamily: 'Space Grotesk' }}
            >
              Payroll Made Easy
            </h2>
            <p className='text-[#8A8D8E] text-[20px] font-[400]'>
              Calculate wages, deductions and taxes automatically based on shift
              logs.
            </p>
            <p className='text-[#8A8D8E] text-[20px] font-[400]'>
              Print or email pay-slips directly to staff.
            </p>
          </div>
          <div className='relative'>
            <div className='absolute top-[300px] left-[-120px] w-[360px] h-[100px] bg-white rounded-lg shadow-sm border-[1px] border-[#F2F2F2] items-center z-30'>
              <div className='flex p-4 gap-3'>
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
            </div>
            <div className='relative z-20'>
              <img src={payroll} alt='scheduling' className='relative z-20' />
            </div>

            <div className='flex justify-end absolute top-[180px] right-[-40px] z-10'>
              <img src={eclipse} alt='eclipse' />
            </div>
          </div>
        </div>

        <div className='flex w-[80%] mx-auto justify-around py-12 mt-12'>
          <div className='relative'>
            <div className='relative z-20'>
              <img src={graph360} alt='payments' className='relative z-20' />
            </div>
            <div className='absolute top-[280px] right-[-100px] w-[330px] h-[132px] shadow-sm z-30'>
              <img src={graph} alt='graph' />
            </div>
            <div className='flex justify-end absolute top-[180px] left-[-40px] z-10'>
              <img src={eclipse} alt='eclipse' />
            </div>
          </div>
          <div className='flex flex-col gap-4 justify-center w-[570px]'>
            <h2
              className='font-[700] text-[40px] text-[#0F2028]'
              style={{ fontFamily: 'Space Grotesk' }}
            >
              Payments & Invoicing
            </h2>
            <p className='text-[#8A8D8E] text-[20px] font-[400]'>
              Generate invoices with one click and track payments in real time.
            </p>
            <p className='text-[#8A8D8E] text-[20px] font-[400]'>
              Send automatic reminders for overdue bills—no more lost cash.
            </p>
          </div>
        </div>

        <div className='bg-cardsBg mx-auto w-full pt-12 mt-12 items-center justify-center'>
          <div className='flex mx-auto w-[80%] justify-around'>
            <div className='flex flex-col gap-4 w-[50%] justify-center'>
              <h3 className='text-secondary font-[600] text-base'>
                Start Small. Add Tools as You Grow.
              </h3>
              <h2
                className='text-[60px] font-[700]'
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Say Goodbye to Admin Headaches
              </h2>
              <p className='text-[#8A8D8E] text-[20px] font-[400]'>
                Need just scheduling today? Add payroll later. FlowKey’s modular
                design adapts to your business, no bloated features.
              </p>
              <Button
                color='#1D9B5E'
                h='55px'
                w='200px'
                radius='md'
                size='md'
                mt='30px'
              >
                Start Free Trial
              </Button>
            </div>
            <div className='flex flex-col w-[50%] gap-6 items-center justify-end'>
              <div className='flex gap-4 bg-white px-6 py-8 rounded-lg w-[500px] shadow-sm'>
                <img src={tools} alt='' className='self-start' />
                <div className='flex flex-col gap-1'>
                  <h3 className='text-[#323232] font-[700] text-lg'>
                    less time scheduling, more time growing
                  </h3>
                  <p className='font-[400] text-base text-[#969696]'>
                    Free up hours each week with automated bookings and
                    payments.
                  </p>
                </div>
              </div>

              <div className='flex gap-4 bg-white px-6 py-8 rounded-lg w-[500px] shadow-sm'>
                <img src={tools} alt='' className='self-start' />
                <div className='flex flex-col gap-1'>
                  <h3 className='text-[#323232] font-[700] text-lg'>
                    Get paid faster
                  </h3>
                  <p className='font-[400] text-base text-[#969696]'>
                    Eliminate late payments with integrated card processing and
                    auto-billing.
                  </p>
                </div>
              </div>

              <div className='flex gap-4 bg-white px-6 py-8 rounded-lg w-[500px] shadow-sm'>
                <img src={tools} alt='' className='self-start' />
                <div className='flex flex-col gap-1'>
                  <h3 className='text-[#323232] font-[700] text-lg'>
                    Grow with confidence
                  </h3>
                  <p className='font-[400] text-base text-[#969696]'>
                    Track key metrics and make data-driven decisions to scale
                    your business.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <img
            src={whiteCurve}
            alt='whiteCurve'
            className='flex justify-end bottom-0 w-[100%] mt-12 self-end'
          />
        </div>

        <div className='flex flex-col items-center justify-center w-full pt-12 bg-white'>
          <div className='flex flex-col gap-4 items-center text-center'>
            <h2 className='font-[600] text-base text-secondary'>Our Story</h2>
            <h3
              className='font-[700] text-[40px] text-[#0F2028]'
              style={{ fontFamily: 'Space Grotesk' }}
            >
              Built in Kenya, for Kenyan Businesses
            </h3>
            <p className='text-[#969696] text-base font-[400] w-[940px]'>
              FlowKey started in 2024 when our founder, a Nairobi salon owner,
              got tired of losing money to missed appointments and messy
              spreadsheets. After struggling with expensive, complex tools that
              didn’t understand local needs, she teamed up with Kenyan
              developers to build a better solution. Today, FlowKey powers
              hundreds of service businesses across Kenya – from salons to
              tutoring centers – helping them save time and boost profits.
            </p>
          </div>
          <div className='flex gap-8 items-center justify-center py-12'>
            <div className='flex flex-col gap-6 w-[360px] h-[327px] border-[1px] border-[#F2F2F2] p-8 rounded-lg shadow-sm'>
              <img
                src={storyLocal}
                alt='storyLocal'
                className='w-[56px] h-[56px]'
              />
              <h3
                className='font-[700] text-[20px] text-[#323232]'
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Local Expertise
              </h3>
              <p className='font-[400] text-base text-[#969696]'>
                We speak your language – literally. FlowKey is Made in Kenya and
                integrates local payment methods like M-PESA
              </p>
            </div>

            <div className='flex flex-col gap-6 w-[360px] h-[327px] border-[1px] border-[#F2F2F2] p-8 rounded-lg shadow-sm'>
              <img
                src={storyDesign}
                alt='storyLocal'
                className='w-[56px] h-[56px]'
              />
              <h3
                className='font-[700] text-[20px] text-[#323232]'
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Simple by Design
              </h3>
              <p className='font-[400] text-base text-[#969696]'>
                No confusing features. Just the tools you need to run your
                business smoothly.
              </p>
            </div>

            <div className='flex flex-col gap-6 w-[360px] h-[327px] border-[1px] border-[#F2F2F2] p-8 rounded-lg shadow-sm'>
              <img
                src={storySupport}
                alt='storyLocal'
                className='w-[56px] h-[56px]'
              />
              <h3
                className='font-[700] text-[20px] text-[#323232]'
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Real Human Support
              </h3>
              <p className='font-[400] text-base text-[#969696]'>
                We offer 24/7 support to our clients. No bots or endless ticket
                queues.
              </p>
            </div>
          </div>
        </div>

        <div
          className='flex flex-col items-center justify-center w-full pt-12 py-12'
          style={{
            backgroundImage: `url(${footerImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className='flex flex-col text-center justify-center gap-4'>
            <h2 className='font-[700] text-[48px] text-white w-[540px] self-center font-spaceGrotesk'>
              Ready to{' '}
              <span className='font-[300] text-white italic'>Take Control</span>{' '}
              of Your Business?
            </h2>
            <p className='text-base font-[400] text-[#969696] w-[650px] self-center'>
              Simplify your operations. Get started with Flowkey and spend less
              time managing your business—and more time running it.
            </p>
            <div className='flex items-center w-[500px] h-[72px] shadow-sm bg-white rounded-[14px] justify-between p-3 mt-4 self-center'>
              <div className='flex items-center gap-2'>
                <img src={email} alt='email' />
                <input
                  type='email'
                  placeholder='Enter your email address'
                  className='bg-transparent border-none focus:outline-none'
                />
              </div>
              <Button color='#1D9B5E' h='50px' w='170px' radius='lg' size='md'>
                Book Free Demo
              </Button>
            </div>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center w-full pt-12 bg-white py-12'>
          <div className='w-[80%] flex justify-between mx-auto py-4'>
            <div className='flex flex-col gap-8 w-[440px]'>
              <div className='flex items-center gap-2 cursor-pointer'>
                <img src={logo} alt='logo' className='w-[55px] h-[48px]' />
                <p className='text-[36px] font-[900] text-[#0F2028]'>FlowKey</p>
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
              className='flex flex-col gap-4 font-[500] text-base text-[#0F2028]'
              style={{ fontFamily: 'Inter' }}
            >
              <p className='cursor-pointer'>Home</p>
              <p className='cursor-pointer'>Features</p>
              <p className='cursor-pointer'>About Us</p>
            </div>
            <div className='flex items-center justify-end'>
              <div className='flex gap-4 self-end'>
                <img src={facebook} alt='facebook' className='cursor-pointer' />
                <img src={twitter} alt='twitter' className='cursor-pointer' />
                <img src={linkedin} alt='linkedin' className='cursor-pointer' />
                <img
                  src={instagram}
                  alt='instagram'
                  className='cursor-pointer'
                />
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-center w-full p-2 bg-[#0F2028]'>
          <div
            className='w-[80%] flex justify-between mx-auto py-4 text-white text-base font-[400]'
            style={{ fontFamily: 'Inter' }}
          >
            <p>
              &copy; {new Date().getFullYear()} FlowKey. All rights reserved.
            </p>
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowkeyLandingPage;
