import { useParams } from 'react-router-dom';
import MembersHeader from '../headers/MembersHeader';
import {
  Progress,
  Menu,
  Modal,
  Text,
  Button,
  Stack,
  Group,
  Loader,
} from '@mantine/core';
import { getSelectedClientIds } from '../../utils/tableUtils';
import { useCallback, useMemo, useState } from 'react';
import Table from '../common/Table';
import { createColumnHelper } from '@tanstack/react-table';
import { useExportSessionClients } from '../../hooks/useExport';

import {
  useGetSessionDetail,
  useGetSessionAnalytics,
  useGetSessionClients,
} from '../../hooks/reactQuery';

import actionOptionIcon from '../../assets/icons/actionOption.svg';
import { Client } from '../../types/clientTypes';
import avatar from '../../assets/icons/newAvatar.svg';
import { useUIStore } from '../../store/ui';
import { useSessionAttendanceActions } from './SessionAttendanceActions';
import { useForm } from 'react-hook-form';
import {
  AttendedSession,
  CancelledSession,
  MakeUpSession,
} from '../../types/sessionTypes';

// Extended participant interface for session details display
interface SessionParticipant {
  id: string | number;
  name: string;
  phone?: string;
  email?: string;
  type: 'client' | 'booking';
  status: string;
  active?: boolean;
  booking_reference?: string;
  is_group_booking?: boolean;
  quantity?: number;
  isAttended?: boolean;
  // Client properties
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  clientId?: number;
  // Other Client properties that might be needed
  [key: string]: any; // This allows for any additional properties
}

const columnHelper = createColumnHelper<SessionParticipant>();

