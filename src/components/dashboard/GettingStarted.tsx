import Header from '../headers/Header';
import ErrorBoundary from '../common/ErrorBoundary';

import {
  navigateToCalendar,
  navigateToClientDetails,
  navigateToClients,
} from '../../utils/navigationHelpers';
import './index.css';
import {
  useGetUserProfile,
  useGetAnalytics,
  useGetUpcomingSessions,
  useGetClients,
} from '../../hooks/reactQuery';
import { useGetWeeklyClients } from '../../hooks/react_query_hooks/analyticsHooks';
import { DateFilterOption } from '../../types/dashboard';

import sessionsIcon from '../../assets/icons/sessions.svg';
import totalClientsIcon from '../../assets/icons/totalClients.svg';
import totalStaffIcon from '../../assets/icons/totalStaff.svg';
import rightIcon from '../../assets/icons/greenRight.svg';
import { useState } from 'react';
import { BarGraph } from '../common/BarGraph';

import Table from '../common/Table';
import { createColumnHelper } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { DonutChart } from '../common/DonutChart';
import { format } from 'date-fns';
import { formatToEATTime } from '../../utils/formatTo12Hour';
import { Progress, Skeleton, Card, Text, Group, Badge } from '@mantine/core';
import { Select } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';

import { SessionsPerStaff } from './SessionsPerStaff';
import { UpcomingBirthdays } from './UpcomingBirthdays';
import { CategoryDistribution } from './CategoryDistribution';
import { CancellationsReschedules } from './CancellationsReschedules';
import { Client } from '../../types/clientTypes';

const columnHelper = createColumnHelper<Client>();

