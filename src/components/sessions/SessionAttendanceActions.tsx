import { useState, useEffect, useCallback } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Text, Button } from '@mantine/core';
import { getSelectedClientIdsWithFallback } from '../../utils/tableUtils';
import { notifications } from '@mantine/notifications';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import moment from 'moment';
import Input from '../common/Input';
import successIcon from '../../assets/icons/success.svg';
import errorIcon from '../../assets/icons/error.svg';
import {
  useRemoveClientFromSession,
  useCreateMakeupSession,
  useCreateAttendedSession,
  useCreateCancelledSession,
  useBulkMarkAttendance,
  useBulkCreateMakeupSessions,
  useBulkCancelSessions,
} from '../../hooks/reactQuery';

interface BulkActionFormValues {
  sessionName: string;
  date: string;
  newDate?: string;
  newStartTime?: string;
  newEndTime?: string;
}

interface SessionAttendanceActionsProps {
  sessionId: string;
  currentSessionId: number;
  clients: any[];
  refetchSession: () => void;
  refetchClients: () => void;
  selectedClient: any;
  setSelectedClient: (client: any) => void;
  rowSelection: Record<string, boolean>;
  setRowSelection: (selection: Record<string, boolean>) => void;
  session: any;
}

export const useSessionAttendanceActions = ({
  sessionId,
  currentSessionId,
  clients,
  refetchSession,
  refetchClients,
  selectedClient,
  rowSelection,
  setRowSelection,
  setSelectedClient,
  session,
}: SessionAttendanceActionsProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [
    bulkAttendanceOpened,
    { open: openBulkAttendance, close: closeBulkAttendance },
  ] = useDisclosure(false);
  const [isRemovingClient, setIsRemovingClient] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [bulkActionType, setBulkActionType] = useState<
    'attendance' | 'makeup' | 'cancellation' | null
  >(null);

  // Mutations
  const removeClientMutation = useRemoveClientFromSession();
  const createMakeupSessionMutation = useCreateMakeupSession();
  const createAttendedSessionMutation = useCreateAttendedSession();
  const createCancelledSessionMutation = useCreateCancelledSession();
  const bulkMarkAttendanceMutation = useBulkMarkAttendance();
  const bulkCreateMakeupMutation = useBulkCreateMakeupSessions();
  const bulkCancelMutation = useBulkCancelSessions();

  // Form for single actions
  const methods = useForm<any>({
    defaultValues: {
      session_title: session?.title || '',
      client_name: selectedClient
        ? `${selectedClient.first_name} ${selectedClient.last_name}`
        : '',
      date: new Date().toISOString().split('T')[0],
      original_date: new Date().toISOString().split('T')[0],
      new_date: new Date().toISOString().split('T')[0],
      new_start_time: '09:00',
      new_end_time: '10:00',
    },
  });

  // Form for bulk actions
  const bulkMethods = useForm<BulkActionFormValues>({
    defaultValues: {
      sessionName: session?.title || '',
      date: new Date().toISOString().split('T')[0],
      newDate: new Date().toISOString().split('T')[0],
      newStartTime: '09:00',
      newEndTime: '10:00',
    },
  });

  const {
    control: bulkControl,
    handleSubmit: handleBulkFormSubmit,
    watch: watchBulk,
    setValue: setBulkValue,
    reset: resetBulkForm,
  } = bulkMethods;

  // Update form values when session changes
  useEffect(() => {
    if (session?.title) {
      setBulkValue('sessionName', session.title);
    }
  }, [session?.title, setBulkValue]);

  const newDate = watchBulk('newDate');
  const newStartTime = watchBulk('newStartTime');
  const newEndTime = watchBulk('newEndTime');

  // Set default times when new date changes
  useEffect(() => {
    if (newDate && !newStartTime) {
      setBulkValue('newStartTime', '09:00');
    }
    if (newDate && !newEndTime) {
      setBulkValue('newEndTime', '10:00');
    }
  }, [newDate, newStartTime, newEndTime, setBulkValue]);

  const getSelectedClientIds = useCallback(() => {
    return getSelectedClientIdsWithFallback(
      rowSelection,
      clients,
      selectedClient
    ).map((id: number) => id.toString());
  }, [rowSelection, clients, selectedClient]);

  const showNotification = (title: string, message: string, color: string) => {
    notifications.show({
      title,
      message,
      color,
      autoClose: 5000,
      withBorder: true,
      position: 'top-right',
      radius: 'md',
      icon: (
        <span
          className={`flex items-center justify-center w-6 h-6 rounded-full bg-${color}-200`}
        >
          <img
            src={color === 'green' ? successIcon : errorIcon}
            alt={color === 'green' ? 'Success' : 'Error'}
            className='w-4 h-4'
          />
        </span>
      ),
    });
  };

  const handleBulkAttendance = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clientIds = getSelectedClientIds();
    if (clientIds.length === 0) {
      showNotification(
        'No clients selected',
        'Please select at least one client to mark as attended',
        'yellow'
      );
      return;
    }
    setBulkActionType('attendance');
    openBulkAttendance();
  };

  const handleBulkMakeup = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clientIds = getSelectedClientIds();
    if (clientIds.length === 0) {
      showNotification(
        'No clients selected',
        'Please select at least one client from the table',
        'red'
      );
      return;
    }
    setBulkActionType('makeup');
    openBulkAttendance();
  };

  const handleBulkCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clientIds = getSelectedClientIds();
    if (clientIds.length === 0) {
      showNotification(
        'No clients selected',
        'Please select at least one client to cancel attendance for',
        'yellow'
      );
      return;
    }
    setBulkActionType('cancellation');
    openBulkAttendance();
  };

  const handleAttendanceStatusChange = () => {
    if (sessionId) {
      methods.setValue(
        'session_title',
        session?.title || `Session ${sessionId}`
      );
    }
  };

  const handleRemoveClient = () => {
    if (!selectedClient || !sessionId) return;

    removeClientMutation.mutate(
      { clientId: selectedClient.id.toString(), sessionId },
      {
        onSuccess: () => {
          showNotification('Success', 'Client removed from session!', 'green');
          close();
          refetchClients();
        },
        onError: () => {
          showNotification(
            'Error',
            'Failed to remove client from session. Please try again.',
            'red'
          );
          close();
          refetchClients();
        },
      }
    );
  };

  const handleCreateMakeupSession = () => {
    if (!sessionId || !selectedClient?.id) {
      showNotification('Error', 'Please select a client', 'red');
      return;
    }

    const originalDate = methods.getValues('original_date');
    const newDate = methods.getValues('new_date');
    const newStartTime = methods.getValues('new_start_time');
    const newEndTime = methods.getValues('new_end_time');

    if (!originalDate || !newDate) {
      showNotification(
        'Error',
        'Please select both original and new dates',
        'red'
      );
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
          showNotification(
            'Success',
            'Makeup session created successfully!',
            'green'
          );
          close();
          refetchSession();
        },
        onError: (error) => {
          showNotification(
            'Error',
            error?.message ||
              'Failed to create makeup session. Please try again.',
            'red'
          );
          close();
        },
      }
    );
  };

  const handleCreateAttendanceRecord = () => {
    if (!sessionId || !selectedClient?.id) {
      showNotification('Error', 'Please select a client', 'red');
      return;
    }

    const selectedDate = methods.getValues('date');
    if (!selectedDate) {
      showNotification('Error', 'Please select a date', 'red');
      return;
    }

    const formattedDate = moment(selectedDate).format('YYYY-MM-DD');

    createAttendedSessionMutation.mutate(
      {
        session: sessionId,
        client: selectedClient.id,
        date: formattedDate,
      },
      {
        onSuccess: () => {
          showNotification(
            'Success',
            'Attendance record created successfully!',
            'green'
          );
          close();
          refetchSession();
        },
        onError: () => {
          showNotification(
            'Error',
            'Failed to create attendance record. Please try again.',
            'red'
          );
          close();
        },
      }
    );
  };

  const handleCreateCancelledSession = () => {
    if (!sessionId || !selectedClient?.id) {
      showNotification('Error', 'Please select a client', 'red');
      return;
    }

    const selectedDate = methods.getValues('date');
    if (!selectedDate) {
      showNotification('Error', 'Please select a date', 'red');
      return;
    }

    const formattedDate = moment(selectedDate).format('YYYY-MM-DD');

    createCancelledSessionMutation.mutate(
      {
        session: sessionId,
        client: selectedClient.id,
        date: formattedDate,
      },
      {
        onSuccess: () => {
          showNotification(
            'Success',
            'Cancelled session created successfully!',
            'green'
          );
          close();
          refetchSession();
        },
        onError: () => {
          showNotification(
            'Error',
            'Failed to create cancelled session. Please try again.',
            'red'
          );
          close();
        },
      }
    );
  };

  const onBulkActionSubmit = async (data: BulkActionFormValues) => {
    const clientIds = getSelectedClientIds();
    if (!clientIds || clientIds.length === 0) {
      showNotification(
        'Error',
        'No clients selected. Please select at least one client.',
        'red'
      );
      return;
    }

    try {
      if (bulkActionType === 'makeup') {
        const formattedOriginalDate = moment(data.date).format('YYYY-MM-DD');
        const formattedNewDate = moment(data.newDate).format('YYYY-MM-DD');

        await bulkCreateMakeupMutation.mutateAsync({
          session: currentSessionId,
          client_ids: clientIds.map((id) => parseInt(id, 10)),
          original_date: formattedOriginalDate,
          new_date: formattedNewDate,
          new_start_time: data.newStartTime || '09:00',
          new_end_time: data.newEndTime || '10:00',
        });

        showNotification(
          'Success',
          `Successfully scheduled make-up for ${clientIds.length} client${
            clientIds.length > 1 ? 's' : ''
          }`,
          'green'
        );
      } else if (bulkActionType === 'cancellation') {
        const formattedDate = moment(data.date).format('YYYY-MM-DD');

        await bulkCancelMutation.mutateAsync({
          session: currentSessionId,
          client_ids: clientIds.map((id) => parseInt(id, 10)),
          date: formattedDate,
        });

        showNotification(
          'Success',
          `Successfully cancelled attendance for ${clientIds.length} client${
            clientIds.length > 1 ? 's' : ''
          }`,
          'green'
        );
      } else {
        const formattedDate = moment(data.date).format('YYYY-MM-DD');

        await bulkMarkAttendanceMutation.mutateAsync({
          sessionId: currentSessionId,
          clientIds: clientIds.map((id) => parseInt(id, 10)),
          date: formattedDate,
        });

        showNotification(
          'Success',
          `Successfully marked ${clientIds.length} client${
            clientIds.length > 1 ? 's' : ''
          } as attended`,
          'green'
        );
      }

      closeBulkAttendance();
      setBulkActionType(null);
      setRowSelection({});
      refetchClients();
      refetchSession();
    } catch (error: any) {
      console.error(`Error in bulk ${bulkActionType}:`, error);
      let errorMessage =
        error.message || `Failed to process ${bulkActionType} action`;

      if (error.response?.data) {
        if (error.response.data.client_ids) {
          const clientError = error.response.data.client_ids[0];
          errorMessage =
            typeof clientError === 'string'
              ? clientError
              : clientError.join(' ');
        } else if (error.response.data.non_field_errors) {
          errorMessage = Array.isArray(error.response.data.non_field_errors)
            ? error.response.data.non_field_errors.join(' ')
            : error.response.data.non_field_errors;
        }
      }

      showNotification('Error', errorMessage, 'red');
    }
  };

  const onSubmit = async (data: any) => {
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

  const openActionModal = (client: any, status: string) => {
    setSelectedClient(client);
    setSelectedStatus(status);
    setIsRemovingClient(false);
    handleAttendanceStatusChange();
    methods.setValue('client_name', `${client.first_name} ${client.last_name}`);
    open();
  };

  return {
    handleBulkAttendance,
    handleBulkMakeup,
    handleBulkCancel,
    openActionModal,
    handleRemoveClient: () => setIsRemovingClient(true),
    isRemovingClient,

    modals: (
      <>
        <Modal
          opened={opened}
          onClose={close}
          title={
            <Text fw={600} size='lg' color='#1D9B5E'>
              {isRemovingClient
                ? 'Remove Client from Session'
                : selectedStatus === 'attended'
                ? 'Mark as Attended'
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
          <FormProvider {...methods}>
            <div className='space-y-4'>
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
                    onFocus={(e) => e.target.blur()}
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
                    onFocus={(e) => e.target.blur()}
                  />
                )}
              />

              {selectedStatus === 'make_up' && (
                <>
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

              {(selectedStatus === 'attended' ||
                selectedStatus === 'cancelled') && (
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
              )}

              <div className='flex justify-end space-x-3 pt-2'>
                <Button variant='subtle' onClick={close} color='gray'>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (isRemovingClient) {
                      handleRemoveClient();
                    } else {
                      methods.handleSubmit(onSubmit)();
                    }
                  }}
                  color={isRemovingClient ? 'red' : '#1D9B5E'}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </FormProvider>
        </Modal>

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
                      (c: any) => c.id.toString() === clientId
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
                            if (!newStartTime) return true;
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

                {(bulkActionType === 'attendance' ||
                  bulkActionType === 'cancellation') && (
                  <Controller
                    name='date'
                    control={bulkControl}
                    rules={{ required: 'Date is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label={
                          bulkActionType === 'cancellation'
                            ? 'Cancellation Date'
                            : 'Date'
                        }
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
      </>
    ),
  };
};