const SessionDetails = () => {
  const { id: sessionId } = useParams();
  const currentSessionId = sessionId ? parseInt(sessionId) : 0;
  const [selectedClient, setSelectedClient] = useState<Client | SessionParticipant | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isRemovingClient, setIsRemovingClient] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'clients'>(
    'overview'
  );

  const {
    data: session,
    isLoading: sessionLoading,
    isError: sessionError,
    error: sessionErrorDetails,
    refetch: refetchSession,
  } = useGetSessionDetail(sessionId || '');

  const { data: sessionAnalytics, isLoading: analyticsLoading } =
    useGetSessionAnalytics(sessionId || '');

  const {
    data: clients = [],
    isLoading: clientsLoading,
    isError: clientsError,
    error: clientsErrorDetails,
    refetch: refetchClients,
  } = useGetSessionClients(sessionId || '');

  const {
    handleBulkAttendance,
    handleBulkMakeup,
    handleBulkCancel,
    openActionModal,
    handleRemoveAction,
    modals: attendanceModals,
  } = useSessionAttendanceActions({
    sessionId: sessionId || '',
    currentSessionId,
    clients,
    refetchSession,
    refetchClients,
    selectedClient,
    rowSelection,
    setRowSelection,
    setSelectedClient,
    session,
  });
  // Process session participants using cleaned attendances data from backend
  const sessionParticipants = useMemo((): SessionParticipant[] => {
    if (!session?.attendances) return [];

    return session.attendances.map((attendance) => ({
      id: `attendance-${attendance.id}`,
      name: attendance.participant_name || 'Unknown',
      phone: attendance.participant_phone,
      email: attendance.participant_email,
      type: (attendance.participant_type as 'client' | 'booking') || 'client',
      status: attendance.display_status || 'registered',
      active: attendance.participant_type === 'client' ? true : undefined,
      booking_reference: attendance.booking_reference,
      isAttended: attendance.attended,
      clientId:
        attendance.client === null
          ? undefined
          : typeof attendance.client === 'object'
          ? attendance.client.id
          : typeof attendance.client === 'number'
          ? attendance.client
          : undefined,
    }));
  }, [session]);

  const methods = useForm<MakeUpSession | AttendedSession | CancelledSession>();

  const {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  } = useExportSessionClients(sessionParticipants || []);

  const { openDrawer } = useUIStore();

  const handleOpenUpdateSession = () => {
    openDrawer({
      type: 'session',
      entityId: sessionId,
      isEditing: true,
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Function to get selected client IDs for export
  const getExportClientIds = useCallback(() => {
    return getSelectedClientIds(rowSelection, clients);
  }, [rowSelection, clients]);

  const formatDayNames = (days: (string | number)[] | undefined) => {
    if (!days || !days.length) return '';
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayAbbreviations: Record<string, string> = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    };
    return days
      .map((day) => {
        const dayName =
          typeof day === 'number' ? dayNames[day % 7] : day.toLowerCase();
        return dayAbbreviations[dayName] || dayName;
      })
      .join(', ');
  };

  const handleAttendanceStatusChange = () => {
    if (sessionId) {
      const fetchSessionDetails = async () => {
        try {
          const sessionDetails = await refetch();
          methods.setValue(
            'session_title',
            sessionDetails?.data?.title || 'Unnamed Session'
          );
        } catch (error) {
          console.error('Failed to fetch session details', error);
          methods.setValue('session_title', `Session ${sessionId}`);
        }
      };

      fetchSessionDetails();
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type='checkbox'
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
        cell: ({ row }) => (
          <input
            type='checkbox'
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className='w-4 h-4 rounded cursor-pointer bg-[#F7F8FA] accent-[#DBDEDF]'
          />
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <div className='flex flex-col'>
            <span className='text-sm text-primary'>{info.getValue()}</span>
            {info.row.original.booking_reference && (
              <span className='text-xs text-gray-500'>
                Ref: {info.row.original.booking_reference}
              </span>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => (
          <span
            className={`inline-block px-2 py-1 rounded-lg text-xs text-center min-w-[70px] ${
              info.getValue() === 'client'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {info.getValue() === 'client' ? 'Client' : 'Booking'}
          </span>
        ),
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: (info) => info.getValue() || '-',
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          let colorClasses = 'bg-gray-100 text-gray-700'; // default

          switch (status) {
            case 'attended':
              colorClasses = 'bg-green-100 text-green-700';
              break;
            case 'confirmed':
              colorClasses = 'bg-green-100 text-green-700';
              break;
            case 'registered':
              colorClasses = 'bg-blue-100 text-blue-700';
              break;
            case 'cancelled':
              colorClasses = 'bg-red-100 text-red-700';
              break;
            case 'Active':
              colorClasses = 'bg-green-100 text-green-700';
              break;
            case 'Inactive':
              colorClasses = 'bg-red-100 text-red-700';
              break;
            default:
              colorClasses = 'bg-gray-100 text-gray-700';
          }

          return (
            <span
              className={`inline-block px-2 py-1 rounded-lg text-xs text-center min-w-[80px] ${colorClasses}`}
            >
              {status}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'progress',
        header: 'Progress',
        cell: () => (
          <Progress color='#FFAE0080' size='sm' radius='xl' value={50} />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => (
          <div className='flex space-x-2' onClick={(e) => e.stopPropagation()}>
            <Group justify='center'>
              <Menu
                width={150}
                shadow='md'
                position='bottom'
                radius='md'
                withArrow
                offset={4}
              >
                <Menu.Target>
                  <img
                    src={actionOptionIcon}
                    alt='Options'
                    className='w-4 h-4 cursor-pointer'
                  />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    color='#1D9B5E'
                    className='text-sm'
                    style={{ textAlign: 'center' }}
                    onClick={handleBulkAttendance}
                  >
                    Bulk Attendance
                  </Menu.Item>
                  <Menu.Item
                    color='blue'
                    className='text-sm'
                    style={{ textAlign: 'center' }}
                    onClick={handleBulkMakeup}
                  >
                    Bulk Make-up
                  </Menu.Item>
                  <Menu.Item
                    color='gray'
                    className='text-sm'
                    style={{ textAlign: 'center' }}
                    onClick={handleBulkCancel}
                  >
                    Bulk Cancel
                  </Menu.Item>
                  <Menu.Item
                    color='gray'
                    className='text-sm'
                    style={{ textAlign: 'center' }}
                    onClick={openExportModal}
                  >
                    Export Clients
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </div>
        ),
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div
              className='flex space-x-2'
              onClick={(e) => e.stopPropagation()}
            >
              <Menu
                width={150}
                shadow='md'
                position='bottom'
                radius='md'
                withArrow
                offset={4}
              >
                <Menu.Target>
                  <img
                    src={actionOptionIcon}
                    alt='Options'
                    className='w-4 h-4 cursor-pointer'
                  />
                </Menu.Target>
                <Menu.Dropdown>
                  {client.type === 'client' ? (
                    // Traditional client actions
                    <>
                      <Menu.Item
                        component='div'
                        color='green'
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedClient(client);
                          openActionModal(client, 'attended');
                        }}
                        className='text-sm'
                        style={{ textAlign: 'center' }}
                      >
                        Attended
                      </Menu.Item>

                      <Menu.Item
                        component='div'
                        color='blue'
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedClient(client);
                          openActionModal(client, 'make_up');
                        }}
                        className='text-sm'
                        style={{ textAlign: 'center' }}
                      >
                        Make-up
                      </Menu.Item>

                      <Menu.Item
                        component='div'
                        color='gray'
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedClient(client);
                          openActionModal(client, 'cancelled');
                        }}
                        className='text-sm'
                        style={{ textAlign: 'center' }}
                      >
                        Cancelled
                      </Menu.Item>

                      <Menu.Item
                        component='div'
                        color='red'
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveAction(client);
                        }}
                        className='text-sm'
                        style={{ textAlign: 'center' }}
                      >
                        Remove
                      </Menu.Item>
                    </>
                  ) : (
                    // Booking client actions - limited options
                    <>
                      <Menu.Item
                        color='green'
                        onClick={() => {
                          setSelectedClient(client);
                          setSelectedStatus('attended');
                          setIsRemovingClient(false);
                          handleAttendanceStatusChange();

                          methods.setValue('client_name', client.name);
                          open();
                        }}
                        className='text-sm'
                        style={{ textAlign: 'center' }}
                      >
                        Mark Attended
                      </Menu.Item>

                      <Menu.Item
                        color='gray'
                        disabled
                        className='text-sm'
                        style={{ textAlign: 'center' }}
                      >
                        View Booking Details
                      </Menu.Item>
                    </>
                  )}
                </Menu.Dropdown>
              </Menu>
            </div>
          );
        },
      }),
    ],
    [
      handleBulkAttendance,
      handleBulkMakeup,
      handleBulkCancel,
      openActionModal,
      handleRemoveAction,
    ]
  );

  const isLoading = sessionLoading || clientsLoading || analyticsLoading;
  const isError = sessionError || clientsError;
  const error = sessionErrorDetails || clientsErrorDetails;
  const refetch = refetchSession;

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
            Error loading session details: {error?.message}
          </p>
          <button
            onClick={() => refetch()}
            className='px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <h2 className='text-[40px] font-bold text-primary'>
          Session not found
        </h2>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col h-screen bg-cardsBg w-full overflow-y-auto '>
        <MembersHeader
          title='Session Details'
          buttonText='Update Session'
          searchPlaceholder='Search by ID, Name or Subject'
          onButtonClick={handleOpenUpdateSession}
          showFilterIcons={false}
          showSearch={false}
        />
        <div className='items-center gap-4 p-6'>
          <div className='flex flex-col md:flex-row w-full'>
            <div className='flex flex-col md:w-[30%] w-full items-center mt-6'>
              <div className='flex flex-col px-4 py-8 items-center justify-center border bg-white rounded-xl md:w-[290px] w-full mt-4 md:mt-0'>
                <div className='flex flex-col text-center space-y-1 items-center'>
                  <div className='mb-2'>
                    <img
                      src={avatar}
                      alt=''
                      className='w-14 h-14 rounded-full'
                    />
                  </div>
                  <p className='font-medium text-gray-900 text-sm'>
                    {session.title || `Session ${session.id}`}{' '}
                    <span>({session.category?.name || 'No Category'})</span>
                  </p>
                  <p className='text-sm text-gray-500'>
                    {session.class_type || 'Class'}
                  </p>
                  {session.description && (
                    <p className='text-sm text-gray-600 mt-2 max-w-[250px]'>
                      {session.description}
                    </p>
                  )}
                </div>
                <div className='flex space-x-2 mt-4'>
                  <div
                    className={`flex justify-center items-center py-1.5 px-3 rounded-full gap-1.5 ${
                      session.is_active
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        session.is_active
                          ? 'bg-secondary animate-pulse'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    <p
                      className={`text-xs font-medium ${
                        session.is_active ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {session.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <div className='h-[1px] bg-gray-300 w-full my-6'></div>
                <div className='w-full px-4 space-y-4'>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      SESSION ID
                    </span>
                    <span className='text-gray-400  text-xs'>{session.id}</span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      SLOTS
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {session.spots}
                    </span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      LOCATION
                    </span>
                    <span className='text-gray-400 text-xs'>
                      {session.location?.name || 'No location set'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      Calendar
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {(() => {
                        if (session.repeat_on?.length) {
                          const days = formatDayNames(session.repeat_on);
                          const occurrences = session.repeat_occurrences
                            ? ` for ${session.repeat_occurrences} occurrences`
                            : '';
                          const endDate = session.repeat_end_date
                            ? ` until ${formatDate(session.repeat_end_date)}`
                            : '';
                          return `${days}${occurrences}${endDate}`;
                        }
                        if (session.repeat_unit && session.repeat_every) {
                          const frequency =
                            session.repeat_every > 1
                              ? `Every ${session.repeat_every} ${session.repeat_unit}`
                              : session.repeat_unit === 'days'
                              ? 'Daily'
                              : session.repeat_unit === 'weeks'
                              ? 'Weekly'
                              : 'Monthly';
                          return frequency;
                        }
                        return 'No repeats';
                      })()}
                    </span>
                  </div>
                </div>
                <div className='h-[1px] bg-gray-300 w-[80%] mx-auto my-6'></div>
                <div className='w-full px-4 space-y-4'>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      START DATE
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {formatDate(session.date)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      END DATE
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {session.repeat_end_date
                        ? formatDate(session.repeat_end_date)
                        : 'Never'}
                    </span>
                  </div>
                  <div className='flex justify-between items-center w-full text-sm'>
                    <span className='text-gray-400 font-bold text-xs'>
                      ASSIGNED TO
                    </span>
                    <span className='text-gray-400  text-xs'>
                      {session.assigned_staff
                        ? `${session.assigned_staff.user.first_name} ${session.assigned_staff.user.last_name}`
                        : 'Unassigned'}
                    </span>
                  </div>
                </div>
                <div className='h-[1px] bg-gray-300 w-full my-6'></div>
                <div className='w-full pb-6'>
                  <div className='flex justify-between text-xs pb-2'>
                    <p className=''>Enrollment Progress</p>
                    <p className=''>
                      {Math.round(
                        ((session.attendances?.length || 0) /
                          (session.spots || 1)) *
                          100
                      )}
                      %
                    </p>
                  </div>
                  <Progress
                    color='#FFAE0080'
                    size='md'
                    radius='xl'
                    value={
                      session.spots
                        ? ((sessionAnalytics?.total_clients || 0) /
                            session.spots) *
                          100
                        : 0
                    }
                  />
                </div>
              </div>
            </div>
            <div className=' md:w-[70%] w-full md:p-4 mt-6 md:mt-0'>
              <div className='space-y-4'>
                <div className='flex space-x-12 ml-8 relative' role='tablist'>
                  <button
                    role='tab'
                    aria-selected={activeTab === 'overview'}
                    aria-controls='overview-panel'
                    className={`font-semibold text-xl relative cursor-pointer transition-all duration-200 hover:text-secondary  ${
                      activeTab === 'overview'
                        ? 'text-secondary'
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                </div>
                <div className='h-[1px] bg-gray-300 w-full opacity-60'></div>
              </div>
              <div className='flex space-x-16 mt-6'>
                {analyticsLoading ? (
                  <Loader color='#1D9B5E' size='md' />
                ) : (
                  <>
                    <div className='flex flex-col items-center text-center border bg-white rounded-xl p-6 space-y-4'>
                      <p className='text-4xl'>
                        {sessionParticipants?.length || 0}
                        <span className='text-lg text-gray-500'>
                          /{session.spots || '∞'}
                        </span>
                      </p>
                      <p className='text-sm'>Total Participants</p>
                    </div>
                    <div className='flex items-center border bg-white py-6 px-10 rounded-xl'>
                      <div className='flex flex-col text-center items-center rounded-xl space-y-4'>
                        <p className='text-2xl font-semibold text-primary'>
                          {sessionAnalytics?.average_attendance || 0}%
                        </p>
                        <p className='text-sm'>Average Attendance</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className='flex-1 mt-6'>
                <div className=''>
                  <div className='flex space-x-4 mb-3'>
                    <h3 className='font-semibold text-xl relative cursor-pointer transition-all duration-200 hover:text-secondary '>
                      Clients
                    </h3>
                  </div>
                  <div className='flex-1 md:px-6 md:py-3 w-full overflow-x-auto'>
                    <div className='min-w-[900px] md:min-w-0'>
                      <Table
                        data={sessionParticipants}
                        columns={columns}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        className='mt-4'
                        pageSize={5}
                      />{' '}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {attendanceModals}

      <Modal
        opened={exportModalOpened}
        onClose={closeExportModal}
        title={
          <Text fw={600} size='lg'>
            Export Clients
          </Text>
        }
        centered
        radius='md'
        size='md'
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        shadow='xl'
      >
        <div className='py-2'>
          <Text size='sm' style={{ marginBottom: '2rem' }}>
            Select a format to export {Object.keys(rowSelection).length}{' '}
            selected clients
          </Text>

          <Stack gap='md'>
            <Button
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() => {
                const clientIds = getExportClientIds();
                handleExport('excel', clientIds);
              }}
              className='px-6'
              loading={isExporting}
            >
              Export as Excel
            </Button>

            <Button
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() => {
                const clientIds = getExportClientIds();
                handleExport('csv', clientIds);
              }}
              className='px-6'
              loading={isExporting}
            >
              Export as CSV
            </Button>
          </Stack>

          <div className='flex justify-end space-x-4 mt-8'>
            <Button
              variant='outline'
              color='red'
              radius='md'
              onClick={closeExportModal}
              className='px-6'
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SessionDetails;
