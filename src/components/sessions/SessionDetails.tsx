import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
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
import { useCallback, useMemo, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useBulkMarkAttendance } from '../../hooks/reactQuery';
import { notifications } from '@mantine/notifications';
import Table from '../common/Table';
import { createColumnHelper, RowSelectionState } from '@tanstack/react-table';
import { useExportSessionClients } from '../../hooks/useExport';
import moment from 'moment';

import {
  useGetSessionDetail,
  useGetSessionAnalytics,
  useGetSessionClients,
  useRemoveClientFromSession,
  useCreateMakeupSession,
  useCreateCancelledSession,
  useCreateAttendedSession,
  useBulkCreateMakeupSessions,
  useBulkCancelSessions,
} from '../../hooks/reactQuery';

import actionOptionIcon from '../../assets/icons/actionOption.svg';
import { Client } from '../../types/clientTypes';
import avatar from '../../assets/icons/newAvatar.svg';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import { useUIStore } from '../../store/ui';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import Input from '../common/Input';
import {
  MakeUpSession,
  AttendedSession,
  CancelledSession,
} from '../../types/sessionTypes';

const columnHelper = createColumnHelper<Client>();

const SessionDetails = () => {
  const { id: sessionId } = useParams();
  const currentSessionId = sessionId ? parseInt(sessionId) : 0;

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [, setIsMarkingAttended] = useState(false);
  const [isRemovingClient, setIsRemovingClient] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [
    bulkAttendanceOpened,
    { open: openBulkAttendance, close: closeBulkAttendance },
  ] = useDisclosure(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
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

  // Form for bulk actions
  type BulkActionFormValues = {
    sessionName: string;
    date: string;
    newDate?: string;
    newStartTime?: string;
    newEndTime?: string;
  };

  const [bulkActionType, setBulkActionType] = useState<
    'attendance' | 'makeup' | 'cancellation' | null
  >(null);

  // Initialize form with default values
  const bulkMethods = useForm<BulkActionFormValues>({
    defaultValues: {
      sessionName: '',
      date: new Date().toISOString().split('T')[0],
      newDate: new Date().toISOString().split('T')[0],
      newStartTime: '09:00',
      newEndTime: '10:00',
    },
  });

  const {
    control: bulkControl,
    handleSubmit: handleBulkFormSubmit,
    reset: resetBulk,
    watch: watchBulk,
    setValue: setBulkValue,
  } = bulkMethods;

  const newDate = watchBulk('newDate');
  const newStartTime = watchBulk('newStartTime');
  const newEndTime = watchBulk('newEndTime');

  // Update form when session data is loaded or when bulk action type changes
  useEffect(() => {
    if (session) {
      resetBulk((prev) => ({
        ...prev,
        sessionName: session.title || '',
      }));
    }
  }, [session, resetBulk, bulkActionType]);

  // Set default times when new date changes
  useEffect(() => {
    if (newDate && !newStartTime) {
      setBulkValue('newStartTime', '09:00');
    }
    if (newDate && !newEndTime) {
      setBulkValue('newEndTime', '10:00');
    }
  }, [newDate, newStartTime, newEndTime, setBulkValue]);

  const removeClientMutation = useRemoveClientFromSession();
  const createMakeupSessionMutation = useCreateMakeupSession();
  const createAttendedSessionMutation = useCreateAttendedSession();
  const createCancelledSessionMutation = useCreateCancelledSession();

  const { data: sessionAnalytics, isLoading: analyticsLoading } =
    useGetSessionAnalytics(sessionId || '');

  const {
    data: clients = [],
    isLoading: clientsLoading,
    isError: clientsError,
    error: clientsErrorDetails,
    refetch: refetchClients,
  } = useGetSessionClients(sessionId || '');

  const getSelectedClientIds = useCallback(() => {
    if (!clients || !rowSelection) return [];

    return Object.entries(rowSelection)
      .filter(([_, isSelected]) => isSelected === true)
      .map(([rowId]) => {
        const rowIndex = parseInt(rowId);
        if (isNaN(rowIndex) || rowIndex < 0 || rowIndex >= clients.length) {
          return null;
        }
        return clients[rowIndex]?.id?.toString();
      })
      .filter((id): id is string => id !== null);
  }, [rowSelection, clients]);

  const bulkMarkAttendanceMutation = useBulkMarkAttendance();
  const bulkCreateMakeupMutation = useBulkCreateMakeupSessions();
  const bulkCancelMutation = useBulkCancelSessions();

  const handleBulkAttendance = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clientIds = getSelectedClientIds();
    if (clientIds.length === 0) {
      notifications.show({
        title: 'No clients selected',
        message: 'Please select at least one client to mark as attended',
        color: 'yellow',
        autoClose: 5000,
        withBorder: true,
        position: 'top-right',
        radius: 'md',
        icon: (
          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-yellow-200'>
            <img src={errorIcon} alt='Warning' className='w-4 h-4' />
          </span>
        ),
      });
      return;
    }
    setBulkActionType('attendance');
    openBulkAttendance();
  };

  const handleBulkMakeup = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clientIds = getSelectedClientIds();
    if (clientIds.length === 0) {
      notifications.show({
        title: 'No clients selected',
        message: 'Please select at least one client from the table',
        color: 'red',
        autoClose: 3000,
        icon: (
          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
            <img src={errorIcon} alt='Error' className='w-4 h-4' />
          </span>
        ),
        withBorder: true,
        position: 'top-right',
        radius: 'md',
      });
      return;
    }
    setBulkActionType('makeup');
    openBulkAttendance();
  };

  const handleBulkCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clientIds = getSelectedClientIds();
    if (clientIds.length === 0) {
      notifications.show({
        title: 'No clients selected',
        message: 'Please select at least one client to cancel attendance for',
        color: 'yellow',
        autoClose: 5000,
        withBorder: true,
        position: 'top-right',
        radius: 'md',
        icon: (
          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-yellow-200'>
            <img src={errorIcon} alt='Warning' className='w-4 h-4' />
          </span>
        ),
      });
      return;
    }
    setBulkActionType('cancellation');
    openBulkAttendance();
  };

  // Helper function to get client names by IDs
  const getClientNamesByIds = (ids: string[]): string => {
    if (!clients || !ids.length) return '';

    const clientNames = ids.map((id) => {
      const client = clients.find((c: Client) => c.id.toString() === id);
      return client
        ? `${client.first_name} ${client.last_name}`
        : `Client ${id}`;
    });

    return clientNames.join(', ');
  };

  const onBulkActionSubmit = async (data: BulkActionFormValues) => {
    const clientIds = getSelectedClientIds();
    if (!clientIds || clientIds.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'No clients selected. Please select at least one client.',
        color: 'red',
        autoClose: 3000,
        icon: (
          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
            <img src={errorIcon} alt='Error' className='w-4 h-4' />
          </span>
        ),
        withBorder: true,
        position: 'top-right',
        radius: 'md',
      });
      return;
    }

    try {
      if (bulkActionType === 'makeup') {
        const formattedOriginalDate = new Date(data.date)
          .toISOString()
          .split('T')[0];
        const formattedNewDate = new Date(data.newDate || '')
          .toISOString()
          .split('T')[0];

        await bulkCreateMakeupMutation.mutateAsync({
          session: currentSessionId,
          client_ids: clientIds.map((id) => parseInt(id, 10)),
          original_date: formattedOriginalDate,
          new_date: formattedNewDate,
          new_start_time: data.newStartTime || '09:00',
          new_end_time: data.newEndTime || '10:00',
        });

        notifications.show({
          title: 'Success',
          message: `Successfully scheduled make-up for ${
            clientIds.length
          } client${clientIds.length > 1 ? 's' : ''}`,
          color: 'green',
          autoClose: 3000,
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          position: 'top-right',
          radius: 'md',
        });
      } else if (bulkActionType === 'cancellation') {
        const formattedDate = new Date(data.date).toISOString().split('T')[0];

        await bulkCancelMutation.mutateAsync({
          session: currentSessionId,
          client_ids: clientIds.map((id) => parseInt(id, 10)),
          date: formattedDate,
        });

        notifications.show({
          title: 'Success',
          message: `Successfully cancelled attendance for ${clientIds.length} client${
            clientIds.length > 1 ? 's' : ''
          }`,
          color: 'green',
          autoClose: 3000,
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          position: 'top-right',
          radius: 'md',
        });
      } else {
        const formattedDate = new Date(data.date).toISOString().split('T')[0];

        await bulkMarkAttendanceMutation.mutateAsync({
          sessionId: currentSessionId,
          clientIds: clientIds.map((id) => parseInt(id, 10)),
          date: formattedDate,
        });

        notifications.show({
          title: 'Success',
          message: `Successfully marked ${clientIds.length} client${
            clientIds.length > 1 ? 's' : ''
          } as attended`,
          color: 'green',
          autoClose: 3000,
          icon: (
            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
              <img src={successIcon} alt='Success' className='w-4 h-4' />
            </span>
          ),
          withBorder: true,
          position: 'top-right',
          radius: 'md',
        });
      }

      closeBulkAttendance();
      setBulkActionType(null);
      setRowSelection({});
      refetchClients();
      refetchSession();
    } catch (error: any) {
      console.error(`Error in bulk ${bulkActionType}:`, error);

      // Handle specific error cases
      let errorMessage =
        error.message || `Failed to process ${bulkActionType} action`;

      if (error.response?.data) {
        // Check for client-specific errors
        if (error.response.data.client_ids) {
          const clientError = error.response.data.client_ids[0];
          if (typeof clientError === 'string') {
            // Handle string error messages
            errorMessage = clientError;
          } else if (Array.isArray(clientError)) {
            // Handle array of error messages
            errorMessage = clientError.join(' ');
          }
        } else if (error.response.data.non_field_errors) {
          // Handle non-field errors
          errorMessage = Array.isArray(error.response.data.non_field_errors)
            ? error.response.data.non_field_errors.join(' ')
            : error.response.data.non_field_errors;
        }
      }

      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
        autoClose: 5000,
        icon: (
          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
            <img src={errorIcon} alt='Error' className='w-4 h-4' />
          </span>
        ),
        withBorder: true,
        position: 'top-right',
        radius: 'md',
      });
    }
  };

  const methods = useForm<MakeUpSession | AttendedSession | CancelledSession>();

  const {
    exportModalOpened,
    openExportModal,
    closeExportModal,
    handleExport,
    isExporting,
  } = useExportSessionClients(clients || []);

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

  const handleRemoveClient = () => {
    if (!selectedClient || !sessionId) return;

    removeClientMutation.mutate(
      { clientId: selectedClient.id.toString(), sessionId },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Client removed from session!',
            color: 'green',
            radius: 'md',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
                <img src={successIcon} alt='Success' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: 'top-right',
          });
          close();
          refetchClients();
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to remove client from session. Please try again.',
            color: 'red',
            radius: 'md',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                <img src={errorIcon} alt='Error' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: 'top-right',
          });
          close();
          refetchClients();
        },
      }
    );
  };

  const handleCreateMakeupSession = () => {
    if (!sessionId || !selectedClient?.id) {
      notifications.show({
        title: 'Error',
        message: 'Please select a client',
        color: 'red',
        radius: 'md',
        icon: (
          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
            <img src={errorIcon} alt='Error' className='w-4 h-4' />
          </span>
        ),
        withBorder: true,
        autoClose: 3000,
        position: 'top-right',
      });
      return;
    }

    const originalDate = methods.getValues('original_date');
    const newDate = methods.getValues('new_date');
    const newStartTime = methods.getValues('new_start_time');
    const newEndTime = methods.getValues('new_end_time');

    if (!originalDate || !newDate) {
      notifications.show({
        title: 'Error',
        message: 'Please select both original and new dates',
        color: 'red',
        radius: 'md',
        icon: (
          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
            <img src={errorIcon} alt='Error' className='w-4 h-4' />
          </span>
        ),
        withBorder: true,
        autoClose: 3000,
        position: 'top-right',
      });
      return;
    }

    const formattedOriginalDate = moment(originalDate).format('YYYY-MM-DD');
    const formattedNewDate = moment(newDate).format('YYYY-MM-DD');

    const formattedStartTime = newStartTime
      ? `${formattedNewDate}T${newStartTime}:00.000Z`
      : '';
    const formattedEndTime = newEndTime
      ? `${formattedNewDate}T${newEndTime}:00.000Z`
      : '';

    console.log('Sending to API:', {
      session: sessionId,
      client: selectedClient.id,
      original_date: formattedOriginalDate,
      new_date: formattedNewDate,
      new_start_time: formattedStartTime,
      new_end_time: formattedEndTime,
    });

    createMakeupSessionMutation.mutate(
      {
        session: sessionId,
        client: selectedClient.id,
        original_date: formattedOriginalDate,
        new_date: formattedNewDate,
        new_start_time: formattedStartTime,
        new_end_time: formattedEndTime,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Makeup session created successfully!',
            color: 'green',
            radius: 'md',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
                <img src={successIcon} alt='Success' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: 'top-right',
          });
          close();
          refetchSession();
        },
        onError: (error) => {
          console.error('Detailed error:', error);
          notifications.show({
            title: 'Error',
            message:
              error?.message ||
              'Failed to create makeup session. Please try again.',
            color: 'red',
            radius: 'md',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                <img src={errorIcon} alt='Error' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: 'top-right',
          });
          close();
        },
      }
    );
  };

  const handleCreateAttendanceRecord = () => {
    if (!sessionId || !selectedClient?.id) {
      notifications.show({
        title: 'Error',
        message: 'Please select a client',
        color: 'red',
        radius: 'md',
        icon: (
          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
            <img src={errorIcon} alt='Error' className='w-4 h-4' />
          </span>
        ),
        withBorder: true,
        autoClose: 3000,
        position: 'top-right',
      });
      return;
    }

    const selectedDate = methods.getValues('date');

    if (!selectedDate) {
      notifications.show({
        title: 'Error',
        message: 'Please select a date',
        color: 'red',
        radius: 'md',
        icon: (
          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
            <img src={errorIcon} alt='Error' className='w-4 h-4' />
          </span>
        ),
        withBorder: true,
        autoClose: 3000,
        position: 'top-right',
      });
      return;
    }

    const formattedDate = moment(selectedDate).format('YYYY-MM-DD');

    console.log('Date information:', {
      sessionStartDate: session?.date,
      selectedDate: selectedDate,
      formattedDate: formattedDate,
      momentParsed: moment(selectedDate).toString(),
    });

    createAttendedSessionMutation.mutate(
      {
        session: sessionId,
        client: selectedClient.id,
        date: formattedDate,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Attendance record created successfully!',
            color: 'green',
            radius: 'md',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
                <img src={successIcon} alt='Success' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: 'top-right',
          });
          close();
          refetchSession();
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to create attendance record. Please try again.',
            color: 'red',
            radius: 'md',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                <img src={errorIcon} alt='Error' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: 'top-right',
          });
          close();
        },
      }
    );
  };

  const handleCreateCancelledSession = () => {
    if (!sessionId || !selectedClient?.id) {
      notifications.show({
        title: 'Error',
        message: 'Please select a client',
        color: 'red',
        radius: 'md',
        icon: (
          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
            <img src={errorIcon} alt='Error' className='w-4 h-4' />
          </span>
        ),
        withBorder: true,
        autoClose: 3000,
        position: 'top-right',
      });
      return;
    }
    const selectedDate = methods.getValues('date');

    if (!selectedDate) {
      notifications.show({
        title: 'Error',
        message: 'Please select a date',
        color: 'red',
        radius: 'md',
        icon: (
          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
            <img src={errorIcon} alt='Error' className='w-4 h-4' />
          </span>
        ),
        withBorder: true,
        autoClose: 3000,
        position: 'top-right',
      });
      return;
    }

    const formattedDate = moment(selectedDate).format('YYYY-MM-DD');

    console.log('Date information:', {
      sessionStartDate: session?.date,
      selectedDate: selectedDate,
      formattedDate: formattedDate,
      momentParsed: moment(selectedDate).toString(),
    });

    createCancelledSessionMutation.mutate(
      {
        session: sessionId,
        client: selectedClient?.id || '',
        date: formattedDate,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Success',
            message: 'Cancelled session created successfully!',
            color: 'green',
            radius: 'md',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-green-200'>
                <img src={successIcon} alt='Success' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: 'top-right',
          });
          close();
          refetchSession();
        },
        onError: () => {
          notifications.show({
            title: 'Error',
            message: 'Failed to create cancelled session. Please try again.',
            color: 'red',
            radius: 'md',
            icon: (
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-red-200'>
                <img src={errorIcon} alt='Error' className='w-4 h-4' />
              </span>
            ),
            withBorder: true,
            autoClose: 3000,
            position: 'top-right',
          });
          close();
        },
      }
    );
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

  const onSubmit = async (
    data: MakeUpSession | AttendedSession | CancelledSession
  ) => {
    console.log(data);
    try {
      if (selectedStatus === 'make_up') {
        handleCreateMakeupSession();
      } else if (selectedStatus === 'attended') {
        handleCreateAttendanceRecord();
      } else if (selectedStatus === 'cancelled') {
        handleCreateCancelledSession();
      }
    } catch (error) {
      console.error(error);
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
      columnHelper.accessor('first_name', {
        header: 'Name',
        cell: (info) => `${info.getValue()} ${info.row.original.last_name}`,
      }),
      columnHelper.accessor('phone_number', {
        header: 'Phone',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('active', {
        header: 'Status',
        cell: (info) => (
          <span
            className={`inline-block px-1 py-1 rounded-lg text-sm text-center min-w-[60px] ${
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
                  <Menu.Item
                    color='#1D9B5E'
                    onClick={() => {
                      setSelectedClient(client);
                      setSelectedStatus('attended');
                      setIsRemovingClient(false);
                      handleAttendanceStatusChange();

                      methods.setValue(
                        'client_name',
                        `${client.first_name} ${client.last_name}`
                      );
                      open();
                    }}
                    className='text-sm'
                    style={{ textAlign: 'center' }}
                  >
                    Attended
                  </Menu.Item>

                  <Menu.Item
                    color='blue'
                    onClick={() => {
                      setSelectedClient(client);
                      setSelectedStatus('make_up');
                      setIsRemovingClient(false);
                      handleAttendanceStatusChange();

                      methods.setValue(
                        'client_name',
                        `${client.first_name} ${client.last_name}`
                      );
                      open();
                    }}
                    className='text-sm'
                    style={{ textAlign: 'center' }}
                  >
                    Make-up
                  </Menu.Item>
                  <Menu.Item
                    color='gray'
                    onClick={() => {
                      setSelectedClient(client);
                      setSelectedStatus('cancelled');
                      setIsRemovingClient(false);
                      handleAttendanceStatusChange();

                      methods.setValue(
                        'client_name',
                        `${client.first_name} ${client.last_name}`
                      );
                      open();
                    }}
                    className='text-sm'
                    style={{ textAlign: 'center' }}
                  >
                    Cancelled
                  </Menu.Item>
                  <Menu.Item
                    color='red'
                    onClick={() => {
                      setSelectedClient(client);
                      setIsRemovingClient(true);
                      setSelectedStatus(null);
                      open();
                    }}
                    className='text-sm'
                    style={{ textAlign: 'center' }}
                  >
                    Remove
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          );
        },
      }),
    ],
    [
      currentSessionId,
      open,
      setSelectedClient,
      setIsMarkingAttended,
      setIsRemovingClient,
      setSelectedStatus,
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
                  {/* repeats  */}
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
                        {sessionAnalytics?.total_clients || 0}
                        <span className='text-lg text-gray-500'>
                          /{session.spots || '∞'}
                        </span>
                      </p>
                      <p className='text-sm'>Total Clients</p>
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
                        data={clients}
                        columns={columns}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        className='mt-4'
                        pageSize={5}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text fw={600} size='lg' color='#1D9B5E'>
            {isRemovingClient
              ? 'Remove Client from Session'
              : selectedStatus === 'attended'
              ? 'Mark as Attended'
              : selectedStatus === 'not_yet'
              ? 'Mark as Not Yet'
              : selectedStatus === 'missed'
              ? 'Mark as Missed'
              : selectedStatus === 'make_up'
              ? 'Reschedule Session'
              : selectedStatus === 'cancelled'
              ? 'Mark as Cancelled'
              : 'Update Attendance Status'}
          </Text>
        }
        centered
        radius='md'
      >
        <div className='space-y-4'>
          <div className=''>
            {/* {selectedStatus === 'make_up' && ( */}
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col w-full justify-start'>
                <FormProvider {...methods}>
                  <div className=' space-y-4'>
                    <Controller
                      name='session_title'
                      control={methods.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label='Session Name'
                          placeholder='Session Name'
                          value={field.value || ''}
                          readOnly
                          style={{
                            backgroundColor: '#80808052',
                            cursor: 'not-allowed',
                          }}
                          onFocus={(e) => {
                            e.target.blur();
                          }}
                        />
                      )}
                    />
                    <Controller
                      name='client_name'
                      control={methods.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label='Client Name'
                          placeholder='Client Name'
                          value={field.value || ''}
                          readOnly
                          style={{
                            backgroundColor: '#80808052',
                            cursor: 'not-allowed',
                          }}
                          onFocus={(e) => {
                            e.target.blur();
                          }}
                        />
                      )}
                    />

                    {selectedStatus === 'make_up' && (
                      <Controller
                        name='original_date'
                        control={methods.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label='Original Date'
                            placeholder='2025/03/12'
                            value={field.value || ''}
                            type='date'
                          />
                        )}
                      />
                    )}
                    <div className=' space-y-4'>
                      {selectedStatus === 'make_up' && (
                        <>
                          <p className='text-base font-medium'>Move to </p>
                          <Controller
                            name='new_date'
                            control={methods.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='New Date'
                                placeholder='2025/03/12'
                                value={field.value || ''}
                                type='date'
                              />
                            )}
                          />
                          <div className='flex gap-2'>
                            <Controller
                              name='new_start_time'
                              control={methods.control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  label='New Start Time'
                                  placeholder='10:00'
                                  value={field.value || ''}
                                  type='time'
                                />
                              )}
                            />
                            <Controller
                              name='new_end_time'
                              control={methods.control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  label='New End Time'
                                  placeholder='12:00'
                                  value={field.value || ''}
                                  type='time'
                                />
                              )}
                            />
                          </div>
                        </>
                      )}
                      {selectedStatus === 'attended' && (
                        <>
                          <Controller
                            name='date'
                            control={methods.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='Date'
                                placeholder='2025/03/12'
                                value={field.value || ''}
                                type='date'
                              />
                            )}
                          />
                        </>
                      )}
                      {selectedStatus === 'cancelled' && (
                        <>
                          <Controller
                            name='date'
                            control={methods.control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                label='Date'
                                placeholder='2025/03/12'
                                value={field.value || ''}
                                type='date'
                              />
                            )}
                          />
                        </>
                      )}
                    </div>
                    <div className='flex justify-end space-x-3 pt-2'>
                      <Button variant='subtle' onClick={close} color='gray'>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (isRemovingClient) {
                            handleRemoveClient();
                          } else {
                            methods.handleSubmit((data) => {
                              onSubmit(data);
                            })();
                          }
                        }}
                        color={isRemovingClient ? 'red' : '#1D9B5E'}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                </FormProvider>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Bulk Action Confirmation Modal */}
      <Modal
        opened={bulkAttendanceOpened}
        onClose={() => {
          closeBulkAttendance();
          setBulkActionType(null);
        }}
        title={
          <Text fw={600} size='lg' color='#1D9B5E'>
            {bulkActionType === 'makeup'
              ? 'Bulk Schedule Make-up'
              : bulkActionType === 'cancellation'
              ? 'Bulk Cancel Attendance'
              : 'Bulk Mark as Attended'}
          </Text>
        }
        centered
        radius='md'
        size={bulkActionType === 'makeup' ? 'md' : 'sm'}
      >
        <FormProvider {...bulkMethods}>
          <form onSubmit={handleBulkFormSubmit(onBulkActionSubmit)}>
            <div className='space-y-4'>
              <Controller
                name='sessionName'
                control={bulkControl}
                render={({ field }) => (
                  <Input
                    {...field}
                    label='Session Name'
                    placeholder='Session Name'
                    readOnly
                    style={{
                      backgroundColor: '#80808052',
                      cursor: 'not-allowed',
                    }}
                    onFocus={(e) => e.target.blur()}
                  />
                )}
              />

              <div className='max-h-40 overflow-y-auto border rounded p-2'>
                <Text size='sm' fw={500} className='mb-2'>
                  Selected Clients ({getSelectedClientIds().length}):
                </Text>
                {getSelectedClientIds().map((clientId, index) => {
                  const client = clients.find(
                    (c: Client) => c.id.toString() === clientId
                  );
                  return client ? (
                    <div
                      key={clientId}
                      className='flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded'
                    >
                      <Text size='sm'>
                        {index + 1}. {client.first_name} {client.last_name}
                      </Text>
                    </div>
                  ) : null;
                })}
              </div>

              {bulkActionType === 'makeup' && (
                <>
                  <Controller
                    name='date'
                    control={bulkControl}
                    rules={{ required: 'Original session date is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label='Original Session Date'
                        type='date'
                      />
                    )}
                  />

                  <Text size='sm' fw={500}>
                    Make-up Session Details
                  </Text>

                  <Controller
                    name='newDate'
                    control={bulkControl}
                    rules={{ required: 'Make-up date is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label='Make-up Date'
                        type='date'
                        min={new Date().toISOString().split('T')[0]}
                      />
                    )}
                  />

                  <div className='grid grid-cols-2 gap-4'>
                    <Controller
                      name='newStartTime'
                      control={bulkControl}
                      rules={{ required: 'Start time is required' }}
                      render={({ field }) => (
                        <Input {...field} label='Start Time' type='time' />
                      )}
                    />
                    <Controller
                      name='newEndTime'
                      control={bulkControl}
                      rules={{
                        required: 'End time is required',
                        validate: (value: string | undefined) => {
                          if (!value) return 'End time is required';
                          if (!newStartTime) return true; // If no start time, skip time comparison

                          // Convert times to minutes since midnight for comparison
                          const [startHours, startMinutes] = newStartTime
                            .split(':')
                            .map(Number);
                          const [endHours, endMinutes] = value
                            .split(':')
                            .map(Number);

                          const startTotal = startHours * 60 + startMinutes;
                          const endTotal = endHours * 60 + endMinutes;

                          if (endTotal <= startTotal) {
                            return 'End time must be after start time';
                          }
                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <Input {...field} label='End Time' type='time' />
                      )}
                    />
                  </div>
                </>
              )}

              {(bulkActionType === 'attendance' || bulkActionType === 'cancellation') && (
                <Controller
                  name='date'
                  control={bulkControl}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => (
                    <Input 
                      {...field} 
                      label={bulkActionType === 'cancellation' ? 'Cancellation Date' : 'Date'} 
                      type='date' 
                    />
                  )}
                />
              )}

              <div className='flex justify-end space-x-3 pt-4'>
                <Button
                  variant='subtle'
                  color='gray'
                  onClick={() => {
                    closeBulkAttendance();
                    setBulkActionType(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  loading={
                    bulkActionType === 'makeup'
                      ? bulkCreateMakeupMutation.isPending
                      : bulkActionType === 'cancellation'
                      ? bulkCancelMutation.isPending
                      : bulkMarkAttendanceMutation.isPending
                  }
                  color='#1D9B5E'
                >
                  {bulkActionType === 'makeup'
                    ? 'Schedule Make-up'
                    : bulkActionType === 'cancellation'
                    ? 'Cancel Attendance'
                    : 'Mark as Attended'}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </Modal>

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
              onClick={() =>
                handleExport(
                  'excel',
                  getSelectedClientIds().map((id) => parseInt(id, 10))
                )
              }
              className='px-6'
              loading={isExporting}
            >
              Export as Excel
            </Button>

            <Button
              variant='outline'
              color='#1D9B5E'
              radius='md'
              onClick={() =>
                handleExport(
                  'csv',
                  getSelectedClientIds().map((id) => parseInt(id, 10))
                )
              }
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
