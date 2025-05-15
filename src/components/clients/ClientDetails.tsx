import { useNavigate, useParams } from 'react-router-dom';
import MembersHeader from '../headers/MembersHeader';
import { Button, Loader, Progress } from '@mantine/core';
import { useMemo, useState } from 'react';
import Table from '../common/Table';
import { createColumnHelper } from '@tanstack/react-table';
import { useGetClient, useGetClientAnalytics } from '../../hooks/reactQuery';
import avatar from '../../assets/icons/newAvatar.svg';
import UpdateClient from './UpdateClient';
import { navigateToSessionDetails } from '../../utils/navigationHelpers';
import ProgressTracker from './ProgressTracker';
import ProgressSeriesTracker from './ProgressSeriesTracker';
import { useProgressStore } from '../../store/progressStore';
import MakeUp from './MakeUp';

type isActiveType = 'Client Sessions' | 'Make-up';

const ClientDetails = () => {
  const { id: clientId } = useParams();
  const navigate = useNavigate();
  const { viewMode, setViewMode, activeTab, setActiveTab } = useProgressStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [isActive, setIsActive] = useState<isActiveType>('Client Sessions');

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const {
    data: clientDetails,
    isLoading,
    isError,
    error,
  } = useGetClient(clientId || '');

  const {
    levelProgress,
  } = useProgressStore();

  const averageProgress = useMemo(() => {
    const values = Object.values(levelProgress);
    const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
    return average
  }, [levelProgress])
  

  const { data: clientAnalytics, isLoading: analyticsLoading } =
    useGetClientAnalytics(clientId || '');

  type ClientSession = {
    session_id: number;
    session_title: string;
    staff: {
      user: {
        id: string;
        first_name: string;
        last_name: string;
      };
    };
    start_time: string;
    end_time: string;
    attended: boolean;
    session_type: string;
    class_type: string;
  };

  const clientSessions = useMemo(() => {
    return clientDetails?.sessions || [];
  }, [clientDetails]);

  const columnHelper = createColumnHelper<ClientSession>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('session_title', {
        header: 'Session',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('staff', {
        header: 'Assigned To',
        cell: (info) => {
          const staff = info.getValue();
          return staff && staff.user
            ? `${staff.user.first_name} ${staff.user.last_name}`
            : 'Not Assigned';
        },
      }),
      columnHelper.accessor('class_type', {
        header: 'Session Type',
        cell: (info) => {
          const type = info.getValue();
          return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'N/A';
        },
      }),
      columnHelper.accessor('start_time', {
        header: 'Date',
        cell: (info) => {
          const date = new Date(info.getValue());
          return date.toLocaleDateString();
        },
      }),
    ],
    [clientDetails]
  );

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader color='#1D9B5E' size='xl' />
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='space-y-4'>
          <p className='text-red-500'>
            Error loading client details: {error?.message}
          </p>
        </div>
      </div>
    );
  }

  if (!clientDetails) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <p className='text-primary'>Client not found</p>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto '>
        <MembersHeader
          title='Client Details'
          buttonText='Update Client'
          searchPlaceholder='Search by ID, Name or Subject'
          onButtonClick={openDrawer}
          showFilterIcons={false}
        />
        <div className='items-center gap-4 p-6'>
          <div className='flex w-full'>
            <div className='flex flex-col w-[30%] items-center mt-6'>
              {/* Conditional Rendering for Left Panel */}
              {viewMode === 'details' ? (
                <div className='flex flex-col px-4 py-8 items-center justify-center border bg-white rounded-xl w-[290px]'>
                  <img
                    src={clientDetails.profileImage || avatar}
                    alt='Profile'
                    className='w-12 h-12 rounded-full'
                  />
                  <div className='mt-2 text-center space-y-1'>
                    <p className='font-medium text-gray-900 text-sm'>
                      {`${clientDetails.first_name} ${clientDetails.last_name}`}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {clientDetails.email}
                    </p>
                  </div>
                  <div className='flex space-x-2 mt-4'>
                    <div
                      className={`flex justify-center items-center py-1.5 px-3 rounded-full gap-1.5 ${
                        clientDetails.active
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          clientDetails.active
                            ? 'bg-secondary animate-pulse'
                            : 'bg-red-500'
                        }`}
                      ></div>
                      <p
                        className={`text-xs font-medium ${
                          clientDetails.active
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}
                      >
                        {clientDetails.active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  <div className='h-[1px] bg-gray-300 w-full my-6'></div>
                  <div className='w-full px-4 space-y-4'>
                    <div className='flex justify-between items-center w-full text-sm'>
                      <span className='text-gray-400 font-bold text-xs'>
                        SESSIONS
                      </span>
                      <span className='text-gray-400  text-xs'>
                        {analyticsLoading ? (
                          <Loader color='#1D9B5E' size='md' />
                        ) : (
                          clientAnalytics?.total_sessions || 0
                        )}
                      </span>
                    </div>
                  </div>
                  <div className='h-[1px] bg-gray-300 w-[80%] mx-auto my-6'></div>
                  <div className='w-full px-4 space-y-4'>
                    <div className='flex justify-between items-center w-full text-sm'>
                      <span className='text-gray-400 font-bold text-xs'>
                        DATE CREATED
                      </span>
                      <span className='text-gray-400  text-xs'>
                        {new Date(
                          clientDetails.created_at
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className='flex justify-between items-center w-full text-sm'>
                      <span className='text-gray-400 font-bold text-xs'>
                        ASSIGNED TO
                      </span>
                      <span className='text-gray-400  text-xs'>
                        {clientDetails.assignedTo || 'Not Assigned'}
                      </span>
                    </div>
                  </div>
                  <div className='h-[1px] bg-gray-300 w-full my-6'></div>
                  <div className='w-full pb-6'>
                    <div className='flex justify-between text-xs pb-2'>
                      <p className=''>Average Learning Progress</p>
                      <p className=''>{averageProgress}%</p>
                    </div>

                    <Progress
                      color={averageProgress === 100 ? "#1D9B5E" : '#FF9500'}
                      size='md'
                      radius='xl'
                      value={averageProgress}
                    />
                  </div>
                </div>
              ) : (
                <ProgressSeriesTracker />
              )}
              {/* End Conditional Rendering */}
            </div>
            <div className=' w-[70%] p-4'>
              <div className='space-y-4'>
                <div className='flex space-x-12 ml-8 relative' role='tablist'>
                  <button
                    role='tab'
                    aria-selected={activeTab === 'overview'}
                    aria-controls='overview-panel'
                    className={`font-bold text-xl relative cursor-pointer transition-all duration-200  ${
                      activeTab === 'overview' ? 'text-secondary' : ''
                    }`}
                    onClick={() => {
                      setActiveTab('overview');
                      setViewMode('details');
                    }}
                  >
                    Overview
                  </button>
                  <button
                    role='tab'
                    aria-selected={activeTab === 'Progress Tracker'}
                    aria-controls='progress-tracker-panel'
                    className={`font-bold text-xl relative cursor-pointer transition-all duration-200 ${
                      activeTab === 'Progress Tracker' ? 'text-secondary' : ''
                    }`}
                    onClick={() => setActiveTab('Progress Tracker')}
                  >
                    Progress Tracker
                  </button>
                </div>
                <div className='h-[1px] bg-gray-300 w-full opacity-60'></div>
              </div>
              {activeTab === 'overview' ? (
                <>
                  <div className='flex space-x-16 mt-6'>
                    <div className='flex items-center border py-6 px-10 bg-white rounded-xl'>
                      <div className='flex flex-col items-center rounded-xl  space-y-4'>
                        <p className='text-4xl'>
                          {analyticsLoading ? (
                            <Loader color='#1D9B5E' size='md' />
                          ) : (
                            <>
                              {clientAnalytics?.attended_sessions}
                              <span className='text-lg text-gray-500'>
                                /{clientAnalytics?.total_sessions || 0}
                              </span>
                            </>
                          )}
                        </p>
                        <p className='text-sm'>Sessions</p>
                      </div>
                    </div>
                    <div className='flex items-center border py-6 px-10 bg-white rounded-xl'>
                      <div className='flex flex-col items-center rounded-xl  space-y-4'>
                        <p className='text-2xl font-semibold  test-primary'>
                          {analyticsLoading ? (
                            <Loader color='#1D9B5E' size='md' />
                          ) : (
                            `${clientAnalytics?.average_attendance || 0}%`
                          )}
                        </p>
                        <p className='text-sm'>Average Attendance</p>
                      </div>
                    </div>
                  </div>
                  <div className='flex-1 mt-6'>
                    <div className=''>
                      <div className='flex gap-4 mb-3'>
                        <Button
                          color='#1D9B5E'
                          radius='md'
                          variant={
                            isActive === 'Client Sessions'
                              ? 'filled'
                              : 'outline'
                          }
                          onClick={() => setIsActive('Client Sessions')}
                        >
                          Client Sessions
                        </Button>
                        <Button
                          color='#1D9B5E'
                          radius='md'
                          variant={
                            isActive === 'Make-up' ? 'filled' : 'outline'
                          }
                          onClick={() => setIsActive('Make-up')}
                        >
                          Make-Up Sessions
                        </Button>
                      </div>
                      <div className='flex-1 py-2'>
                        {isActive === 'Client Sessions' ? (
                          clientSessions && clientSessions.length > 0 ? (
                            <Table
                              data={clientSessions}
                              columns={columns}
                              rowSelection={rowSelection}
                              onRowSelectionChange={setRowSelection}
                              onRowClick={(row: ClientSession) =>
                                navigateToSessionDetails(
                                  navigate,
                                  row.session_id.toString()
                                )
                              }
                              className='mt-4'
                              pageSize={5}
                            />
                          ) : (
                            <div className='flex justify-center items-center p-8'>
                              <h2 className='text-xl font-bold text-primary'>
                                No sessions found for this client
                              </h2>
                            </div>
                          )
                        ) : (
                          <MakeUp clientId={clientId || ''} />
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : activeTab === 'Progress Tracker' ? (
                <div className='flex justify-center items-center p-8'>
                  <ProgressTracker clientId={clientId || ''} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <UpdateClient
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        clientId={clientId}
      />
    </>
  );
};

export default ClientDetails;