const columns = [
  columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
    id: 'name',
    header: 'Name',
    cell: (info) => (
      <div className='flex flex-col'>
        <span className='text-sm text-primary'>{info.getValue()}</span>
        <span className='text-xs text-[#8A8D8E]'>{info.row.original.id}</span>
      </div>
    ),
  }),
  columnHelper.accessor('phone_number', {
    header: 'Phone',
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('active', {
    header: 'Status',
    cell: (info) => (
      <span
        className={`inline-block px-2 py-1 rounded-lg text-sm text-center min-w-[70px] ${
          info.getValue()
            ? 'bg-active text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {info.getValue() ? 'Active' : 'Inactive'}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'progress',
    header: 'Progress',
    cell: () => <Progress color='#A6EECB' size='sm' radius='xl' value={50} />,
  }),
];

const GettingStarted = () => {
  const [rowSelection, setRowSelection] = useState({});
  const [selectedTimeRange, setSelectedTimeRange] = useState('to_date');

  const navigate = useNavigate();
  const { data: userProfile, isLoading: isLoadingProfile } =
    useGetUserProfile();
  const { data: analytics, isLoading: isLoadingAnalytics } = useGetAnalytics(
    selectedTimeRange as DateFilterOption
  );
  const { data: weeklyClientsData, isLoading: isLoadingWeeklyClients } = useGetWeeklyClients();
  const { data: upcomingSessions, isLoading: isLoadingSessions } =
    useGetUpcomingSessions();
  const {
    data: clients = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 6,
      totalPages: 1,
    },
    isLoading: isLoadingClients,
  } = useGetClients(1, 6);

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const limitedUpcomingSessions = upcomingSessions?.slice(0, 3) || [];

  return (
    <ErrorBoundary>
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto'>
        <div className='bg-white border-b border-gray-100 shadow-sm'>
          <Header showSearch={false} />
        </div>

        <div className='flex-1'>
          <div className='bg-gradient-to-r from-white via-gray-50/50 to-white border-b border-gray-100'>
            <div className='px-6 sm:px-8 lg:px-12 py-6 sm:py-8'>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6'>
                <div className='flex-1 space-y-2 sm:space-y-3'>
                  <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-[#050F0D] leading-tight'>
                    Welcome back,{' '}
                    {isLoadingProfile ? (
                      <Skeleton
                        height={24}
                        width={100}
                        className='inline-block sm:h-8 sm:w-32'
                      />
                    ) : (
                      <span className='text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                        {userProfile?.first_name || 'User'}
                      </span>
                    )}
                  </h1>
                  <p className='text-sm sm:text-base text-[#194A43] font-medium opacity-80 max-w-none sm:max-w-lg'>
                    Here's what we have for you today
                  </p>
                </div>
                <div className='flex-shrink-0 w-48'>
                  <Select
                    data={[
                      { value: 'to_date', label: 'To Date' },
                      { value: 'today', label: 'Today' },
                      { value: 'last_7_days', label: 'Last 7 Days' },
                      { value: 'last_30_days', label: 'Last 30 Days' },
                      { value: 'last_3_months', label: 'Last 3 Months' },
                      { value: 'last_year', label: 'Last Year' },
                    ]}
                    value={selectedTimeRange}
                    onChange={(value) =>
                      setSelectedTimeRange(value || 'to_date')
                    }
                    leftSection={<IconCalendar size={16} />}
                    styles={{
                      input: {
                        borderColor: '#e2e8f0',
                        '&:hover': {
                          borderColor: 'rgba(0, 0, 0, 0.1)',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        },
                        '&:focus': {
                          borderColor: 'var(--mantine-color-primary-filled)',
                          boxShadow:
                            '0 0 0 1px var(--mantine-color-primary-filled)',
                        },
                      },
                      section: {
                        marginRight: 8,
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className='px-6 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10'>
            <div className='mb-8 sm:mb-10 lg:mb-12'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2'>
                <div>
                  <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-1'>
                    Analytics Overview
                  </h2>
                  <p className='text-sm text-gray-600'>
                    Key metrics for your class management
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                <div className='flex h-[100px] sm:h-[110px] bg-[#EEEAF2] rounded-xl px-5 py-4 gap-4 border border-[#E1D5ED] hover:shadow-md hover:border-[#D1C5DD] transition-all duration-200 cursor-pointer group'>
                  <div className='flex items-center justify-center w-12 h-12 bg-white/25 rounded-lg group-hover:bg-white/35 transition-colors duration-200 flex-shrink-0'>
                    <img
                      src={sessionsIcon}
                      alt='Sessions icon'
                      className='w-6 h-6 group-hover:scale-105 transition-transform duration-200'
                    />
                  </div>
                  <div className='flex-1 flex flex-col justify-center space-y-1.5 min-w-0'>
                    <h4 className='text-xs sm:text-sm text-[#53237C] font-medium uppercase tracking-wide'>
                      Total Sessions
                    </h4>
                    <div className='flex items-end gap-3 flex-wrap'>
                      {isLoadingAnalytics ? (
                        <Skeleton
                          height={24}
                          width={40}
                          className='sm:h-7 sm:w-12'
                        />
                      ) : (
                        <p className='text-xl sm:text-2xl font-bold text-[#53237C] leading-none'>
                          {formatNumber(analytics?.total_sessions)}
                        </p>
                      )}
                      <div className='flex items-center gap-1 mb-0.5'>
                        <span className='text-xs text-secondary'>↗</span>
                        <p className='text-xs text-secondary font-medium'>
                          +4.5%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex h-[100px] sm:h-[110px] bg-[#FEF5E2] rounded-xl px-5 py-4 gap-4 border border-[#F5E6C8] hover:shadow-md hover:border-[#E8D6B8] transition-all duration-200 cursor-pointer group'>
                  <div className='flex items-center justify-center w-12 h-12 bg-white/25 rounded-lg group-hover:bg-white/35 transition-colors duration-200 flex-shrink-0'>
                    <img
                      src={totalClientsIcon}
                      alt='Clients icon'
                      className='w-6 h-6 group-hover:scale-105 transition-transform duration-200'
                    />
                  </div>
                  <div className='flex-1 flex flex-col justify-center space-y-1.5 min-w-0'>
                    <h4 className='text-xs sm:text-sm text-[#E19E09] font-medium uppercase tracking-wide'>
                      Total Clients
                    </h4>
                    <div className='flex items-end gap-3 flex-wrap'>
                      {isLoadingAnalytics ? (
                        <Skeleton
                          height={24}
                          width={40}
                          className='sm:h-7 sm:w-12'
                        />
                      ) : (
                        <p className='text-xl sm:text-2xl font-bold text-[#E19E09] leading-none'>
                          {formatNumber(analytics?.total_clients)}
                        </p>
                      )}
                      <div className='flex items-center gap-1 mb-0.5'>
                        <span className='text-xs text-[#FF3B30]'>↘</span>
                        <p className='text-xs text-[#FF3B30] font-medium'>
                          -2.3%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex h-[100px] sm:h-[110px] bg-[#E0EFFF] rounded-xl px-5 py-4 gap-4 border border-[#C7E2FF] hover:shadow-md hover:border-[#B5D6FF] transition-all duration-200 cursor-pointer group sm:col-span-2 lg:col-span-1'>
                  <div className='flex items-center justify-center w-12 h-12 bg-white/25 rounded-lg group-hover:bg-white/35 transition-colors duration-200 flex-shrink-0'>
                    <img
                      src={totalStaffIcon}
                      alt='Staff icon'
                      className='w-6 h-6 group-hover:scale-105 transition-transform duration-200'
                    />
                  </div>
                  <div className='flex-1 flex flex-col justify-center space-y-1.5 min-w-0'>
                    <h4 className='text-xs sm:text-sm text-[#007AFF] font-medium uppercase tracking-wide'>
                      Total Staff
                    </h4>
                    <div className='flex items-end gap-3 flex-wrap'>
                      {isLoadingAnalytics ? (
                        <Skeleton
                          height={24}
                          width={40}
                          className='sm:h-7 sm:w-12'
                        />
                      ) : (
                        <p className='text-xl sm:text-2xl font-bold text-[#007AFF] leading-none'>
                          {formatNumber(analytics?.total_staff)}
                        </p>
                      )}
                      <div className='flex items-center gap-1 mb-0.5'>
                        <span className='text-xs text-secondary'>↗</span>
                        <p className='text-xs text-secondary font-medium'>
                          +1.6%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 mt-6'>
              <div className='xl:col-span-4 space-y-6'>
                {/* Clients Overview Card */}
                <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
                  <div className='flex flex-col justify-between items-center mb-6'>
                    <h4 className='text-[#08040C] self-start text-lg font-semibold pb-4'>
                      Clients Overview
                    </h4>
                    <div className='w-full h-[240px]'>
                      <DonutChart
                        data={analytics?.gender_distribution || []}
                        height={180}
                        width={400}
                      />
                    </div>
                  </div>
                </div>

                {/* Weekly Clients Bar Chart */}
                <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 mt-6'>
                  <h4 className='text-[#08040C] text-lg font-semibold mb-4'>
                    Weekly Clients
                  </h4>
                  <div className='flex justify-center items-center w-full h-[200px]'>
                    {isLoadingWeeklyClients ? (
                      <div className='h-full flex items-center justify-center'>
                        <Skeleton height={200} width="100%" />
                      </div>
                    ) : weeklyClientsData ? (
                      <BarGraph 
                        data={weeklyClientsData.data.map(item => ({
                          day: item.day.substring(0, 3), 
                          clients: item.value
                        }))} 
                        height="100%" 
                      />
                    ) : (
                      <div className='h-full flex items-center justify-center text-gray-500'>
                        No data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Sessions per Staff Card */}
                <Card
                  withBorder
                  radius='md'
                  className='hover:shadow-md transition-shadow'
                >
                  <Group justify='space-between' mb='md'>
                    <Text size='lg' fw={600}>
                      Sessions per Staff
                    </Text>
                    <Badge variant='light' color='blue'>
                      Today
                    </Badge>
                  </Group>
                  <SessionsPerStaff />
                </Card>

                {/* Upcoming Birthdays Card */}
                <Card
                  withBorder
                  radius='md'
                  className='hover:shadow-md transition-shadow'
                >
                  <Group justify='space-between' mb='md'>
                    <Text size='lg' fw={600}>
                      Upcoming Birthdays
                    </Text>
                    <Badge variant='light' color='pink'>
                      This Week
                    </Badge>
                  </Group>
                  <UpcomingBirthdays />
                </Card>

                {/* Category Distribution Card */}
                <Card
                  withBorder
                  radius='md'
                  className='hover:shadow-md transition-shadow'
                >
                  <Group justify='space-between' mb='md'>
                    <Text size='lg' fw={600}>
                      Category Distribution
                    </Text>
                    <Badge variant='light' color='violet'>
                      All Time
                    </Badge>
                  </Group>
                  <CategoryDistribution />
                </Card>
              </div>

              <div className='xl:col-span-8 space-y-6'>
                {/* Upcoming Sessions Card */}
                <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
                  <div className='flex justify-between items-center mb-6'>
                    <h4 className='text-[#08040C] text-lg font-semibold'>
                      Upcoming Sessions
                    </h4>
                    <button
                      className='flex gap-2 items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 self-start sm:self-auto'
                      onClick={() => navigateToCalendar(navigate)}
                      aria-label='View all upcoming sessions'
                    >
                      <p className='text-secondary text-sm font-medium'>
                        View All
                      </p>
                      <img
                        src={rightIcon}
                        alt='Arrow right'
                        className='w-4 h-4'
                      />
                    </button>
                  </div>

                  <div className='space-y-3'>
                    {isLoadingSessions ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className='flex flex-col sm:flex-row sm:items-center p-4 border border-gray-100 rounded-lg gap-3 sm:gap-4'
                        >
                          <Skeleton
                            height={32}
                            width={80}
                            className='sm:mr-0'
                          />
                          <div className='hidden sm:block h-8 w-[1px] bg-gray-200'></div>
                          <div className='flex-1 space-y-2'>
                            <Skeleton height={12} width={120} />
                            <Skeleton height={16} width={200} />
                          </div>
                          <Skeleton height={12} width={160} />
                        </div>
                      ))
                    ) : limitedUpcomingSessions.length > 0 ? (
                      limitedUpcomingSessions.map((session, index) => (
                        <div
                          key={session?.id || index}
                          className='flex flex-col sm:flex-row sm:items-center p-4 border border-gray-100 rounded-lg hover:shadow-sm hover:border-gray-200 transition-all duration-200 gap-3 sm:gap-4'
                        >
                          <div className='flex justify-between sm:block sm:w-20 sm:text-center'>
                            <p className='text-xs font-semibold text-gray-900'>
                              {formatToEATTime(session?.start_time || '')} -{' '}
                              {formatToEATTime(session?.end_time || '')}
                            </p>
                            <p className='text-sm text-gray-600 sm:hidden'>
                              {session?.date
                                ? format(new Date(session.date), 'MMM dd, yyyy')
                                : 'Date TBD'}
                            </p>
                          </div>
                          <div className='hidden sm:block h-8 w-[1px] bg-gray-200'></div>
                          <div className='flex-1 space-y-1'>
                            <p className='text-xs text-gray-600'>
                              {session?.staff?.name || 'Unassigned'}
                            </p>
                            <p className='text-sm font-semibold text-gray-900'>
                              {session?.title}
                            </p>
                          </div>
                          <div className='hidden sm:block text-right'>
                            <p className='text-sm text-gray-600'>
                              {session?.date
                                ? format(new Date(session.date), 'MMM dd, yyyy')
                                : 'Date TBD'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='flex items-center justify-center py-12 border border-gray-100 rounded-lg'>
                        <div className='text-center'>
                          <p className='text-gray-500 text-sm mb-2'>
                            No upcoming sessions
                          </p>
                          <p className='text-gray-400 text-xs'>
                            Sessions will appear here when scheduled
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clients Table Card */}
                <div className='bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200'>
                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-6 border-b border-gray-100 gap-3'>
                    <h3 className='text-lg font-semibold text-primary'>
                      Clients
                    </h3>
                    <button
                      className='flex gap-2 items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 self-start sm:self-auto'
                      onClick={() => navigateToClients(navigate)}
                      aria-label='View all clients'
                    >
                      <p className='text-secondary text-sm font-medium'>
                        View All
                      </p>
                      <img
                        src={rightIcon}
                        alt='Arrow right'
                        className='w-4 h-4'
                      />
                    </button>
                  </div>

                  <div className='overflow-x-auto'>
                    {isLoadingClients ? (
                      <div className='p-6 space-y-3'>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div
                            key={index}
                            className='flex items-center space-x-4'
                          >
                            <Skeleton height={16} width={150} />
                            <Skeleton height={16} width={120} />
                            <Skeleton height={16} width={180} />
                            <Skeleton height={16} width={80} />
                            <Skeleton height={16} width={100} />
                          </div>
                        ))}
                      </div>
                    ) : clients?.items?.length > 0 ? (
                      <div className='[&>div]:shadow-none [&>div]:rounded-none [&>div]:border-none'>
                        <Table
                          data={clients.items}
                          columns={columns}
                          rowSelection={rowSelection}
                          onRowSelectionChange={setRowSelection}
                          // pageSize={8}
                          onRowClick={(row: Client) =>
                            navigateToClientDetails(navigate, row.id.toString())
                          }
                          className='shadow-none rounded-none border-none'
                          showPagination={false}
                        />
                      </div>
                    ) : (
                      <div className='flex items-center justify-center py-12 mx-6'>
                        <div className='text-center'>
                          <p className='text-gray-500 text-sm mb-2'>
                            No clients found
                          </p>
                          <p className='text-gray-400 text-xs'>
                            Clients will appear here when added to your system
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancellations & Reschedules Card */}
                <Card
                  withBorder
                  radius='md'
                  className='hover:shadow-md transition-shadow'
                >
                  <Group justify='space-between' mb='md'>
                    <Text size='lg' fw={600}>
                      Cancellations & Reschedules
                    </Text>
                    <Badge variant='light' color='orange'>
                      Last 30 Days
                    </Badge>
                  </Group>
                  <CancellationsReschedules />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default GettingStarted;
