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

const FlowkeyLandingPage = () => {
  return (
    <div className='flex flex-col h-screen'>
      {/* header section  */}
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
            <div className='absolute top-[400px] left-[-100px] w-[360px] h-[106px] bg-white rounded-lg shadow-sm border-[1px] border-[#F2F2F2]'>
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

            <div className='absolute top-[150px] left-[320px] w-[224px] h-[105px] bg-white rounded-xl shadow-sm border-[1px] border-[#F2F2F2]'>
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
      {/* features section */}
      <div className='flex flex-col bg-white w-full justify-center py-12'>
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
      </div>
    </div>
  );
};

export default FlowkeyLandingPage;
