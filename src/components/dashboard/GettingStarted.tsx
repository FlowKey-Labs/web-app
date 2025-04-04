import DropDownMenu from '../common/DropdownMenu';
import Header from '../headers/Header';
import { Calendar } from '@mantine/dates';
import { rem } from '@mantine/core';
import {
  navigateToCalendar,
  navigateToStaff,
} from '../../utils/navigationHelpers';
import './index.css';

import dropdownIcon from '../../assets/icons/dropIcon.svg';
import calenderIcon from '../../assets/icons/calendar.svg';
import sessionsIcon from '../../assets/icons/sessions.svg';
import totalClientsIcon from '../../assets/icons/totalClients.svg';
import totalStaffIcon from '../../assets/icons/totalStaff.svg';
import rightIcon from '../../assets/icons/greenRight.svg';
import { useState } from 'react';
import { BarGraph } from '../common/BarGraph';
import rescheduleIcon from '../../assets/icons/reschedule.svg';
import cancelIcon from '../../assets/icons/cancelRed.svg';

import { StaffDashboard, staffDashboard } from '../../utils/dummyData';
import Table from '../common/Table';
import { createColumnHelper } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';

const columnHelper = createColumnHelper<StaffDashboard>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('class', {
    header: 'Classes',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('capacity', {
    header: 'Capacity',
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor('availability', {
    header: 'Availability',
    cell: (info) => (
      <span
        className={`inline-block px-2 py-1 rounded-lg text-sm text-center min-w-[100px] ${
          info.getValue() === 'Available'
            ? 'bg-active text-secondary'
            : 'bg-[#FFCFCC] text-[#FF3B30]'
        }`}
      >
        {info.getValue()}
      </span>
    ),
  }),
];

const GettingStarted = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownCancelOpen, setDropdownCancelOpen] = useState(false);
  const [dropdownRescheduleOpen, setDropdownRescheduleOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 7 days');

  const navigate = useNavigate();

  const handleTimeRangeSelect = (range: string) => {
    setSelectedTimeRange(range);
    setDropdownOpen(false);
  };

  return (
    <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
      <div className='mt-2'>
        <Header />
      </div>
      <div className='flex-1 p-6'>
        <div className='flex justify-between items-center px-4'>
          <div>
            <h3 className='text-[32px] font-[900] text-[#050F0D]'>
              Welcome Doris
            </h3>
            <p className='text-[#194A43] text-md'>
              This is what we have for you today.
            </p>
          </div>
          <div>
            <DropDownMenu
              show={dropdownOpen}
              setShow={setDropdownOpen}
              dropDownPosition='center'
              actionElement={
                <div
                  id='viewSelect'
                  className='p-2 border bg-white text-primary rounded w-40 h-10 outline-none cursor-pointer flex items-center justify-between'
                >
                  <img
                    src={calenderIcon}
                    alt='calender icon'
                    className='w-5 h-5'
                  />
                  <p className='text-sm'>{selectedTimeRange}</p>
                  <img src={dropdownIcon} />
                </div>
              }
            >
              <div className='border-[1px] border-secondary rounded-lg'>
                <ul className='w-[180px] p-6 space-y-2'>
                  {[
                    'To date',
                    'Today',
                    'Last 7 days',
                    'Last 30 days',
                    'Last 3 months',
                    'Last Year',
                  ].map((range) => (
                    <li
                      key={range}
                      className={`cursor-pointer ${
                        selectedTimeRange === range
                          ? 'text-green-500 font-bold'
                          : ''
                      }`}
                      onClick={() => handleTimeRangeSelect(range)}
                    >
                      {range}
                    </li>
                  ))}
                </ul>
              </div>
            </DropDownMenu>
          </div>
        </div>
        <div className='flex gap-6 px-4 mt-6 '>
          <div className='flex w-[250px] h-[91px] bg-[#EEEAF2] rounded-lg px-6 py-2 gap-1 border-[1px] border-[#BAA7CB]'>
            <div className='w-[20%]'>
              <img src={sessionsIcon} alt='' className='' />
            </div>
            <div>
              <h4 className='text-base text-[#53237C]'>Sessions</h4>
              <div className='flex gap-3'>
                <p className='text-[32px] self-start'>32</p>
                <p className='text-sm text-secondary self-end -top-8'>+4.5%</p>
              </div>
            </div>
          </div>
          <div className='flex w-[250px] h-[91px] bg-[#FEF5E2CC] rounded-lg px-6 py-2 gap-1 border-[1px] border-[#FAD684]'>
            <div className='w-[20%]'>
              <img src={totalClientsIcon} alt='' className='' />
            </div>
            <div>
              <h4 className='text-base text-[#E19E09]'>Total Clients</h4>
              <div className='flex gap-3'>
                <p className='text-[32px] self-start'>283</p>
                <p className='text-sm text-[#FF3B30] self-end -top-8'>-2.3%</p>
              </div>
            </div>
          </div>
          <div className='flex w-[250px] h-[91px] bg-[#E0EFFF] rounded-lg px-6 py-2 gap-1 border-[1px] border-[#1717171A]'>
            <div className='w-[20%]'>
              <img src={totalStaffIcon} alt='' className='' />
            </div>
            <div>
              <h4 className='text-base text-[#007AFF]'>Total Staff</h4>
              <div className='flex gap-3'>
                <p className='text-[32px] self-start'>28</p>
                <p className='text-sm text-secondary self-end -top-8'>+1.6%</p>
              </div>
            </div>
          </div>
        </div>
        <div className='flex p-4 mt-8 gap-8 '>
          <div className='flex flex-col w-[30%] space-y-6'>
            <div className='flex justify-center items-center max-w-[350px] bg-white rounded-lg p-4'>
              <Calendar
                highlightToday
                getDayProps={(date) => ({
                  selected: selectedDate
                    ? date.getTime() === selectedDate.getTime()
                    : false,
                  onClick: () => setSelectedDate(date),
                })}
                size='md'
                styles={(theme) => ({
                  cell: {
                    border: `${rem(1)} solid ${theme.colors.gray[2]}`,
                  },
                  day: {
                    borderRadius: '50%',
                    height: rem(40),
                    width: rem(40),
                    fontSize: theme.fontSizes.sm,
                  },
                  weekday: {
                    fontSize: theme.fontSizes.sm,
                    color: theme.colors.gray[6],
                  },
                  month: {
                    fontSize: theme.fontSizes.md,
                    fontWeight: 600,
                  },
                })}
                classNames={{
                  calendarHeader: 'mb-4',
                  day: 'my-day-dashboard-class',
                }}
              />
            </div>
            <div className='bg-white rounded-lg py-4'>
              <h4 className='px-4 mb-4 text-[#08040C] text-[20px] font-[600]'>
                Clients
              </h4>
              <div className='w-full'>
                <BarGraph />
              </div>
            </div>
          </div>
          <div className='flex flex-col w-[70%]'>
            <div className='flex flex-col '>
              <div className='flex justify-between w-full '>
                <h3 className='text-[18px] text-primary font-[600]'>
                  Upcoming sessions
                </h3>
                <div
                  className='flex gap-2 items-center cursor-pointer'
                  onClick={() => navigateToCalendar(navigate)}
                >
                  <p className='text-secondary text-base font-[400]'>
                    View All
                  </p>
                  <img src={rightIcon} alt='' className='w-4 h-4' />
                </div>
              </div>
              <div className='flex-1 mt-4 space-y-4'>
                <div className='flex justify-center items-center bg-white rounded-lg h-[70px]'>
                  <div>
                    <p className='items-center py-4 px-4 text-xs font-[600] w-24'>
                      08:00 am
                    </p>
                  </div>
                  <div className='h-[80%] w-[3px] bg-gray-300'></div>
                  <div className='flex justify-between items-center py-4 px-4 w-full'>
                    <div className='space-y-1'>
                      <p className='text-xs font-[400]'>
                        Advanced swimming-SWM404
                      </p>
                      <p className='text-sm font-[600]'>Neil Bahati</p>
                    </div>
                    <div className='flex gap-1'>
                      <DropDownMenu
                        show={dropdownRescheduleOpen}
                        setShow={setDropdownRescheduleOpen}
                        dropDownPosition='right'
                        actionElement={
                          <div
                            id='viewSelect'
                            className='p-2 text-primary rounded-full w-10 h-10 outline-none cursor-pointer flex items-center justify-between'
                          >
                            <img src={rescheduleIcon} />
                          </div>
                        }
                      >
                        <div className='flex flex-col rounded-lg  border-[1px] border-secondary w-[500px]'>
                          <div className='flex flex-col space-y-10 p-6 justify-center items-center'>
                            <p className='text-gray-500 text-base text-center'>
                              Are you sure you want to reschedule this
                              appointment?
                            </p>
                            <div className='flex gap-12'>
                              <button className='text-red-500 text-base cursor-pointer font-bold'>
                                Reschedule
                              </button>
                              <button className='text-gray-500 text-base cursor-pointer font-bold'>
                                No
                              </button>
                            </div>
                          </div>
                        </div>
                      </DropDownMenu>
                      <DropDownMenu
                        show={dropdownCancelOpen}
                        setShow={setDropdownCancelOpen}
                        dropDownPosition='right'
                        actionElement={
                          <div
                            id='viewSelect'
                            className='p-2 text-primary rounded-full w-10 h-10 outline-none cursor-pointer flex items-center justify-between'
                          >
                            <img src={cancelIcon} />
                          </div>
                        }
                      >
                        <div className='flex flex-col rounded-lg  border-[1px] border-secondary w-[500px]'>
                          <div className='flex flex-col space-y-10 p-6 justify-center items-center'>
                            <p className='text-gray-500 text-base text-center'>
                              Are you sure you want to cancel this appointment?
                            </p>
                            <div className='flex gap-12'>
                              <button className='text-red-500 text-base cursor-pointer font-bold'>
                                Cancel
                              </button>
                              <button className='text-gray-500 text-base cursor-pointer font-bold'>
                                No
                              </button>
                            </div>
                          </div>
                        </div>
                      </DropDownMenu>
                    </div>
                  </div>
                </div>
                <div className='flex justify-center items-center bg-[#8790944D] rounded-lg h-[70px]'>
                  <div>
                    <p className='items-center py-4 px-4 text-xs font-[600] w-24'>
                      10:00 am
                    </p>
                  </div>
                  <div className='h-[80%] w-[3px] bg-white'></div>
                  <div className='flex justify-between items-center py-4 px-4 w-full'>
                    <div className='space-y-1'>
                      <p className='text-xs font-[400]'>
                        Advanced swimming-SWM404
                      </p>
                      <p className='text-sm font-[600]'>Neil Bahati</p>
                    </div>
                    <div className='flex gap-1'>
                      <DropDownMenu
                        show={dropdownOpen}
                        setShow={setDropdownOpen}
                        dropDownPosition='center'
                        actionElement={
                          <div
                            id='viewSelect'
                            className='p-2 text-primary rounded-full w-10 h-10 outline-none cursor-pointer flex items-center justify-between'
                          >
                            <img src={rescheduleIcon} />
                          </div>
                        }
                      ></DropDownMenu>
                      <button className='text-[#FF3B30] text-sm font-[400] bg-white rounded-xl py-2 px-4'>
                        Cancelled
                      </button>
                    </div>
                  </div>
                </div>
                <div className='flex justify-center items-center bg-[#8ECDAF4D] rounded-lg h-[70px]'>
                  <div>
                    <p className='items-center py-4 px-4 text-xs font-[600] w-24'>
                      10:30 am
                    </p>
                  </div>
                  <div className='h-[80%] w-[3px] bg-white'></div>
                  <div className='flex justify-between items-center py-4 px-4 w-full'>
                    <div className='space-y-1'>
                      <p className='text-xs font-[400]'>
                        Advanced swimming-SWM404
                      </p>
                      <p className='text-sm font-[600]'>Neil Bahati</p>
                    </div>
                    <div className='flex gap-1'>
                      <button className='text-secondary text-sm font-[400] bg-white rounded-xl py-2 px-4'>
                        Rescheduled
                      </button>
                      <DropDownMenu
                        show={dropdownCancelOpen}
                        setShow={setDropdownCancelOpen}
                        dropDownPosition='center'
                        actionElement={
                          <div
                            id='viewSelect'
                            className='p-2 text-primary rounded-full w-10 h-10 outline-none cursor-pointer flex items-center justify-between'
                          >
                            <img src={cancelIcon} />
                          </div>
                        }
                      ></DropDownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-col mt-10 bg-white rounded-lg'>
              <div className='flex justify-between w-full px-4 mt-4'>
                <h3 className='text-[18px] text-primary font-[600]'>Staff</h3>
                <div
                  className='flex gap-2 items-center cursor-pointer'
                  onClick={() => navigateToStaff(navigate)}
                >
                  <p className='text-secondary text-base font-[400]'>
                    View All
                  </p>
                  <img src={rightIcon} alt='' className='w-4 h-4' />
                </div>
              </div>
              <div className='flex-1'>
                <Table
                  data={staffDashboard}
                  columns={columns}
                  rowSelection={rowSelection}
                  onRowSelectionChange={setRowSelection}
                  className='mt-4'
                  pageSize={8}
                  headerBg='white'
                  showPagination={false}
                  showHeaderDivider={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;
