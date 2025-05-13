import { useNavigate, useParams } from 'react-router-dom';
import MembersHeader from '../headers/MembersHeader';
import { Loader, Progress } from '@mantine/core';
import { useMemo, useState } from 'react';
import Table from '../common/Table';
import { createColumnHelper } from '@tanstack/react-table';
import { useGetClient, useGetClientAnalytics } from '../../hooks/reactQuery';
import avatar from '../../assets/icons/newAvatar.svg';
import UpdateClient from './UpdateClient';
import { navigateToSessionDetails } from '../../utils/navigationHelpers';
import ProgressTracker from './ProgressTracker';
import ProgressSeriesTracker from './ProgressSeriesTracker';

const ClientDetails = () => {
  const { id: clientId } = useParams();
  const navigate = useNavigate();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'Progress Tracker' | 'Attendance' | 'Assessments'
  >('overview');

  const [viewMode, setViewMode] = useState<'details' | 'levels'>('details');
  const [selectedLevel, setSelectedLevel] = useState<{
    seriesTitle: string;
    level: {
      label: string;
      value: string;
      progress?: number;
    };
  } | null>(null);

  const [rowSelection, setRowSelection] = useState({});

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const {
    data: clientDetails,
    isLoading,
    isError,
    error,
  } = useGetClient(clientId || '');

  const { data: clientAnalytics, isLoading: analyticsLoading } =
    useGetClientAnalytics(clientId || '');

  // Define the type for client sessions
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

  // Get client sessions from the client details
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
      columnHelper.accessor('attended', {
        header: 'Status',
        cell: (info) => (
          <span
            className={`inline-block px-2 py-1 rounded-lg text-sm text-center min-w-[100px] ${
              info.getValue()
                ? 'bg-active text-secondary'
                : 'bg-[#FFCFCC] text-[#FF3B30]'
            }`}
          >
            {info.getValue() ? 'Attended' : 'Not Attended'}
          </span>
        ),
      }),
    ],
    [clientDetails]
  );

  // --- Placeholder Data for Progress Levels ---


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
                // Client Details View
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
                        CLIENT ID
                      </span>
                      <span className='text-gray-400  text-xs'>
                        {clientDetails.id || 'N/A'}
                      </span>
                    </div>
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
                    <div className='flex justify-between items-center w-full text-sm'>
                      <span className='text-gray-400 font-bold text-xs'>
                        CATEGORY
                      </span>
                      <span className='text-gray-400  text-xs'>
                        {clientDetails.classCategory || 'N/A'}
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
                      <p className=''>Learning Progress</p>
                      <p className=''>50%</p> {/* TODO: Use actual progress */}
                    </div>

                    <Progress
                      color='#FFAE0080' // Consider making color dynamic based on progress/status
                      size='md'
                      radius='xl'
                      value={50} // TODO: Use actual progress
                    />
                  </div>
                </div>
              ) : (
                // Progress Levels View
                <ProgressSeriesTracker 
                  onLevelSelect={(seriesTitle, level) => {
                    setSelectedLevel({ seriesTitle, level });
                    setActiveTab('Progress Tracker');
                  }}
                />
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
                      <div className='flex justify-between'>
                        <h3 className='text-primary text-xl font-semibold'>
                          Client Sessions
                        </h3>
                      </div>
                      {clientSessions && clientSessions.length > 0 ? (
                        <div className='flex-1 py-2'>
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
                        </div>
                      ) : (
                        <div className='flex justify-center items-center p-8'>
                          <h2 className='text-xl font-bold text-primary'>
                            No sessions found for this client
                          </h2>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : activeTab === 'Progress Tracker' ? (
                <div className='flex justify-center items-center p-8'>
                  <ProgressTracker 
                    setViewMode={setViewMode} 
                    selectedLevel={selectedLevel}
                  />
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
